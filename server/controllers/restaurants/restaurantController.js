import Restaurant from '../../models/Restaurant.js';

export const getRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.find({ restaurant_id: req.params.id });
    res.json(restaurant);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};