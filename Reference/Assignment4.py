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

data = pd.read_csv("movie_metadata.csv")
data.info()
print(data.head(5))
data1 = data.drop_duplicates().copy()

num_cols = data1.select_dtypes(include=np.number).columns
for col in num_cols:
    data1[col] = data1[col].fillna(data1[col].median())

cat_cols = data1.select_dtypes(exclude=np.number).columns
for col in cat_cols:
    data1[col] = data1[col].fillna(data1[col].mode()[0])

print(data1.isna().sum())

data1["net_profit"] = data1["gross"] - data1["budget"]

data1["target"] = (data1["net_profit"] > 0).astype(int)

cols_to_drop = ["gross", "budget", "net_profit", "movie_imdb_link", "movie_title", "plot_keywords", "director_name", "actor_1_name", "actor_2_name", "actor_3_name", "color", "language", "aspect_ratio", "facenumber_in_poster", "cast_total_facebook_likes"]
data1 = data1.drop(columns=[col for col in cols_to_drop if col in data1.columns])

plt.figure(figsize=(10, 6))
sns.countplot(x="target", data=data1)
plt.show()

y = data1["target"]
x = data1.drop(["target"], axis=1)

X_train, X_test, Y_train, Y_test = train_test_split(x, y, test_size=0.2, random_state=42)

cat_cols = X_train.select_dtypes(exclude=np.number).columns
for col in cat_cols:
    encoder = TargetEncoder(target_type="binary")
    X_train[col] = encoder.fit_transform(X_train[[col]], Y_train).ravel()
    X_test[col] = encoder.transform(X_test[[col]]).ravel()

plt.figure(figsize=(12, 10))
sns.heatmap(X_train.corr(), annot=True, fmt='.2f', cmap="coolwarm", linewidths=0.5)
plt.show()

corr_matrix = X_train.corr().abs()
upper = corr_matrix.where(np.triu(np.ones(corr_matrix.shape), k=1).astype(bool))
to_drop_corr = [column for column in upper.columns if any(upper[column] > 0.90)]
X_train = X_train.drop(columns=to_drop_corr)
X_test = X_test.drop(columns=to_drop_corr)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)
X_train = pd.DataFrame(X_train_scaled, columns=X_train.columns)
X_test = pd.DataFrame(X_test_scaled, columns=X_test.columns)

rf_params = {'n_estimators': [100, 200], 'max_depth': [6, 10, None], 'min_samples_split': [2, 5], 'min_samples_leaf': [1, 2], 'max_features': ['sqrt', 'log2']}
rf_grid = GridSearchCV(RandomForestClassifier(random_state=42, n_jobs=-1), rf_params, cv=3, scoring='accuracy', n_jobs=-1)
rf_grid.fit(X_train, Y_train)
print(rf_grid.best_params_)
Y_pred_rf = rf_grid.best_estimator_.predict(X_test)
print(accuracy_score(Y_test, Y_pred_rf))
print(classification_report(Y_test, Y_pred_rf))

xgb_params = {'n_estimators': [100, 200], 'max_depth': [4, 6], 'learning_rate': [0.05, 0.1], 'subsample': [0.8, 1.0]}
xgb_grid = GridSearchCV(XGBClassifier(eval_metric='logloss', random_state=42), xgb_params, cv=3, scoring='accuracy', n_jobs=-1)
xgb_grid.fit(X_train, Y_train)
print(xgb_grid.best_params_)
Y_pred_xgb = xgb_grid.best_estimator_.predict(X_test)
print(accuracy_score(Y_test, Y_pred_xgb))
print(classification_report(Y_test, Y_pred_xgb))

ada_params = {'n_estimators': [100, 200], 'learning_rate': [0.01, 0.1, 1.0]}
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
