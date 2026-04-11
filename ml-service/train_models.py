#!/usr/bin/env python3
"""
IR-AIS ML Training Pipeline
India Road Accident Intelligence System
Trains classification (Accident_severity) and regression (Number_of_casualties) models.
"""

import os
import sys
import json
import warnings
import numpy as np
import pandas as pd
from collections import Counter

from sklearn.model_selection import train_test_split, GridSearchCV, RandomizedSearchCV
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, roc_auc_score, classification_report
)
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from sklearn.linear_model import LogisticRegression, LinearRegression, Ridge
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor

from imblearn.over_sampling import SMOTE
from xgboost import XGBClassifier

import joblib

warnings.filterwarnings("ignore")

# ─── Constants ────────────────────────────────────────────────────────────────
RANDOM_STATE = 42
DATA_PATH = "/home/z/my-project/upload/Road.csv"
MODEL_DIR = "/home/z/my-project/ml-service/models"

TARGET_CLASS = "Accident_severity"
TARGET_REGR = "Number_of_casualties"

LEAKAGE_COLS = [
    "Casualty_class",
    "Sex_of_casualty",
    "Age_band_of_casualty",
    "Casualty_severity",
    "Work_of_casuality",
    "Fitness_of_casuality",
]

os.makedirs(MODEL_DIR, exist_ok=True)


# ─── 1. Data Loading & Preprocessing ─────────────────────────────────────────
def load_and_preprocess():
    print("=" * 60)
    print("IR-AIS ML Training Pipeline")
    print("=" * 60)

    print("\n[1/5] Loading data...")
    df = pd.read_csv(DATA_PATH)
    print(f"  Raw data: {df.shape[0]} rows, {df.shape[1]} columns")

    # ── Replace "na", "unknown", empty strings with NaN ──
    print("\n  Replacing 'na', 'unknown', '' with NaN...")
    df.replace(["na", "Na", "NA", "unknown", "Unknown", ""], np.nan, inplace=True)

    # ── Impute missing categorical values with Mode ──
    print("  Imputing missing values with mode...")
    for col in df.columns:
        if df[col].dtype == "object" and df[col].isnull().sum() > 0:
            mode_val = df[col].mode()[0]
            df[col].fillna(mode_val, inplace=True)

    # ── Extract Hour_of_Day from Time ──
    print("  Extracting Hour_of_Day from Time column...")
    df["Hour_of_Day"] = df["Time"].apply(lambda t: int(str(t).split(":")[0]))
    df.drop(columns=["Time"], inplace=True)

    # ── Drop leakage columns ──
    print(f"  Dropping leakage columns: {LEAKAGE_COLS}")
    df.drop(columns=LEAKAGE_COLS, inplace=True, errors="ignore")

    # ── Separate targets ──
    y_class = df[TARGET_CLASS].copy()
    y_regr = df[TARGET_REGR].copy()
    df.drop(columns=[TARGET_CLASS, TARGET_REGR], inplace=True)

    # ── Encode target for classification ──
    print("  Label encoding classification target...")
    target_encoder = LabelEncoder()
    y_class_encoded = target_encoder.fit_transform(y_class)
    print(f"  Target classes: {dict(zip(target_encoder.classes_, target_encoder.transform(target_encoder.classes_)))}")

    # ── Label encode all categorical features ──
    print("  Label encoding categorical features...")
    label_encoders = {}
    for col in df.columns:
        if df[col].dtype == "object":
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col])
            label_encoders[col] = le

    X = df
    feature_names = list(X.columns)

    print(f"  Final features: {len(feature_names)} columns")
    print(f"  Feature names: {feature_names}")

    # ── Save encoders & feature names ──
    joblib.dump(label_encoders, os.path.join(MODEL_DIR, "label_encoders.pkl"))
    joblib.dump(feature_names, os.path.join(MODEL_DIR, "feature_names.pkl"))
    joblib.dump(target_encoder, os.path.join(MODEL_DIR, "target_encoder.pkl"))

    return X, y_class, y_class_encoded, y_regr, target_encoder, label_encoders, feature_names


