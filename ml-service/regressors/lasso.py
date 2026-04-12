#!/usr/usr/bin/env python3
"""
IR-AIS Regressors — Lasso
L1 Regularized linear regression.
"""

from sklearn.linear_model import Lasso

NAME = "Lasso"

def build_model(random_state=42, **kwargs):
    """Return a fresh Lasso Regressor."""
    return Lasso(alpha=1.0, random_state=random_state)
