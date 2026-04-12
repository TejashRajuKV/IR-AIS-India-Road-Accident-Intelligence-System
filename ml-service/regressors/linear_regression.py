#!/usr/bin/env python3
"""
IR-AIS Regressor — Linear Regression
Ordinary Least Squares linear regression.
"""

from sklearn.linear_model import LinearRegression

NAME = "Linear Regression"


def build_model(**kwargs):
    """Return a fresh Linear Regression model."""
    return LinearRegression()
