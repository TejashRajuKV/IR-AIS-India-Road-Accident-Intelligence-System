#!/usr/bin/env python3
"""
IR-AIS ML Training Pipeline — Orchestrator
Runs preprocessing, EDA, dimensionality reduction, clustering, 
classification, and regression training.
"""

import os
import json
import warnings
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from collections import Counter
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import roc_curve, auc
from imblearn.over_sampling import SMOTE
import joblib

from config import RANDOM_STATE, MODEL_DIR, OUTPUT_DIR, TEST_SIZE
from preprocessing import load_and_preprocess
from eda import generate_eda

import classifiers
from classifiers.base import evaluate as clf_evaluate, print_metrics as clf_print
from classifiers import xgboost_clf, random_forest, decision_tree, adaboost

import regressors
from regressors.base import evaluate as reg_evaluate, print_metrics as reg_print

import clustering
from clustering.base import evaluate_clustering, print_metrics as clust_print

from dimensionality import pca

warnings.filterwarnings("ignore")


# ─── Classification Task ─────────────────────────────────────────────────────
def train_classification(X_train, X_test, y_train, y_test, suffix=""):
    print("\n" + "=" * 60)
    print(f"CLASSIFICATION TASK: Accident_severity {suffix}")
    print("=" * 60)

    print(f"\n  Train size: {X_train.shape[0]}, Test size: {X_test.shape[0]}")
    print(f"  Class distribution (train): {Counter(y_train)}")

    metrics_all = {}
    best_f1 = -1
    best_clf_model = None
    best_clf_name = ""

    # ── 3a. Base Models (no SMOTE) ──
    print("\n--- 3a. Base Models (No SMOTE) ---")

    for mod in classifiers.BASE_MODELS:
        name = mod.NAME
        print(f"\n  Training {name}...")
        model = mod.build_model(random_state=RANDOM_STATE)
        model.fit(X_train, y_train)
        metrics, f1 = clf_evaluate(model, X_test, y_test, approach="base")
        clf_print(metrics)
        metrics_all[name] = metrics

        if f1 > best_f1:
            best_f1, best_clf_model, best_clf_name = f1, model, name

    # ── 3b. SMOTE Models ──
    print("\n--- 3b. Optimized with SMOTE ---")
    print("  Applying SMOTE to training data...")

    smote = SMOTE(random_state=RANDOM_STATE)
    X_train_sm, y_train_sm = smote.fit_resample(X_train, y_train)
    print(f"  After SMOTE - Train size: {X_train_sm.shape[0]}, Class distribution: {Counter(y_train_sm)}")

    for mod in classifiers.SMOTE_MODELS:
        name = f"{mod.NAME} (SMOTE)"
        print(f"\n  Training {name}...")
        model = mod.build_model(random_state=RANDOM_STATE)
        model.fit(X_train_sm, y_train_sm)
        metrics, f1 = clf_evaluate(model, X_test, y_test, approach="smote")
        clf_print(metrics)
        metrics_all[name] = metrics

        if f1 > best_f1:
            best_f1, best_clf_model, best_clf_name = f1, model, name

    # ── XGBoost with sample weights ──
    print(f"\n  Training {xgboost_clf.NAME} (SMOTE + scale_pos_weight)...")
    class_weight_dict = xgboost_clf.compute_sample_weights(y_train)
    sample_weights = xgboost_clf.get_sample_weight_array(y_train_sm, class_weight_dict)

    xgb_model = xgboost_clf.build_model(random_state=RANDOM_STATE)
    xgb_model.fit(X_train_sm, y_train_sm, sample_weight=sample_weights)
    metrics, f1 = clf_evaluate(xgb_model, X_test, y_test, approach="smote_xgboost")
    clf_print(metrics)
    metrics_all["XGBoost (SMOTE)"] = metrics

    if f1 > best_f1:
        best_f1, best_clf_model, best_clf_name = f1, xgb_model, "XGBoost (SMOTE)"

    # ── Save best classifier ──
    print(f"\n  * Best Classifier {suffix}: {best_clf_name} (F1={best_f1:.4f})")
    
    file_name = f"classification_metrics{'_pca' if 'PCA' in suffix else ''}.json"
    joblib.dump(best_clf_model, os.path.join(MODEL_DIR, f"best_classifier{'_pca' if 'PCA' in suffix else ''}.pkl"))

    with open(os.path.join(MODEL_DIR, file_name), "w") as f:
        json.dump(metrics_all, f, indent=2)

    return metrics_all, best_clf_name, best_f1


