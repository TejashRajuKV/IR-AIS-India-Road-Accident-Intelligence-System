#!/usr/bin/env python3
"""
IR-AIS ML Pipeline — EDA Statistics
Generates exploratory data analysis statistics from raw data.
"""

import os
import json
import numpy as np
import pandas as pd

from config import DATA_PATH, MODEL_DIR, TARGET_CLASS


def generate_eda(df_features):
    """
    Generate EDA statistics from raw data (before encoding).

    Parameters
    ----------
    df_features : pd.DataFrame
        The feature matrix (used only for shape info).

    Returns
    -------
    eda_data : dict with distribution and cross-tab statistics.
    """
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
        "feature_count": int(df_features.shape[1]),
    }

    with open(os.path.join(MODEL_DIR, "eda_data.json"), "w") as f:
        json.dump(eda_data, f, indent=2, default=str)

    print("  EDA data saved.")
    return eda_data
