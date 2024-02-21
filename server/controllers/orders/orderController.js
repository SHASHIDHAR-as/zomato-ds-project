import { validationResult } from 'express-validator';

import Order from '../../models/Order.js';
import Restaurant from '../../models/Restaurant.js';

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

async function findTopCuisinesByCustomer(customer_id) {
    const customerOrders = await Order.find({ customer_id });

    const restaurantIds = customerOrders.map(order => order.restaurant_id);

    const restaurantDetails = await Restaurant.find(
        { restaurant_id: { $in: restaurantIds } },
        { cuisines: 1, _id: 0 } // Projection to include only 'cuisines' field
    );

    const allCuisines = restaurantDetails
        .flatMap(restaurant => restaurant.cuisines.replace(/[\[\]']/g, '').split(','))
        .map(cuisine => cuisine.trim());

    const sortedCuisines = allCuisines.reduce((frequency, cuisine) => {
        frequency[cuisine] = (frequency[cuisine] || 0) + 1;
        return frequency;
    }, {});

    const topCuisines = Object.keys(sortedCuisines)
        .sort((a, b) => sortedCuisines[b] - sortedCuisines[a])
        .slice(0, 4);

    return topCuisines;
}

async function findTopRestaurantsByCuisineAndLocation(topCuisines, location) {
    const topRestaurants = await Restaurant.find(
        { cuisines: { $in: topCuisines }, location },
        { restaurant_id: 1, cuisines: 1, location: 1, rating: 1, _id: 0 } // Projection for necessary fields
    )
        .sort({ rating: -1 })
        .limit(4);

    return topRestaurants;
}

export const getRestaurantRecommendations = async (req, res) => {
    const { customer_id, location } = req.body;

    try {
        const topCuisines = await findTopCuisinesByCustomer(customer_id, location);
        const topRestaurants = await findTopRestaurantsByCuisineAndLocation(topCuisines, location);

        res.json({
            topCuisines,
            topRestaurants,
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};