# ─── Regression Task ──────────────────────────────────────────────────────────
def train_regression(X_train, X_test, y_train, y_test, suffix=""):
    print("\n" + "=" * 60)
    print(f"REGRESSION TASK: Number_of_casualties {suffix}")
    print("=" * 60)

    print(f"\n  Train size: {X_train.shape[0]}, Test size: {X_test.shape[0]}")
    print(f"  Target range: {y_train.min()} - {y_train.max()}, Mean: {y_train.mean():.2f}")

    metrics_all = {}
    best_r2 = -float("inf")
    best_reg_model = None
    best_reg_name = ""

    # ── 4a. Base Models ──
    print("\n--- 4a. Base Models ---")

    for mod in regressors.BASE_MODELS:
        name = mod.NAME
        print(f"\n  Training {name}...")
        model = mod.build_model(random_state=RANDOM_STATE)
        model.fit(X_train, y_train)
        metrics, r2 = reg_evaluate(model, X_test, y_test, approach="base")
        reg_print(metrics)
        metrics_all[name] = metrics

        if r2 > best_r2:
            best_r2, best_reg_model, best_reg_name = r2, model, name

    # ── Save best regressor ──
    print(f"\n  * Best Regressor {suffix}: {best_reg_name} (R²={best_r2:.4f})")
    
    file_name = f"regression_metrics{'_pca' if 'PCA' in suffix else ''}.json"
    joblib.dump(best_reg_model, os.path.join(MODEL_DIR, f"best_regressor{'_pca' if 'PCA' in suffix else ''}.pkl"))

    with open(os.path.join(MODEL_DIR, file_name), "w") as f:
        json.dump(metrics_all, f, indent=2)

    return metrics_all, best_reg_name, best_r2


# ─── Clustering Task ──────────────────────────────────────────────────────────
def train_clustering(X):
    print("\n" + "=" * 60)
    print("CLUSTERING TASK: Unsupervised Target Inference")
    print("=" * 60)
    
    metrics_all = {}
    
    for mod in clustering.MODELS:
        name = mod.NAME
        print(f"\n  Training {name}...")
        model = mod.build_model(random_state=RANDOM_STATE)
        
        if name == "K-Means":
            labels = model.fit_predict(X)
        else:
            labels = model.fit_predict(X)
            
        metrics = evaluate_clustering(X, labels, approach="base")
        clust_print(metrics)
        metrics_all[name] = metrics
        
    with open(os.path.join(MODEL_DIR, "clustering_metrics.json"), "w") as f:
        json.dump(metrics_all, f, indent=2)
        
    return metrics_all


# ─── Ensemble Comparison (Day9 Style) ─────────────────────────────────────────
def compare_ensembles(X_train, X_test, y_train, y_test):
    print("\n" + "=" * 60)
    print("ENSEMBLE COMPARISON: DECISION TREE vs RANDOM FOREST vs ALL BOOSTING")
    print("=" * 60)

    models_to_compare = {
        "Decision Tree": decision_tree.build_model(random_state=RANDOM_STATE),
        "Random Forest": random_forest.build_model(random_state=RANDOM_STATE),
        "AdaBoost": adaboost.build_model(random_state=RANDOM_STATE),
        "XGBoost": xgboost_clf.build_model(random_state=RANDOM_STATE)
    }

    plt.figure(figsize=(10, 8))
    
    for name, model in models_to_compare.items():
        print(f"  Evaluating {name} for comparison...")
        model.fit(X_train, y_train)
        
        # We need probabilities for ROC, if target is multiclass, we use OvR conceptually
        # But for ROC plotting typically we do binary. If our target is multi-class, we plot macro-average
        try:
            y_probs = model.predict_proba(X_test)
            
            # Simple check, if binary: probability of class 1. If multi-class, compute macro average AUC
            n_classes = y_probs.shape[1]
            if n_classes == 2:
                y_prob_1 = y_probs[:, 1]
                fpr, tpr, _ = roc_curve(y_test, y_prob_1)
                roc_auc = auc(fpr, tpr)
                plt.plot(fpr, tpr, label=f'{name} (AUC = {roc_auc:.2f})')
            else:
                # Approximate macro ROC for multi-class just to have a plot line
                from sklearn.preprocessing import label_binarize
                y_test_bin = label_binarize(y_test, classes=np.unique(y_test))
                fpr, tpr, _ = roc_curve(y_test_bin.ravel(), y_probs.ravel())
                roc_auc = auc(fpr, tpr)
                plt.plot(fpr, tpr, label=f'{name} (Micro-AUC = {roc_auc:.2f})')
                
        except Exception as e:
            print(f"    Skipping ROC for {name}: {str(e)}")

    plt.plot([0, 1], [0, 1], 'k--')
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('ROC Curve: Ensembles vs Trees')
    plt.legend(loc="lower right")
    
    plot_path = os.path.join(OUTPUT_DIR, "ensemble_comparison_roc.png")
    plt.savefig(plot_path, bbox_inches='tight', dpi=300)
    plt.close()
    
    print(f"  Saved comparison plot to {plot_path}")


# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    X_raw, y_class, y_class_encoded, y_regr, target_encoder, label_encoders, feature_names = load_and_preprocess()

    # EDA
    generate_eda(X_raw)

    print("\n" + "=" * 60)
    print("GLOBAL PREPROCESSING: Scaling Data")
    print("=" * 60)
    
    # Scale Data Universal
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_raw)
    
    joblib.dump(scaler, os.path.join(MODEL_DIR, "scaler.pkl"))

    # Train/Test Splits
    X_train, X_test, y_class_train, y_class_test = train_test_split(
        X_scaled, y_class_encoded, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y_class_encoded
    )
    
    X_train_r, X_test_r, y_regr_train, y_regr_test = train_test_split(
        X_scaled, y_regr, test_size=TEST_SIZE, random_state=RANDOM_STATE
    )

    # ── PHASE 1: Baseline Models ──
    cls_metrics, best_clf_name, best_clf_f1 = train_classification(X_train, X_test, y_class_train, y_class_test, "(Native Features)")
    reg_metrics, best_reg_name, best_reg_r2 = train_regression(X_train_r, X_test_r, y_regr_train, y_regr_test, "(Native Features)")

    # ── PHASE 2: Dimensionality Reduction ──
    print("\n" + "=" * 60)
    print("DIMENSIONALITY REDUCTION TASK: PCA")
    print("=" * 60)
    # Fit PCA on scaled original data
    X_pca, pca_model = pca.apply_pca(X_scaled, n_components=2)
    joblib.dump(pca_model, os.path.join(MODEL_DIR, "pca_model.pkl"))
    
    plot_path = pca.save_pca_plot(X_pca, y_class_encoded, OUTPUT_DIR, target_encoder)
    print(f"  PCA Variance Explained by 2 components: {sum(pca_model.explained_variance_ratio_):.4f}")
    print(f"  Saved 2D configuration plot to {plot_path}")

    X_train_pca, X_test_pca, y_class_train_pca, y_class_test_pca = train_test_split(
        X_pca, y_class_encoded, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y_class_encoded
    )
    
    X_train_r_pca, X_test_r_pca, y_regr_train_pca, y_regr_test_pca = train_test_split(
        X_pca, y_regr, test_size=TEST_SIZE, random_state=RANDOM_STATE
    )

    # ── PHASE 3: PCA Reduced Models ──
    train_classification(X_train_pca, X_test_pca, y_class_train_pca, y_class_test_pca, "(PCA Reduced)")
    train_regression(X_train_r_pca, X_test_r_pca, y_regr_train_pca, y_regr_test_pca, "(PCA Reduced)")

    # ── PHASE 4: Clustering ──
    train_clustering(X_scaled)

    # ── PHASE 5: Ensemble Comparisons ──
    compare_ensembles(X_train, X_test, y_class_train, y_class_test)

    # ── Generative Report Trigger ──
    print("\n" + "=" * 60)
    print("Generating Analytical Post-run Report...")
    print("=" * 60)
    
    try:
        import report_generator
        report_generator.generate_final_report()
        print("  Successfully generated project_analysis_report.md")
    except Exception as e:
        print(f"  Warning: Report generation failed: {str(e)}")

    # Save summary 
    best_models_info = {
        "best_classifier_name": best_clf_name,
        "best_classifier_f1": round(best_clf_f1, 4),
        "best_regressor_name": best_reg_name,
        "best_regressor_r2": round(best_reg_r2, 4),
    }
    with open(os.path.join(MODEL_DIR, "best_models.json"), "w") as f:
        json.dump(best_models_info, f, indent=2)

    print("\nTraining Pipeline Complete!")

if __name__ == "__main__":
    main()
