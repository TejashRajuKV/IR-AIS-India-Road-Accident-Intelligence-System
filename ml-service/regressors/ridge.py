#!/usr/bin/env python3
"""
IR-AIS Regressor — Ridge Regression
L2-regularized linear regression.
"""

from sklearn.linear_model import Ridge

NAME = "Ridge Regression"


def build_model(alpha=1.0, random_state=42, **kwargs):
    """Return a fresh Ridge Regression model."""
    return Ridge(alpha=alpha, random_state=random_state)