# ─── 2. EDA Statistics ───────────────────────────────────────────────────────
def generate_eda(df_raw):
    """Generate EDA statistics from raw data (before encoding)."""
    print("\n  Generating EDA statistics...")

    # Load raw again for EDA (before encoding)
    raw = pd.read_csv(DATA_PATH)
    raw.replace(["na", "Na", "NA", "unknown", "Unknown", ""], np.nan, inplace=True)

    severity_dist = raw[TARGET_CLASS].value_counts().to_dict()

    # Hour distribution
    raw["Hour_of_Day"] = raw["Time"].apply(lambda t: int(str(t).split(":")[0]))
    hour_dist = raw["Hour_of_Day"].value_counts().sort_index().to_dict()
    hour_dist = {str(k): int(v) for k, v in hour_dist.items()}

    # Day distribution
    day_dist = raw["Day_of_week"].value_counts().to_dict()

    # Weather x Severity cross
    weather_sev = raw.groupby("Weather_conditions")[TARGET_CLASS].value_counts().unstack(fill_value=0)
    weather_severity_cross = {}
    for idx in weather_sev.index:
        weather_severity_cross[str(idx)] = {str(col): int(weather_sev.loc[idx, col]) for col in weather_sev.columns}

    # Age band x Severity cross
    age_sev = raw.groupby("Age_band_of_driver")[TARGET_CLASS].value_counts().unstack(fill_value=0)
    age_severity_cross = {}
    for idx in age_sev.index:
        if pd.notna(idx):
            age_severity_cross[str(idx)] = {str(col): int(age_sev.loc[idx, col]) for col in age_sev.columns}

    # Vehicle type distribution
    vehicle_dist = raw["Type_of_vehicle"].value_counts().head(10).to_dict()
    vehicle_type_distribution = {str(k): int(v) for k, v in vehicle_dist.items()}

    # Cause distribution (top 10)
    cause_dist = raw["Cause_of_accident"].value_counts().head(10).to_dict()
    cause_distribution = {str(k): int(v) for k, v in cause_dist.items()}

    eda_data = {
        "severity_distribution": {str(k): int(v) for k, v in severity_dist.items()},
        "hour_distribution": hour_dist,
        "day_distribution": {str(k): int(v) for k, v in day_dist.items()},
        "weather_severity_cross": weather_severity_cross,
        "age_severity_cross": age_severity_cross,
        "vehicle_type_distribution": vehicle_type_distribution,
        "cause_distribution": cause_distribution,
        "total_records": int(len(raw)),
        "feature_count": int(df_raw.shape[1]),
    }

    with open(os.path.join(MODEL_DIR, "eda_data.json"), "w") as f:
        json.dump(eda_data, f, indent=2, default=str)

    print("  EDA data saved.")
    return eda_data


