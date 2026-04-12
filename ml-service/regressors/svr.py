#!/usr/usr/bin/env python3
"""
IR-AIS Regressors — SVR
Support Vector Regression.
"""

from sklearn.svm import SVR

NAME = "SVR"

def build_model(random_state=42, **kwargs):
    """Return a fresh SVR Regressor."""
    # SVR doesn't take random_state by default for RBF, but it's fine
    return SVR(kernel='rbf', C=1.0, epsilon=0.1)
