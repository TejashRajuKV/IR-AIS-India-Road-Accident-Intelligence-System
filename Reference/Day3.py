import pandas as pd 
import numpy as np

from sklearn.model_selection import train_test_split,GridSearchCV
from sklearn.linear_model import Ridge,Lasso,ElasticNet
from sklearn.tree import DecisionTreeRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import r2_score,mean_squared_error
from sklearn.impute import SimpleImputer

data = pd.read_csv(r'C:\Users\Nitinshakthi\OneDrive\Desktop\2nd Year DT\Advanced ML\Code Along\Day3\housing.csv')
data.info()
print(data.head(5))
data1=data.drop_duplicates()
print(data1.isna().sum())

y=data1["median_house_value"] #target
x=data1.drop("median_house_value",axis=1) #features axis=1 means column wise, axis=0 means row wise

X_train,X_test,Y_train,Y_test=train_test_split(x,y,test_size=0.2,random_state=42)
print(X_train.shape,X_test.shape,Y_train.shape,Y_test.shape)

num_cols=X_train.select_dtypes(include=np.number).columns #selecting only numerical columns
cat_cols=X_train.select_dtypes(exclude=np.number).columns #selecting only categorical columns

num_imputer = SimpleImputer(strategy="median")
cat_imputer = SimpleImputer(strategy="most_frequent")

X_train[num_cols]=num_imputer.fit_transform(X_train[num_cols]) #fit_transform is used to fit the imputer on the training data and then transform it learns the median value from the training data and replaces the missing values with it.
X_train[cat_cols]=cat_imputer.fit_transform(X_train[cat_cols])  

X_test[num_cols]=num_imputer.transform(X_test[num_cols]) #transform is used to transform the test data using the imputer fitted on the training data. It replaces the missing values in the test data with the median value learned from the training data.
X_test[cat_cols]=cat_imputer.transform(X_test[cat_cols])    

print(X_train.isna().sum())
print(X_test.isna().sum())

X_train = pd.get_dummies(X_train, drop_first=True) #drop_first=True is used to drop the first category of each categorical variable to avoid multicollinearity.
X_test = pd.get_dummies(X_test, drop_first=True)

X_train,X_test = X_train.align(X_test,join='Left', axis=1, fill_value=0) #align is used to align the columns of the training and test data. It ensures that both datasets have the same columns in the same order. If a column is missing in one dataset, it fills it with 0.

scaler = StandardScaler()
X_train = scaler.fit_transform(X_train) #fit_transform is used to fit the scaler on the training data and then transform it. It learns the mean and standard deviation from the training data and scales the features accordingly.
X_test = scaler.transform(X_test) #transform is used to transform the test data using the scaler fitted on the training data. It scales the features in the test data using the mean and standard deviation learned from the training data.

ridge = GridSearchCV(Ridge(),{"alpha":[0.1,1,10,100,20,50]},cv=5) #GridSearchCV is used to perform hyperparameter tuning for the Ridge regression model. It searches for the best value of alpha from the specified list using 5-fold cross-validation.cv=5 means that the training data will be split into 5 folds, and the model will be trained and evaluated 5 times, each time using a different fold as the validation set and the remaining folds as the training set.
ridge_best = ridge.fit(X_train,Y_train) #fit is used to fit the GridSearchCV object on the training data. It performs the hyperparameter tuning and finds the best model.
ridge_best=ridge.best_estimator_ #best_estimator_ is used to get the best model found by GridSearchCV.

print(ridge_best) #print the best model

y_pred = ridge_best.predict(X_test) #predict is used to make predictions on the test data using the best model found by GridSearchCV.

mse = mean_squared_error(Y_test,y_pred) #mean_squared_error is used to calculate the mean squared error between the true values and the predicted values.
print("Mean Squared Error:",mse)

r2 = r2_score(Y_test,y_pred) #r2_score is used to calculate the R-squared score between the true values and the predicted values.
print("R-squared Score:",r2)

Lasso = GridSearchCV(Lasso(),{"alpha":[0.1,1,10,100,20,50]},cv=5) #GridSearchCV is used to perform hyperparameter tuning for the Lasso regression model. It searches for the best value of alpha from the specified list using 5-fold cross-validation.
Lasso_test = Lasso.fit(X_train,Y_train) #fit is used to fit the GridSearchCV object on the training data. It performs the hyperparameter tuning and finds the best model.l
Lasso_test= Lasso.best_estimator_ #best_estimator_ is used to get the best model found by GridSearchCV.

print(Lasso_test) #print the best model

y_pred_Lasso = Lasso_test.predict(X_test) #predict is used to make predictions on the test data using the best model found by GridSearchCV.

mse_Lasso = mean_squared_error(Y_test,y_pred_Lasso) #mean_squared_error is used to calculate the mean squared error between the true values and the predicted values.
print("Mean Squared Error:",mse_Lasso)

r2_Lasso = r2_score(Y_test,y_pred_Lasso) #r2_score is used to calculate the R-squared score between the true values and the predicted values.
print("R-squared Score:",r2_Lasso)

dt = GridSearchCV(DecisionTreeRegressor(random_state=42),{"max_depth":[None],"min_samples_split":[30, 40, 50, 60, 70, 80],"min_samples_leaf":[10, 15, 20, 25],"max_features":[None]},cv=5) #GridSearchCV is used to perform hyperparameter tuning for the DecisionTreeRegressor model. It searches for the best value of max_depth, min_samples_split, min_samples_leaf, and max_features from the specified list using 5-fold cross-validation.
dt_best = dt.fit(X_train,Y_train) #fit is used to fit the GridSearchCV object on the training data. It performs the hyperparameter tuning and finds the best model.
dt_best = dt.best_estimator_ #best_estimator_ is used to get the best model found by GridSearchCV.

print(dt_best) #print the best model

y_pred_dt = dt_best.predict(X_test) #predict is used to make predictions on the test data using the best model found by GridSearchCV.

mse_dt = mean_squared_error(Y_test,y_pred_dt) #mean_squared_error is used to calculate the mean squared error between the true values and the predicted values.
print("Mean Squared Error:",mse_dt)

r2_dt = r2_score(Y_test,y_pred_dt) #r2_score is used to calculate the R-squared score between the true values and the predicted values.
print("R-squared Score:",r2_dt)