# ─── 3. Classification Task ──────────────────────────────────────────────────
def train_classification(X, y_class, y_class_encoded, target_encoder):
    print("\n" + "=" * 60)
    print("CLASSIFICATION TASK: Accident_severity")
    print("=" * 60)

    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_class_encoded, test_size=0.2, random_state=RANDOM_STATE, stratify=y_class_encoded
    )
    print(f"\n  Train size: {X_train.shape[0]}, Test size: {X_test.shape[0]}")
    print(f"  Class distribution (train): {Counter(y_train)}")

    metrics_all = {}

    # ── 3a. Base Models (no SMOTE) ──
    print("\n--- 3a. Base Models (No SMOTE) ---")

    base_models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=RANDOM_STATE),
        "KNN": KNeighborsClassifier(n_neighbors=5),
        "Decision Tree": DecisionTreeClassifier(max_depth=10, random_state=RANDOM_STATE),
        "Random Forest": RandomForestClassifier(n_estimators=100, random_state=RANDOM_STATE),
    }

    best_f1 = -1
    best_clf_model = None
    best_clf_name = ""

    for name, model in base_models.items():
        print(f"\n  Training {name}...")
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, average="weighted", zero_division=0)
        rec = recall_score(y_test, y_pred, average="weighted", zero_division=0)
        f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)
        cm = confusion_matrix(y_test, y_pred).tolist()

        print(f"    Accuracy: {acc:.4f}, Precision: {prec:.4f}, Recall: {rec:.4f}, F1: {f1:.4f}")

        metrics_all[name] = {
            "accuracy": round(float(acc), 4),
            "precision_weighted": round(float(prec), 4),
            "recall_weighted": round(float(rec), 4),
            "f1_weighted": round(float(f1), 4),
            "confusion_matrix": cm,
            "approach": "base",
        }

        if f1 > best_f1:
            best_f1 = f1
            best_clf_model = model
            best_clf_name = name

    # ── 3b. SMOTE Models ──
    print("\n--- 3b. Optimized with SMOTE ---")
    print("  Applying SMOTE to training data...")

    smote = SMOTE(random_state=RANDOM_STATE)
    X_train_sm, y_train_sm = smote.fit_resample(X_train, y_train)
    print(f"  After SMOTE - Train size: {X_train_sm.shape[0]}, Class distribution: {Counter(y_train_sm)}")

    # Compute scale_pos_weight for XGBoost from original class distribution
    class_counts = Counter(y_train)
    n_samples = len(y_train)
    n_classes = len(class_counts)
    scale_pos_weight = {}
    for cls in class_counts:
        scale_pos_weight[cls] = n_samples / (n_classes * class_counts[cls])
    # For XGBoost multi-class we use a dict, but xgboost accepts a single value for binary.
    # For multi-class we use sample weight or just pass the class weights.
    # Actually XGBoost has `scale_pos_weight` only for binary. For multi-class, we skip it or use sample weights.
    # The task says to use scale_pos_weight calculated from class distribution. We'll compute it for the minority classes
    # and pass it as a list of per-class weights.
    # Actually, for XGBoost multi-class, we can pass `sample_weight` or use the class weight approach.
    # Let's compute weights and pass as sample_weight during fit.
    max_count = max(class_counts.values())
    class_weight_dict = {cls: max_count / count for cls, count in class_counts.items()}

    smote_models = {
        "Logistic Regression (SMOTE)": LogisticRegression(max_iter=1000, random_state=RANDOM_STATE),
        "KNN (SMOTE)": KNeighborsClassifier(n_neighbors=5),
        "Decision Tree (SMOTE)": DecisionTreeClassifier(max_depth=10, random_state=RANDOM_STATE),
        "Random Forest (SMOTE)": RandomForestClassifier(n_estimators=100, random_state=RANDOM_STATE),
    }

    for name, model in smote_models.items():
        print(f"\n  Training {name}...")
        model.fit(X_train_sm, y_train_sm)
        y_pred = model.predict(X_test)

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, average="weighted", zero_division=0)
        rec = recall_score(y_test, y_pred, average="weighted", zero_division=0)
        f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)
        cm = confusion_matrix(y_test, y_pred).tolist()

        # ROC-AUC (OvR) - only if model supports predict_proba
        try:
            y_proba = model.predict_proba(X_test)
            auc = roc_auc_score(y_test, y_proba, multi_class="ovr", average="weighted")
            auc_val = round(float(auc), 4)
        except Exception:
            auc_val = None

        print(f"    Accuracy: {acc:.4f}, Precision: {prec:.4f}, Recall: {rec:.4f}, F1: {f1:.4f}", end="")
        if auc_val is not None:
            print(f", ROC-AUC: {auc_val:.4f}")
        else:
            print()

        entry = {
            "accuracy": round(float(acc), 4),
            "precision_weighted": round(float(prec), 4),
            "recall_weighted": round(float(rec), 4),
            "f1_weighted": round(float(f1), 4),
            "confusion_matrix": cm,
            "approach": "smote",
        }
        if auc_val is not None:
            entry["roc_auc_ovr"] = auc_val

        metrics_all[name] = entry

        if f1 > best_f1:
            best_f1 = f1
            best_clf_model = model
            best_clf_name = name

    # XGBoost with class weights
    print("\n  Training XGBoost (SMOTE + scale_pos_weight)...")
    xgb_clf = XGBClassifier(
        n_estimators=100,
        max_depth=6,
        learning_rate=0.1,
        random_state=RANDOM_STATE,
        use_label_encoder=False,
        eval_metric="mlogloss",
    )

    # Compute sample weights based on class distribution
    sample_weights = np.array([class_weight_dict[yi] for yi in y_train_sm])
    xgb_clf.fit(X_train_sm, y_train_sm, sample_weight=sample_weights)
    y_pred = xgb_clf.predict(X_test)

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average="weighted", zero_division=0)
    rec = recall_score(y_test, y_pred, average="weighted", zero_division=0)
    f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)
    cm = confusion_matrix(y_test, y_pred).tolist()

    try:
        y_proba = xgb_clf.predict_proba(X_test)
        auc = roc_auc_score(y_test, y_proba, multi_class="ovr", average="weighted")
        auc_val = round(float(auc), 4)
    except Exception:
        auc_val = None

    print(f"    Accuracy: {acc:.4f}, Precision: {prec:.4f}, Recall: {rec:.4f}, F1: {f1:.4f}", end="")
    if auc_val is not None:
        print(f", ROC-AUC: {auc_val:.4f}")
    else:
        print()

    xgb_entry = {
        "accuracy": round(float(acc), 4),
        "precision_weighted": round(float(prec), 4),
        "recall_weighted": round(float(rec), 4),
        "f1_weighted": round(float(f1), 4),
        "confusion_matrix": cm,
        "approach": "smote_xgboost",
    }
    if auc_val is not None:
        xgb_entry["roc_auc_ovr"] = auc_val

    metrics_all["XGBoost (SMOTE)"] = xgb_entry

    if f1 > best_f1:
        best_f1 = f1
        best_clf_model = xgb_clf
        best_clf_name = "XGBoost (SMOTE)"

    # ── 3c. Hyperparameter Tuned ──
    print("\n--- 3c. Hyperparameter Tuned (GridSearchCV + SMOTE) ---")
    print("  Tuning Random Forest with GridSearchCV...")

    rf_param_grid = {
        "n_estimators": [50, 100, 200],
        "max_depth": [5, 10, 15, None],
    }

    rf_base = RandomForestClassifier(random_state=RANDOM_STATE)
    grid_search = GridSearchCV(
        rf_base, rf_param_grid, cv=3, scoring="f1_weighted", n_jobs=-1, verbose=0
    )
    grid_search.fit(X_train_sm, y_train_sm)

    print(f"  Best params: {grid_search.best_params_}")
    best_rf = grid_search.best_estimator_

    y_pred = best_rf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average="weighted", zero_division=0)
    rec = recall_score(y_test, y_pred, average="weighted", zero_division=0)
    f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)
    cm = confusion_matrix(y_test, y_pred).tolist()

    print(f"    Accuracy: {acc:.4f}, Precision: {prec:.4f}, Recall: {rec:.4f}, F1: {f1:.4f}")

    metrics_all["Random Forest (Tuned)"] = {
        "accuracy": round(float(acc), 4),
        "precision_weighted": round(float(prec), 4),
        "recall_weighted": round(float(rec), 4),
        "f1_weighted": round(float(f1), 4),
        "confusion_matrix": cm,
        "approach": "tuned_smote",
        "best_params": grid_search.best_params_,
    }

    if f1 > best_f1:
        best_f1 = f1
        best_clf_model = best_rf
        best_clf_name = "Random Forest (Tuned)"

    # ── Save best classifier ──
    print(f"\n  ★ Best Classifier: {best_clf_name} (F1={best_f1:.4f})")
    joblib.dump(best_clf_model, os.path.join(MODEL_DIR, "best_classifier.pkl"))

    # Save metrics
    with open(os.path.join(MODEL_DIR, "classification_metrics.json"), "w") as f:
        json.dump(metrics_all, f, indent=2)

    print("  Classification metrics saved.")
    return metrics_all, best_clf_name, best_f1


