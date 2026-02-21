from flask import Flask, request, jsonify, render_template
import pickle
import numpy as np
import pandas as pd
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the trained model
try:
    model = pickle.load(open('finalized_model_multi_linear.sav', 'rb'))
    print("✅ Model loaded successfully!")
except FileNotFoundError:
    print("❌ Model file not found. Please ensure 'finalized_model_multi_linear.sav' exists.")
    model = None

# Feature names expected by the model
feature_names = ['R&D Spend', 'Administration', 'Marketing Spend', 
                 'State_Florida', 'State_New York']

# State mapping for display
state_mapping = {
    'california': [0, 0],  # California is the reference (both dummies = 0)
    'florida': [1, 0],     # State_Florida = 1, State_New York = 0
    'new york': [0, 1]     # State_Florida = 0, State_New York = 1
}

@app.route('/')
def home():
    """Render the home page"""
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    """API endpoint for profit prediction"""
    
    # Check if model is loaded
    if model is None:
        return jsonify({
            'success': False,
            'error': 'Model not loaded. Please check server logs.'
        }), 500
    
    try:
        # Get data from request
        data = request.get_json()
        
        # Extract input values
        rd_spend = float(data.get('rd_spend', 0))
        administration = float(data.get('administration', 0))
        marketing_spend = float(data.get('marketing_spend', 0))
        state = data.get('state', 'california').lower()
        
        # Validate inputs
        if rd_spend < 0 or administration < 0 or marketing_spend < 0:
            return jsonify({
                'success': False,
                'error': 'All spend values must be non-negative'
            }), 400
        
        # Get state dummy variables
        state_dummies = state_mapping.get(state, [0, 0])
        
        # Prepare feature array
        features = np.array([[rd_spend, administration, marketing_spend, 
                             state_dummies[0], state_dummies[1]]])
        
        # Make prediction
        prediction = model.predict(features)[0][0]
        
        # Format prediction
        formatted_prediction = round(prediction, 2)
        
        # Return success response
        return jsonify({
            'success': True,
            'prediction': formatted_prediction,
            'formatted': f"${formatted_prediction:,.2f}",
            'input': {
                'rd_spend': rd_spend,
                'administration': administration,
                'marketing_spend': marketing_spend,
                'state': state.title()
            }
        })
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': 'Invalid input values. Please enter valid numbers.'
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'An error occurred: {str(e)}'
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None
    })

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8080))
    app.run(host='0.0.0.0', port=port)