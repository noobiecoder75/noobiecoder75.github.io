const axios = require('axios');
const logger = require('../utils/logger');

const hotelService = {
  async searchHotels(params) {
    try {
      const { location, checkIn, checkOut, guests = 1 } = params;

      // Mock hotel data for now
      // You can replace this with actual Hotelbeds API call
      const mockHotels = [
        {
          id: 'hotel1',
          name: 'Luxury Hotel',
          location: location,
          price: 299.99,
          rating: 4.5,
          type: 'hotel',
          checkIn,
          checkOut,
          guests
        },
        {
          id: 'hotel2',
          name: 'Business Hotel',
          location: location,
          price: 199.99,
          rating: 4.0,
          type: 'hotel',
          checkIn,
          checkOut,
          guests
        }
      ];

      return mockHotels;
    } catch (error) {
      logger.error('Hotel search error:', error);
      throw error;
    }
  }
};

module.exports = hotelService; 