import express from 'express';
import { body } from 'express-validator';

import {
  getCustomerOrders
} from '../../controllers/orders/orderController.js';

const router = express.Router();

// ROUTE 1: Get All the restaurants using: GET "/restaurants/traincomplaints/getallcomplaints". manager Login required

// ROUTE 2: Get all customers orders using: GET "/orders/customer_id".
router.get('/getCustomerOrders/:customer_id', getCustomerOrders);

export default router;