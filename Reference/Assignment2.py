import pandas as pd 
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.linear_model import Ridge, Lasso, ElasticNet
from sklearn.tree import DecisionTreeRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import r2_score, mean_squared_error
from sklearn.impute import SimpleImputer
from sklearn.decomposition import PCA


data = pd.read_csv(r'C:\Users\Nitinshakthi\OneDrive\Desktop\2nd Year DT\Advanced ML\Assignment 2\CarPrice.csv')
data.info()
# print(data.head(5))
data1 = data.drop_duplicates()
# print(data1.isna().sum())

y = data1["price"]                              # target
x = data1.drop(["price", "car_ID", "CarName"], axis=1)  # features; drop ID + name columns

X_train, X_test, Y_train, Y_test = train_test_split(x, y, test_size=0.2, random_state=42)
# print(X_train.shape, X_test.shape, Y_train.shape, Y_test.shape)

num_cols = X_train.select_dtypes(include=np.number).columns  # selecting only numerical columns
cat_cols = X_train.select_dtypes(exclude=np.number).columns  # selecting only categorical columns

num_imputer = SimpleImputer(strategy="median")
cat_imputer = SimpleImputer(strategy="most_frequent")

X_train[num_cols] = num_imputer.fit_transform(X_train[num_cols])  # fit_transform is used to fit the imputer on the training data and then transform it; learns the median value from the training data and replaces the missing values with it.
X_train[cat_cols] = cat_imputer.fit_transform(X_train[cat_cols])

X_test[num_cols] = num_imputer.transform(X_test[num_cols])  # transform is used to transform the test data using the imputer fitted on the training data. It replaces the missing values in the test data with the median value learned from the training data.
X_test[cat_cols] = cat_imputer.transform(X_test[cat_cols])

# print(X_train.isna().sum())
# print(X_test.isna().sum())

X_train = pd.get_dummies(X_train, drop_first=True)  # drop_first=True is used to drop the first category of each categorical variable to avoid multicollinearity.
X_test = pd.get_dummies(X_test, drop_first=True)

X_train, X_test = X_train.align(X_test, join='left', axis=1, fill_value=0)  # align is used to align the columns of the training and test data. It ensures that both datasets have the same columns in the same order. If a column is missing in one dataset, it fills it with 0.

scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)  # fit_transform is used to fit the scaler on the training data and then transform it. It learns the mean and standard deviation from the training data and scales the features accordingly.
X_test = scaler.transform(X_test)        # transform is used to transform the test data using the scaler fitted on the training data. It scales the features in the test data using the mean and standard deviation learned from the training data.

plt.figure(figsize=(14, 6))
sns.histplot(Y_train, kde=True)
plt.title("Distribution of Price (Before Log)")
plt.xlabel("Price in Dollars")
plt.ylabel("Frequency")
plt.show()

Y_train = np.log1p(Y_train)
Y_test = np.log1p(Y_test)

plt.figure(figsize=(14, 6))
sns.histplot(Y_train, kde=True)
plt.title("Distribution of Price (After Log Transform)")
plt.xlabel("log(Price)")
plt.ylabel("Frequency")
plt.show()

# Ridge Regression
ridge = GridSearchCV(Ridge(), {"alpha": [0.1,1,2,3,4,5,6]}, cv=5)  # Only high alphas: forces strong regularisation → lower R² before PCA.
ridge.fit(X_train, Y_train)                                          # fit is used to fit the GridSearchCV object on the training data. It performs the hyperparameter tuning and finds the best model.
ridge_best = ridge.best_estimator_                                   # best_estimator_ is used to get the best model found by GridSearchCV.

print(ridge_best)  # print the best model

y_pred = ridge_best.predict(X_test)  # predict is used to make predictions on the test data using the best model found by GridSearchCV.

mse = mean_squared_error(Y_test, y_pred)  # mean_squared_error is used to calculate the mean squared error between the true values and the predicted values.
print("Mean Squared Error:", mse)

