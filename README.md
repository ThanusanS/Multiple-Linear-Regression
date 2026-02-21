# Profit Predictor Using Multiple Linear Regression 

A machine learning project that predicts a company's **profit** based on R&D, Administration, Marketing Spend, and State. Built with Python and Multiple Linear Regression, this model helps businesses **make data-driven decisions** and **reduce manual calculations**.

---

##  Features

- Predict profit based on:
  - **R&D Spend**
  - **Administration**
  - **Marketing Spend**
  - **State** (New York, California, Florida)
- Provides **quick, accurate predictions** to help companies save time and reduce human error.
- Perfect for demonstrating the power of **Multiple Linear Regression** in business analytics.

---

##  Problem Solved

Many businesses struggle to **estimate profits accurately** due to multiple influencing factors. This model automates the process:

- Eliminates manual profit calculations ✅  
- Reduces errors in financial predictions ✅  
- Frees up time for strategic decision-making ✅  

---

##  How It Works

The model is trained using historical company data. Users provide input values for:

1. R&D Spend  
2. Administration Cost  
3. Marketing Spend  
4. State (encoded as New York, California, or Florida)  

The model outputs the **predicted profit in dollars** instantly.

---

##  Example Usage

```python
import pandas as pd
import pickle

# Load the trained model
model = pickle.load(open('profit_predictor_model.sav', 'rb'))

# Input data
data = pd.DataFrame({
    'R&D Spend': [160000],
    'Administration': [130000],
    'Marketing Spend': [300000],
    'State_Florida': [0],
    'State_New York': [1],
    'State_California': [0]
})

# Predict profit
predicted_profit = model.predict(data)
print(f"Predicted Profit: ${predicted_profit[0]:,.2f}")
