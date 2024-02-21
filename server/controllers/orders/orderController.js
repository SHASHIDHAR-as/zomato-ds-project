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

export const lodgeNewTrainComplaint = async (req, res) => {
  try {
    // Get all details from the body of the request
    const { trainNumber, pnrNumber, type, subtype, timestamp, description } = req.body;
    
    // If there are errors, return a bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Create an object of train complaint
    const trainComplaint = new TrainComplaint({
      user: req.user.id,
      trainNumber,
      pnrNumber,
      type,
      subtype,
      timestamp,
      description,
    });

    const savedComplaint = await trainComplaint.save();
    res.json(savedComplaint);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};