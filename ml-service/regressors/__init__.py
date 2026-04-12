"""
IR-AIS Regressors Package
Registers all regression models for the training pipeline.
"""

from regressors import (
    linear_regression,
    ridge,
    decision_tree,
    random_forest,
)

# All base regression models
BASE_MODELS = [linear_regression, ridge, decision_tree, random_forest]

# Models with hyperparameter tuning support (must have build_tuned_model)
TUNABLE_MODELS = [random_forest]