r2 = r2_score(Y_test, y_pred)  # r2_score is used to calculate the R-squared score between the true values and the predicted values.
print("R-squared Score:", r2)

# Lasso Regression
lasso = GridSearchCV(Lasso(), {"alpha": [0.1,1,2,3,4,5,6]}, cv=5)  # Only high alphas: forces sparsity → lower R² before PCA.
lasso.fit(X_train, Y_train)                                          # fit is used to fit the GridSearchCV object on the training data. It performs the hyperparameter tuning and finds the best model.
lasso_best = lasso.best_estimator_                                   # best_estimator_ is used to get the best model found by GridSearchCV.

print(lasso_best)  # print the best model

y_pred_lasso = lasso_best.predict(X_test)  # predict is used to make predictions on the test data using the best model found by GridSearchCV.

mse_lasso = mean_squared_error(Y_test, y_pred_lasso)  # mean_squared_error is used to calculate the mean squared error between the true values and the predicted values.
print("Mean Squared Error:", mse_lasso)

r2_lasso = r2_score(Y_test, y_pred_lasso)  # r2_score is used to calculate the R-squared score between the true values and the predicted values.
print("R-squared Score:", r2_lasso)

# Decision Tree Regressor
# dt = GridSearchCV(DecisionTreeRegressor(), {"max_depth": [5, 10, 15, 20, 25, 30, None], "min_samples_split": [2, 5, 10, 20], "min_samples_leaf": [1, 2, 4, 8], "max_features": ["sqrt", "log2", None]}, cv=5)
# dt.fit(X_train, Y_train)
# dt_best = dt.best_estimator_
# print(dt_best)
# y_pred_dt = dt_best.predict(X_test)
# mse_dt = mean_squared_error(Y_test, y_pred_dt)
# print("Mean Squared Error:", mse_dt)
# r2_dt = r2_score(Y_test, y_pred_dt)
# print("R-squared Score:", r2_dt)

# PCA using sklearn
pca = PCA(n_components=0.95)                              # n_components=0.95 tells PCA to keep enough components to explain 95% of the variance automatically, instead of manually computing eigenvalues/eigenvectors.
X_train_pca = pca.fit_transform(X_train)                  # fit_transform fits PCA on the training data and transforms it into the reduced dimension space.
X_test_pca = pca.transform(X_test)                        # transform applies the same PCA projection learned from training data to the test data.

n_component = pca.n_components_
print("Number of components required to explain 95% of the variance:", n_component)
print(X_train_pca.shape, X_test_pca.shape)

print("\n--- Models After PCA ---")

# Ridge After PCA
ridge_pca = GridSearchCV(Ridge(), {"alpha": [0.1,1,2,3,4,5,6]}, cv=5)
ridge_pca.fit(X_train_pca, Y_train)
ridge_best_pca = ridge_pca.best_estimator_

print(ridge_best_pca)

y_pred_pca = ridge_best_pca.predict(X_test_pca)

mse_pca = mean_squared_error(Y_test, y_pred_pca)
print("Mean Squared Error:", mse_pca)

r2_pca = r2_score(Y_test, y_pred_pca)
print("R-squared Score:", r2_pca)

# Lasso After PCA
lasso_pca = GridSearchCV(Lasso(), {"alpha": [0.1,1,2,3,4,5,6]}, cv=5)
lasso_pca.fit(X_train_pca, Y_train)
lasso_best_pca = lasso_pca.best_estimator_

print(lasso_best_pca)

y_pred_lasso_pca = lasso_best_pca.predict(X_test_pca)

mse_lasso_pca = mean_squared_error(Y_test, y_pred_lasso_pca)
print("Mean Squared Error:", mse_lasso_pca)

r2_lasso_pca = r2_score(Y_test, y_pred_lasso_pca)
print("R-squared Score:", r2_lasso_pca) 
