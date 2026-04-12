import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn import svm
from sklearn.metrics import accuracy_score, classification_report

data = pd.read_csv(r'C:\Users\Nitinshakthi\OneDrive\Desktop\2nd Year DT\Advanced ML\Assignment 3\vgsales.csv')
data.info()
# print(data.head(5))
data1 = data.drop_duplicates()
# print(data1.isna().sum())

data1['sales_class'] = (data1['Global_Sales'] > 1.0).astype(int)

y = data1['sales_class']
x = data1.drop(['sales_class', 'Global_Sales', 'Rank', 'Name', 'NA_Sales','EU_Sales','JP_Sales','Other_Sales'], axis=1)
# print(x)
# print(y)

X_train, X_test, Y_train, Y_test = train_test_split(x, y, test_size=0.2, random_state=42)

X_train['Publisher'] = X_train['Publisher'].fillna('Other')
X_test['Publisher']  = X_test['Publisher'].fillna('Other')

median_year = X_train['Year'].median()
X_train['Year'] = X_train['Year'].fillna(median_year)
X_test['Year']  = X_test['Year'].fillna(median_year)

X_train['era'] = pd.cut(X_train['Year'], bins=[0, 1990, 2000, 2005, 2010, 2020], labels=[0, 1, 2, 3, 4])
X_train['era'] = X_train['era'].astype(float)
X_test['era']  = pd.cut(X_test['Year'],  bins=[0, 1990, 2000, 2005, 2010, 2020], labels=[0, 1, 2, 3, 4])
X_test['era']  = X_test['era'].astype(float)

top_publishers = ['Nintendo', 'Electronic Arts', 'Activision', 'Sony Computer Entertainment','Ubisoft', 'Take-Two Interactive', 'THQ', 'Konami Digital Entertainment','Sega', 'Namco Bandai Games', 'Capcom', 'Microsoft Game Studios','Square Enix', 'Warner Bros. Interactive Entertainment']
X_train['Publisher'] = X_train['Publisher'].apply(lambda p: p if p in top_publishers else 'Other')
X_test['Publisher']  = X_test['Publisher'].apply(lambda p: p if p in top_publishers else 'Other')

X_train = pd.get_dummies(X_train, columns=['Platform', 'Genre', 'Publisher'], drop_first=True)
X_test  = pd.get_dummies(X_test,  columns=['Platform', 'Genre', 'Publisher'], drop_first=True)

X_train, X_test = X_train.align(X_test, join='left', axis=1, fill_value=0)

X_train = X_train.copy()
X_test  = X_test.copy()

scaler  = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test  = scaler.transform(X_test)

param_grid_rbf = {'C': [0.1, 1.0, 10.0], 'gamma': ['scale', 'auto', 0.01], 'kernel': ['rbf']}
grid_rbf = GridSearchCV(SVC(random_state=42), param_grid_rbf, cv=5, scoring='accuracy', n_jobs=-1)
grid_rbf.fit(X_train, Y_train)

print("Best Params (RBF SVC) :", grid_rbf.best_params_)
Y_pred_rbf = grid_rbf.best_estimator_.predict(X_test)
print("Accuracy  (RBF SVC)  :", accuracy_score(Y_test, Y_pred_rbf))
print(classification_report(Y_test, Y_pred_rbf))

param_grid_poly = {'C': [0.1, 1.0, 10.0], 'degree': [2, 3], 'gamma': ['scale', 'auto'], 'kernel': ['poly']}
grid_poly = GridSearchCV(svm.SVC(random_state=42), param_grid_poly, cv=5, scoring='accuracy', n_jobs=-1)
grid_poly.fit(X_train, Y_train)

print("Best Params (Poly SVM):", grid_poly.best_params_)
Y_pred_poly = grid_poly.best_estimator_.predict(X_test)
print("Accuracy  (Poly SVM) :", accuracy_score(Y_test, Y_pred_poly))
print(classification_report(Y_test, Y_pred_poly))
