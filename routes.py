from flask import request, jsonify
from cars_api import app
from cars_api.model import predict_car_price

@app.route('/')
def home():
    return "Welcome to the Car Price Prediction API"

@app.route('/predict', methods=['POST'])
def predict_price():
    data = request.get_json()
    
    # Call the prediction function from model.py
    prediction = predict_car_price(data)
    
    return jsonify({"predicted_price": prediction})