# ─── 4. Regression Task ──────────────────────────────────────────────────────
def train_regression(X, y_regr):
    print("\n" + "=" * 60)
    print("REGRESSION TASK: Number_of_casualties")
    print("=" * 60)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y_regr, test_size=0.2, random_state=RANDOM_STATE
    )
    print(f"\n  Train size: {X_train.shape[0]}, Test size: {X_test.shape[0]}")
    print(f"  Target range: {y_regr.min()} - {y_regr.max()}, Mean: {y_regr.mean():.2f}")

    metrics_all = {}

    # ── 4a. Base Models ──
    print("\n--- 4a. Base Models ---")

    base_models = {
        "Linear Regression": LinearRegression(),
        "Ridge Regression": Ridge(alpha=1.0, random_state=RANDOM_STATE),
        "Decision Tree": DecisionTreeRegressor(max_depth=10, random_state=RANDOM_STATE),
        "Random Forest": RandomForestRegressor(n_estimators=100, random_state=RANDOM_STATE),
    }

    best_r2 = -float("inf")
    best_reg_model = None
    best_reg_name = ""

    for name, model in base_models.items():
        print(f"\n  Training {name}...")
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)

        mae = mean_absolute_error(y_test, y_pred)
        mse = mean_squared_error(y_test, y_pred)
        rmse = np.sqrt(mse)
        r2 = r2_score(y_test, y_pred)

        print(f"    MAE: {mae:.4f}, MSE: {mse:.4f}, RMSE: {rmse:.4f}, R²: {r2:.4f}")

        metrics_all[name] = {
            "mae": round(float(mae), 4),
            "mse": round(float(mse), 4),
            "rmse": round(float(rmse), 4),
            "r2": round(float(r2), 4),
            "approach": "base",
        }

        if r2 > best_r2:
            best_r2 = r2
            best_reg_model = model
            best_reg_name = name

    # ── 4b. Hyperparameter Tuned ──
    print("\n--- 4b. Hyperparameter Tuned (RandomizedSearchCV) ---")
    print("  Tuning Random Forest Regressor...")

    rf_param_dist = {
        "n_estimators": [50, 100, 200, 300],
        "max_depth": [5, 10, 15, 20, None],
        "min_samples_split": [2, 5, 10],
    }

    rf_base = RandomForestRegressor(random_state=RANDOM_STATE)
    random_search = RandomizedSearchCV(
        rf_base, rf_param_dist, n_iter=10, cv=3, scoring="r2",
        n_jobs=-1, random_state=RANDOM_STATE, verbose=0
    )
    random_search.fit(X_train, y_train)

    print(f"  Best params: {random_search.best_params_}")
    best_rf_reg = random_search.best_estimator_

    y_pred = best_rf_reg.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, y_pred)

    print(f"    MAE: {mae:.4f}, MSE: {mse:.4f}, RMSE: {rmse:.4f}, R²: {r2:.4f}")

    metrics_all["Random Forest (Tuned)"] = {
        "mae": round(float(mae), 4),
        "mse": round(float(mse), 4),
        "rmse": round(float(rmse), 4),
        "r2": round(float(r2), 4),
        "approach": "tuned",
        "best_params": random_search.best_params_,
    }

    if r2 > best_r2:
        best_r2 = r2
        best_reg_model = best_rf_reg
        best_reg_name = "Random Forest (Tuned)"

    # ── Save best regressor ──
    print(f"\n  ★ Best Regressor: {best_reg_name} (R²={best_r2:.4f})")
    joblib.dump(best_reg_model, os.path.join(MODEL_DIR, "best_regressor.pkl"))

    # Save metrics
    with open(os.path.join(MODEL_DIR, "regression_metrics.json"), "w") as f:
        json.dump(metrics_all, f, indent=2)

    print("  Regression metrics saved.")
    return metrics_all, best_reg_name, best_r2


# ─── 5. Main ─────────────────────────────────────────────────────────────────
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
    ]
    for f in output_files:
        path = os.path.join(MODEL_DIR, f)
        exists = os.path.exists(path)
        size = os.path.getsize(path) if exists else 0
        print(f"     {'✓' if exists else '✗'} {f} ({size:,} bytes)")

    print("\n  Done!")


if __name__ == "__main__":
    main()
