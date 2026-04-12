#!/usr/bin/env python3
"""
IR-AIS Prediction Helper
Loads trained models and makes predictions on new data.
"""

import os
import numpy as np
import pandas as pd
import joblib

from config import MODEL_DIR


def _load_artifacts():
    """Load all saved artifacts needed for prediction."""
    label_encoders = joblib.load(os.path.join(MODEL_DIR, "label_encoders.pkl"))
    feature_names = joblib.load(os.path.join(MODEL_DIR, "feature_names.pkl"))
    target_encoder = joblib.load(os.path.join(MODEL_DIR, "target_encoder.pkl"))
    classifier = joblib.load(os.path.join(MODEL_DIR, "best_classifier.pkl"))
    regressor = joblib.load(os.path.join(MODEL_DIR, "best_regressor.pkl"))
    return label_encoders, feature_names, target_encoder, classifier, regressor


def _transform_features(features_dict: dict, label_encoders: dict, feature_names: list) -> pd.DataFrame:
    """
    Transform raw feature dict into a numeric DataFrame using saved LabelEncoders.
    Handles unknown categories by mapping to the most frequent (index 0).
    """
    row = {}
    for col in feature_names:
        val = features_dict.get(col)
        if col in label_encoders:
            le = label_encoders[col]
            try:
                encoded = le.transform([val])[0]
            except (ValueError, TypeError):
                # Unknown category → map to most frequent class (index 0)
                encoded = 0
            row[col] = encoded
        else:
            # Numeric feature — pass through
            row[col] = float(val) if val is not None else 0.0
    return pd.DataFrame([row], columns=feature_names)


def classify(features_dict: dict) -> dict:
    """
    Takes a dict of feature values, transforms using saved encoders,
    and returns a prediction with probabilities.

    Parameters
    ----------
    features_dict : dict
        Feature names → values. Must contain all feature columns used in training.
        For the Time column, provide the raw time string; it will not be used
        (Hour_of_Day is expected instead, extracted during training).
        The keys should match the feature_names used during training.

    Returns
    -------
    dict with keys:
        - prediction: str, the predicted severity label
        - prediction_encoded: int, the encoded class
        - probabilities: dict mapping class labels to probabilities
        - confidence: float, probability of the predicted class
    """
    label_encoders, feature_names, target_encoder, classifier, _ = _load_artifacts()

    X = _transform_features(features_dict, label_encoders, feature_names)
    y_pred_encoded = classifier.predict(X)[0]
    prediction_label = target_encoder.inverse_transform([y_pred_encoded])[0]

    # Probabilities
    try:
        y_proba = classifier.predict_proba(X)[0]
        class_labels = target_encoder.inverse_transform(np.arange(len(y_proba)))
        probabilities = {str(label): round(float(prob), 4) for label, prob in zip(class_labels, y_proba)}
        confidence = round(float(y_proba[y_pred_encoded]), 4)
    except Exception:
        probabilities = None
        confidence = None

    return {
        "prediction": str(prediction_label),
        "prediction_encoded": int(y_pred_encoded),
        "probabilities": probabilities,
        "confidence": confidence,
    }


def regress(features_dict: dict) -> dict:
    """
    Takes a dict of feature values, transforms using saved encoders,
    and returns the predicted casualty count.

    Parameters
    ----------
    features_dict : dict
        Feature names → values.

    Returns
    -------
    dict with keys:
        - prediction: float, predicted number of casualties
        - prediction_rounded: int, rounded to nearest integer
    """
    label_encoders, feature_names, target_encoder, classifier, regressor = _load_artifacts()

    X = _transform_features(features_dict, label_encoders, feature_names)
    y_pred = regressor.predict(X)[0]

    return {
        "prediction": round(float(y_pred), 4),
        "prediction_rounded": int(round(y_pred)),
    }


# ── CLI helper for quick testing ──────────────────────────────────────────────
if __name__ == "__main__":
    print("IR-AIS Prediction Helper")
    print("Usage:")
    print("  from predict import classify, regress")
    print("  result = classify({...})")
    print("  result = regress({...})")
    print()
    print("Example features:")
    print("  features = {")
    print("      'Day_of_week': 'Monday',")
    print("      'Age_band_of_driver': '18-30',")
    print("      'Sex_of_driver': 'Male',")
    print("      'Hour_of_Day': 17,")
    print("      ...}")
