const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { getCars, addCar, deleteCar, addBooking, cancelBooking, getBookings, getRentals, addCustomer, getCustomers } = require('./Mongo_db/db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// API Routes

// Cars
app.get('/api/cars', async (req, res) => {
    try {
        const cars = await getCars();
        res.json(cars);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/cars', async (req, res) => {
    try {
        const car = await addCar(req.body);
        res.status(201).json(car);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/cars/:id', async (req, res) => {
    try {
        await deleteCar(req.params.id);
        res.status(200).json({ message: 'Car deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Bookings
app.get('/api/bookings', async (req, res) => {
    try {
        const bookings = await getBookings();
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/bookings', async (req, res) => {
    try {
        const booking = await addBooking(req.body);
        res.status(201).json(booking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Rentals
app.get('/api/rentals', async (req, res) => {
    try {
        const rentals = await getRentals();
        res.json(rentals);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Customers
app.post('/api/customers', async (req, res) => {
    try {
        const customer = await addCustomer(req.body);
        res.status(201).json(customer);
    } catch (err) {
    }
});

app.get('/api/customers', async (req, res) => {
    try {
        const customers = await getCustomers();
        res.json(customers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Cancel a booking
app.delete('/api/bookings/:id', async (req, res) => {
    try {
        await cancelBooking(req.params.id);
        res.status(200).json({ message: 'Booking cancelled' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {

    console.log(`Server running on http://localhost:${PORT}`);
});
