const axios = require('axios');
const { config } = require('../config/config');
const logger = require('../utils/logger');

class SearchService {
  constructor() {
    this.inventoryServiceUrl = config.services.inventory.url;
  }

  async searchCombined(params) {
    try {
      // Get flights and hotels in parallel
      const [flights, hotels] = await Promise.all([
        this.searchFlights(params),
        this.searchHotels(params)
      ]);

      // Combine and process results
      return {
        flights,
        hotels,
        combinations: this.generateCombinations(flights, hotels)
      };
    } catch (error) {
      logger.error('Error in combined search:', error);
      throw error;
    }
  }

  async searchFlights(params) {
    try {
      const response = await axios.get(
        `${this.inventoryServiceUrl}/api/inventory/flights`,
        { params }
      );
      return response.data;
    } catch (error) {
      logger.error('Error fetching flights:', error);
      throw error;
    }
  }

  async searchHotels(params) {
    try {
      const response = await axios.get(
        `${this.inventoryServiceUrl}/api/inventory/hotels`,
        { params }
      );
      return response.data;
    } catch (error) {
      logger.error('Error fetching hotels:', error);
      throw error;
    }
  }

  generateCombinations(flights, hotels) {
    // Logic to combine flights and hotels into packages
    return flights.map(flight => {
      return hotels.map(hotel => ({
        id: `${flight.id}-${hotel.id}`,
        flight,
        hotel,
        totalPrice: flight.price + hotel.price
      }));
    }).flat();
  }
}

module.exports = new SearchService(); 