import { validationResult } from 'express-validator';

import Order from '../../models/Order.js';

export const getCustomerOrders = async (req, res) => {
    try {
        const customerOrders = await Order.find({ customer_id: req.params.customer_id });
        res.json(customerOrders);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

export const createNewOrder = async (req, res) => {
    try {

        let order_id;
        do {
            order_id = Math.floor(100000 + Math.random() * 999999); // Generate a random 6-digit number
        } while (await Order.findOne({ order_id })); // Check if the generated order ID already exists in the database

        // Get all details from the body of the request
        const { customer_id, restaurant_id, name, location, date } = req.body;

        // If there are errors, return a bad request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const order = new Order({
            order_id,
            customer_id,
            restaurant_id,
            name,
            location,
            date
        });

        const savedOrder = await order.save();
        res.json(savedOrder);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};