const express = require('express');
const route = express.Router();
const db = require('../db'); // Database connection pool
const axios = require('axios');

// http://localhost:4000/cars_data/allCars
route.get('/allCars', async (req, res) => {
  try {
    const query = 'SELECT * FROM cars_data';
    const [response] = await db.query(query);
    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching cars:', error.message);  // More descriptive error message
    res.status(400).json({ message: 'Failed to fetch cars', error: error.message });
  }
});

// http://localhost:4000/cars_data/addCar
route.post('/addCar', async (req, res) => {
  try {
    const carData = req.body;

    // Ensure required fields are provided
    if (!carData.make || !carData.price) {
      return res.status(400).json({ message: 'Missing required fields: make or price' });
    }

    const query = `
      INSERT INTO cars_data (
        symboling, normalized_losses, make, fuel_type, aspiration, num_of_doors,
        body_style, drive_wheels, engine_location, wheel_base, length, width, height,
        curb_weight, engine_type, num_of_cylinders, engine_size, fuel_system, bore, stroke,
        compression_ratio, horsepower, peak_rpm, city_mpg, highway_mpg, price
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      carData.symboling, carData.normalized_losses, carData.make, carData.fuel_type, carData.aspiration,
      carData.num_of_doors, carData.body_style, carData.drive_wheels, carData.engine_location,
      carData.wheel_base, carData.length, carData.width, carData.height, carData.curb_weight,
      carData.engine_type, carData.num_of_cylinders, carData.engine_size, carData.fuel_system,
      carData.bore, carData.stroke, carData.compression_ratio, carData.horsepower, carData.peak_rpm,
      carData.city_mpg, carData.highway_mpg, carData.price,
    ];

    const [response] = await db.query(query, values);
    res.status(201).json({ message: 'Car added successfully', data: response });
  } catch (error) {
    console.error('Error adding car:', error.message);  // More descriptive error message
    res.status(400).json({ message: 'Failed to add car', error: error.message });
  }
});

// http://localhost:4000/cars_data/carById/:carId
route.get('/carById/:carId', async (req, res) => {
  try {
    const { carId } = req.params;
    const query = 'SELECT * FROM cars_data WHERE id = ?';
    const [response] = await db.query(query, [carId]);
    if (response.length === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.status(200).json(response[0]);
  } catch (error) {
    console.error('Error fetching car by ID:', error.message);  // More descriptive error message
    res.status(400).json({ message: 'Failed to fetch car', error: error.message });
  }
});

// http://localhost:4000/cars_data/deleteCar/:carId
route.delete('/deleteCar/:carId', async (req, res) => {
  try {
    const { carId } = req.params;
    const query = 'DELETE FROM cars_data WHERE id = ?';
    const [response] = await db.query(query, [carId]);
    if (response.affectedRows === 0) {
      return res.status(404).json({ message: 'Car not found or already deleted' });
    }
    res.status(200).json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.error('Error deleting car:', error.message);  // More descriptive error message
    res.status(400).json({ message: 'Failed to delete car', error: error.message });
  }
});

// http://localhost:4000/cars_data/updateCar/:carId
route.put('/updateCar/:carId', async (req, res) => {
  try {
    const { carId } = req.params;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No data provided for update' });
    }

    // Dynamically build the SQL query to update the car data
    const updateFields = Object.keys(updates).map((key) => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), carId];

    const query = `UPDATE cars_data SET ${updateFields} WHERE id = ?`;
    const [response] = await db.query(query, values);

    if (response.affectedRows === 0) {
      return res.status(404).json({ message: 'Car not found or no changes made' });
    }
    res.status(200).json({ message: 'Car updated successfully', data: response });
  } catch (error) {
    console.error('Error updating car:', error.message);  // More descriptive error message
    res.status(500).json({ message: 'Failed to update car', error: error.message });
  }
});

// http://localhost:4000/cars_data/predictCarPrice/:carId
route.post('/predictCarPrice/:carId', async (req, res) => {
  try {
    const { carId } = req.params;

    // Send the request to the Flask API
    const flaskResponse = await axios.post(`http://127.0.0.1:5000/predict/${carId}`, req.body);

    if (flaskResponse.status === 200) {
      const predictedPrice = flaskResponse.data.predicted_price;

      // Update the car's price in the database
      const updateQuery = 'UPDATE cars_data SET price = ? WHERE id = ?';
      const [updateResponse] = await db.query(updateQuery, [predictedPrice, carId]);

      if (updateResponse.affectedRows === 0) {
        return res.status(404).json({ message: 'Car not found for updating price' });
      }

      res.status(200).json({
        message: 'Prediction successful and car price updated!',
        prediction: predictedPrice,
      });
    } else {
      res.status(flaskResponse.status).json({ message: 'Prediction failed.' });
    }
  } catch (error) {
    console.error('Error predicting car price:', error.message);  // More descriptive error message
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

module.exports = route;
