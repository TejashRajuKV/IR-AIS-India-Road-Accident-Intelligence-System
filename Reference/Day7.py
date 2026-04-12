import pandas as pd 
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns


from sklearn.model_selection import train_test_split,GridSearchCV
from sklearn.linear_model import Ridge,Lasso,ElasticNet
from sklearn.tree import DecisionTreeRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import r2_score,mean_squared_error
from sklearn.impute import SimpleImputer
from sklearn.decomposition import PCA
from sklearn.svm import SVC
from sklearn import svm
from sklearn.metrics import accuracy_score, classification_report


data = pd.read_csv(r'C:\Users\Nitinshakthi\OneDrive\Desktop\2nd Year DT\Advanced ML\Code Along\Day7\titanic.csv')
data.info()
# print(data.head(5))
data1=data.drop_duplicates()
# print(data1.isna().sum())

y=data1["Survived"] #target
x=data1.drop(["Survived","PassengerId"],axis=1) #features axis=1 means column wise, axis=0 means row wise
# print(x)
# print(y)

X_train,X_test,Y_train,Y_test=train_test_split(x,y,test_size=0.2,random_state=42)
X_train['Title'] = X_train.Name.str.extract('([A-Za-z]+)\.')
X_train['Sex'] = X_train['Sex'].map({'male': 0, 'female': 1})
X_train['Title'] = X_train['Title'].replace(['Mlle', 'Ms',    'Mme', 'Lady', 'Countess', 'Don', 'Jonkheer', 'Rev', 'Sir',  'Major', 'Col', 'Capt', 'Dr'   ],['Miss', 'Miss',  'Mrs', 'Mrs', 'Mrs','Mr',  'Mr', 'Mr',  'Mr',   'Mr',    'Mr',  'Mr',   'Other'])
X_train['Title'] = X_train['Title'].map({'Mr':0,'Miss':1,'Mrs':2,'Master':3,'Other':4}).fillna(5)
median_age = X_train['Age'].median()
X_train['Age']     = X_train['Age'].fillna(median_age)
X_train['Fare']    = X_train['Fare'].fillna(median_age)
X_train['Embarked'] = X_train['Embarked'].fillna('S')
X_train['Embarked'] = X_train['Embarked'].map({'S':0,'C':1,'Q':2})
X_train['Family']  = X_train['SibSp'] + X_train['Parch']
X_train['Age_grp'] = pd.cut(X_train['Age'], bins=[0,10,20,30,40,50,80], labels=[0,1,2,3,4,5])
X_train['Age_grp'] = X_train['Age_grp'].astype(float)
X_train = X_train[['Title', 'Sex', 'Age', 'Fare', 'Family', 'Embarked','Pclass','Age_grp']]

X_test['Title'] = X_test.Name.str.extract('([A-Za-z]+)\.')
X_test['Sex'] = X_test['Sex'].map({'male': 0, 'female': 1})
X_test['Title'] = X_test['Title'].replace(['Mlle', 'Ms',   'Mme', 'Lady', 'Countess', 'Don', 'Jonkheer', 'Rev', 'Sir', 'Major', 'Col', 'Capt', 'Dr'],['Miss', 'Miss', 'Mrs', 'Mrs',  'Mrs', 'Mr',  'Mr', 'Mr',  'Mr',  'Mr',    'Mr',  'Mr',   'Other'])
X_test['Title'] = X_test['Title'].map({'Mr':0,'Miss':1,'Mrs':2,'Master':3,'Other':4}).fillna(5)
X_test['Age']     = X_test['Age'].fillna(median_age)
X_test['Fare']    = X_test['Fare'].fillna(median_age)
X_test['Embarked'] = X_test['Embarked'].fillna('S')
X_test['Embarked'] = X_test['Embarked'].map({'S':0,'C':1,'Q':2})
X_test['Family']  = X_test['SibSp'] + X_test['Parch']
X_test['Age_grp'] = pd.cut(X_test['Age'], bins=[0,10,20,30,40,50,80], labels=[0,1,2,3,4,5])
X_test['Age_grp'] = X_test['Age_grp'].astype(float)
X_test = X_test[['Title', 'Sex', 'Age', 'Fare', 'Family', 'Embarked', 'Pclass', 'Age_grp']]

X_train = X_train.copy()
X_test = X_test.copy()

scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

model = SVC(kernel='rbf', random_state=42)
model.fit(X_train, Y_train)

Y_pred = model.predict(X_test)
print("Accuracy :", accuracy_score(Y_test, Y_pred))
print(classification_report(Y_test, Y_pred))

model = svm.SVC(kernel='poly', degree=3, C=1.0, gamma='scale', random_state=42)
model.fit(X_train, Y_train)

Y_pred = model.predict(X_test)
print("Accuracy :", accuracy_score(Y_test, Y_pred))
print(classification_report(Y_test, Y_pred))