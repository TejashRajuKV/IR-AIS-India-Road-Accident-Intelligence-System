#!/usr/bin/env python3
"""
IR-AIS Regressor — Decision Tree
Single CART regression tree with depth limiting.
"""

from sklearn.tree import DecisionTreeRegressor

NAME = "Decision Tree"


def build_model(max_depth=10, random_state=42, **kwargs):
    """Return a fresh Decision Tree Regressor."""
    return DecisionTreeRegressor(max_depth=max_depth, random_state=random_state)
