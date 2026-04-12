#!/usr/bin/env python3
"""
IR-AIS ML Training Pipeline — Orchestrator
Runs preprocessing, EDA, classification, and regression training.
Each model is defined in its own file under classifiers/ and regressors/.
"""

import os
import json
import warnings
import numpy as np
from collections import Counter
from sklearn.model_selection import train_test_split
from imblearn.over_sampling import SMOTE
import joblib

from config import RANDOM_STATE, MODEL_DIR, TEST_SIZE
from preprocessing import load_and_preprocess
from eda import generate_eda

import classifiers
from classifiers.base import evaluate as clf_evaluate, print_metrics as clf_print
from classifiers import xgboost_clf

import regressors
from regressors.base import evaluate as reg_evaluate, print_metrics as reg_print

warnings.filterwarnings("ignore")


# ─── Classification Task ─────────────────────────────────────────────────────
def train_classification(X, y_class, y_class_encoded, target_encoder):
    print("\n" + "=" * 60)
    print("CLASSIFICATION TASK: Accident_severity")
    print("=" * 60)

    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_class_encoded, test_size=TEST_SIZE,
        random_state=RANDOM_STATE, stratify=y_class_encoded
    )
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

    # ── 3c. Hyperparameter Tuned ──
    print("\n--- 3c. Hyperparameter Tuned (GridSearchCV + SMOTE) ---")

    for mod in classifiers.TUNABLE_MODELS:
        name = f"{mod.NAME} (Tuned)"
        print(f"  Tuning {mod.NAME} with GridSearchCV...")
        tuned_model, best_params = mod.build_tuned_model(
            X_train_sm, y_train_sm, random_state=RANDOM_STATE
        )
        metrics, f1 = clf_evaluate(tuned_model, X_test, y_test, approach="tuned_smote")
        metrics["best_params"] = best_params
        clf_print(metrics)
        metrics_all[name] = metrics

        if f1 > best_f1:
            best_f1, best_clf_model, best_clf_name = f1, tuned_model, name

    # ── Save best classifier ──
    print(f"\n  ★ Best Classifier: {best_clf_name} (F1={best_f1:.4f})")
    joblib.dump(best_clf_model, os.path.join(MODEL_DIR, "best_classifier.pkl"))

    # Save metrics
    with open(os.path.join(MODEL_DIR, "classification_metrics.json"), "w") as f:
        json.dump(metrics_all, f, indent=2)

    print("  Classification metrics saved.")
    return metrics_all, best_clf_name, best_f1


# ─── Regression Task ──────────────────────────────────────────────────────────
def train_regression(X, y_regr):
    print("\n" + "=" * 60)
    print("REGRESSION TASK: Number_of_casualties")
    print("=" * 60)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y_regr, test_size=TEST_SIZE, random_state=RANDOM_STATE
    )
    print(f"\n  Train size: {X_train.shape[0]}, Test size: {X_test.shape[0]}")
    print(f"  Target range: {y_regr.min()} - {y_regr.max()}, Mean: {y_regr.mean():.2f}")

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

    # ── 4b. Hyperparameter Tuned ──
    print("\n--- 4b. Hyperparameter Tuned (RandomizedSearchCV) ---")

    for mod in regressors.TUNABLE_MODELS:
        name = f"{mod.NAME} (Tuned)"
        print(f"  Tuning {mod.NAME} Regressor...")
        tuned_model, best_params = mod.build_tuned_model(
            X_train, y_train, random_state=RANDOM_STATE
        )
        metrics, r2 = reg_evaluate(tuned_model, X_test, y_test, approach="tuned")
        metrics["best_params"] = best_params
        reg_print(metrics)
        metrics_all[name] = metrics

        if r2 > best_r2:
            best_r2, best_reg_model, best_reg_name = r2, tuned_model, name

    # ── Save best regressor ──
    print(f"\n  ★ Best Regressor: {best_reg_name} (R²={best_r2:.4f})")
    joblib.dump(best_reg_model, os.path.join(MODEL_DIR, "best_regressor.pkl"))

    # Save metrics
    with open(os.path.join(MODEL_DIR, "regression_metrics.json"), "w") as f:
        json.dump(metrics_all, f, indent=2)

    print("  Regression metrics saved.")
    return metrics_all, best_reg_name, best_r2


# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    X, y_class, y_class_encoded, y_regr, target_encoder, label_encoders, feature_names = load_and_preprocess()

    # EDA
    generate_eda(X)

    # Classification
    cls_metrics, best_clf_name, best_clf_f1 = train_classification(
        X, y_class, y_class_encoded, target_encoder
    )

    # Regression
    reg_metrics, best_reg_name, best_reg_r2 = train_regression(X, y_regr)

    # ── Final Summary ──
    print("\n" + "=" * 60)
    print("TRAINING COMPLETE — FINAL SUMMARY")
    print("=" * 60)

    print(f"\n  Dataset: {X.shape[0]} records, {X.shape[1]} features")
    print(f"\n  ── Classification: Accident_severity ──")
    print(f"     Best Model: {best_clf_name}")
    print(f"     Best F1-Score (weighted): {best_clf_f1:.4f}")
    for name, m in cls_metrics.items():
        print(f"     {name}: Acc={m['accuracy']:.4f}, F1={m['f1_weighted']:.4f}")

    print(f"\n  ── Regression: Number_of_casualties ──")
    print(f"     Best Model: {best_reg_name}")
    print(f"     Best R² Score: {best_reg_r2:.4f}")
    for name, m in reg_metrics.items():
        print(f"     {name}: MAE={m['mae']:.4f}, R²={m['r2']:.4f}")

    # ── Save best model names for API routes ──
    best_models_info = {
        "best_classifier_name": best_clf_name,
        "best_classifier_f1": round(best_clf_f1, 4),
        "best_regressor_name": best_reg_name,
        "best_regressor_r2": round(best_reg_r2, 4),
    }
    with open(os.path.join(MODEL_DIR, "best_models.json"), "w") as f:
        json.dump(best_models_info, f, indent=2)

    # List all output files
    print(f"\n  ── Output Files ──")
    output_files = [
        "label_encoders.pkl",
        "feature_names.pkl",
        "target_encoder.pkl",
        "best_classifier.pkl",
        "best_regressor.pkl",
        "classification_metrics.json",
        "regression_metrics.json",
        "eda_data.json",
        "best_models.json",
    ]
    for f in output_files:
        path = os.path.join(MODEL_DIR, f)
        exists = os.path.exists(path)
        size = os.path.getsize(path) if exists else 0
        print(f"     {'✓' if exists else '✗'} {f} ({size:,} bytes)")

    print("\n  Done!")


if __name__ == "__main__":
    main()
