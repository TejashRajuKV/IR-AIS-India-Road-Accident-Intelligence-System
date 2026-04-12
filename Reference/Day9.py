import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler, TargetEncoder
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, classification_report, roc_curve, auc
from sklearn.ensemble import RandomForestClassifier, AdaBoostClassifier
from xgboost import XGBClassifier

data = pd.read_csv("income_new.csv")
data = data.drop_duplicates().copy()

data["edu_years"] = data["education.num"]
data["net_capital"] = data["capital.gain"] - data["capital.loss"]
data = data.drop(["education.num", "capital.gain", "capital.loss", "fnlwgt"], axis=1)

data["edu_years"] = SimpleImputer(strategy="median").fit_transform(data[["edu_years"]]).ravel()
data["sex"] = SimpleImputer(strategy="most_frequent").fit_transform(data[["sex"]]).ravel()

plt.figure(figsize=(10,6))
sns.countplot(x="income", data=data)
plt.show()

y = data["income"]
x = data.drop(["income"], axis=1)

X_train, X_test, Y_train, Y_test = train_test_split(x, y, test_size=0.2, random_state=42)

cat_cols = X_train.select_dtypes(exclude=np.number).columns
for col in cat_cols:
    encoder = TargetEncoder(target_type="binary")
    X_train[col] = encoder.fit_transform(X_train[[col]], Y_train).ravel()
    X_test[col] = encoder.transform(X_test[[col]]).ravel()

plt.figure(figsize=(12,10))
sns.heatmap(X_train.corr(), annot=True, fmt='.2f', cmap="coolwarm", linewidths=0.5)
plt.show()

scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

rf_params = {'n_estimators': [100, 200],'max_depth': [6, 10, None],'min_samples_split': [2, 5],'min_samples_leaf': [1, 2],'max_features': ['sqrt', 'log2']}
rf_grid = GridSearchCV(RandomForestClassifier(random_state=42, n_jobs=-1), rf_params, cv=3, scoring='accuracy', n_jobs=-1)
rf_grid.fit(X_train, Y_train)
print(rf_grid.best_params_)
Y_pred_rf = rf_grid.best_estimator_.predict(X_test)
print(accuracy_score(Y_test, Y_pred_rf))
print(classification_report(Y_test, Y_pred_rf))

xgb_params = {'n_estimators': [100, 200],'max_depth': [4, 6],'learning_rate': [0.05, 0.1],'subsample': [0.8, 1.0]}
xgb_grid = GridSearchCV(XGBClassifier(eval_metric='logloss', random_state=42), xgb_params, cv=3, scoring='accuracy', n_jobs=-1)
xgb_grid.fit(X_train, Y_train)
print(xgb_grid.best_params_)
Y_pred_xgb = xgb_grid.best_estimator_.predict(X_test)
print(accuracy_score(Y_test, Y_pred_xgb))
print(classification_report(Y_test, Y_pred_xgb))

ada_params = {'n_estimators': [100, 200],'learning_rate': [0.01, 0.1, 1.0]}
ada_grid = GridSearchCV(AdaBoostClassifier(random_state=42), ada_params, cv=3, scoring='accuracy', n_jobs=-1)
ada_grid.fit(X_train, Y_train)
print(ada_grid.best_params_)
Y_pred_ada = ada_grid.best_estimator_.predict(X_test)
print(accuracy_score(Y_test, Y_pred_ada))
print(classification_report(Y_test, Y_pred_ada))

rf_probs = rf_grid.best_estimator_.predict_proba(X_test)[:, 1]
xgb_probs = xgb_grid.best_estimator_.predict_proba(X_test)[:, 1]
ada_probs = ada_grid.best_estimator_.predict_proba(X_test)[:, 1]

fpr_rf, tpr_rf, _ = roc_curve(Y_test, rf_probs)
fpr_xgb, tpr_xgb, _ = roc_curve(Y_test, xgb_probs)
fpr_ada, tpr_ada, _ = roc_curve(Y_test, ada_probs)

auc_rf = auc(fpr_rf, tpr_rf)
auc_xgb = auc(fpr_xgb, tpr_xgb)
auc_ada = auc(fpr_ada, tpr_ada)

plt.figure(figsize=(10, 8))
plt.plot(fpr_rf, tpr_rf, label=f'Random Forest (AUC = {auc_rf:.2f})')
plt.plot(fpr_xgb, tpr_xgb, label=f'XGBoost (AUC = {auc_xgb:.2f})')
plt.plot(fpr_ada, tpr_ada, label=f'AdaBoost (AUC = {auc_ada:.2f})')
plt.plot([0, 1], [0, 1], 'k--')
plt.xlim([0.0, 1.0])
plt.ylim([0.0, 1.05])
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('Receiver Operating Characteristic (ROC) Curve')
plt.legend(loc="lower right")
plt.show()
