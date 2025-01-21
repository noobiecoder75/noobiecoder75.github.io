const Amadeus = require('amadeus');
const logger = require('../utils/logger');

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET
});

const amadeusService = {
  async searchLocations(keyword) {
    try {
      logger.info(`Searching Amadeus locations with keyword: ${keyword}`);
      
      const response = await amadeus.client.get('/v1/reference-data/locations', {
        keyword: keyword,
        subType: 'CITY,AIRPORT',
        'page[limit]': 10,
        view: 'LIGHT'
      });
      
      if (!response.data) {
        throw new Error('No data received from Amadeus API');
      }
      
      logger.info(`Found ${response.data.length} locations`);
      return response.data;
    } catch (error) {
      logger.error('Amadeus location search error:', {
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      });
      throw error;
    }
  },

  async getAccessToken() {
    try {
      const response = await amadeus.client.get('/v1/security/oauth2/token');
      return response.data.access_token;
    } catch (error) {
      logger.error('Error getting access token:', error);
      throw error;
    }
  }
};

module.exports = amadeusService; 