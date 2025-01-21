const express = require('express');
const router = express.Router();
const flightService = require('../services/flightService');
const hotelService = require('../services/hotelService');
const logger = require('../utils/logger');
const axios = require('axios');
const amadeusService = require('../services/amadeusService');

router.get('/flights', async (req, res) => {
  try {
    const { from, to, date, returnDate, adults, maxPrice } = req.query;

    // Validate required parameters
    if (!from || !to || !date) {
      return res.status(400).json({ 
        error: 'Missing required parameters: from, to, and date are required' 
      });
    }

    // Validate date format (should be YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date) || (returnDate && !dateRegex.test(returnDate))) {
      return res.status(400).json({ 
        error: 'Invalid date format. Use YYYY-MM-DD' 
      });
    }

    // Validate dates are in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const departureDate = new Date(date);
    if (departureDate < today) {
      return res.status(400).json({ 
        error: 'Departure date must be in the future' 
      });
    }

    // Clean and validate maxPrice
    const cleanedParams = {
      ...req.query,
      maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
      adults: adults ? parseInt(adults) : 1
    };

    logger.info('Searching flights with cleaned params:', cleanedParams);
    const flights = await flightService.searchFlights(cleanedParams);
    
    if (!flights || flights.length === 0) {
      return res.status(404).json({
        error: 'No flights found for the given criteria'
      });
    }

    res.json(flights);
  } catch (error) {
    logger.error('Flight search error:', error);
    
    // Handle specific Amadeus API errors
    if (error.response?.data?.errors) {
      return res.status(error.response.status || 400).json({
        error: 'Flight search failed',
        details: error.response.data.errors
      });
    }

    res.status(500).json({ 
      error: 'Error searching flights',
      details: error.message
    });
  }
});

router.get('/hotels', async (req, res) => {
  try {
    const hotels = await hotelService.searchHotels(req.query);
    res.json(hotels);
  } catch (error) {
    logger.error('Hotel search error:', error);
    res.status(500).json({ error: 'Error searching hotels' });
  }
});

router.get('/locations/search', async (req, res) => {
  try {
    const { keyword } = req.query;
    
    logger.info(`Searching locations with keyword: ${keyword}`);
    
    if (!keyword || keyword.length < 2) {
      return res.status(400).json({ 
        error: 'Keyword must be at least 2 characters long' 
      });
    }

    const locations = await amadeusService.searchLocations(keyword);
    
    if (!locations || !Array.isArray(locations)) {
      logger.error('Invalid locations response:', locations);
      return res.status(500).json({ error: 'Invalid response from location service' });
    }
    
    // Transform the response to match our frontend needs
    const formattedLocations = locations.map(location => ({
      iataCode: location.iataCode,
      name: location.name,
      cityName: location.address?.cityName,
      countryCode: location.address?.countryCode,
      type: location.subType
    }));

    res.json(formattedLocations);
  } catch (error) {
    logger.error('Location search error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Error searching locations',
      details: error.message 
    });
  }
});

router.get('/flights/destinations', async (req, res) => {
  try {
    const { origin, maxPrice } = req.query;
    const destinations = await flightService.searchFlightDestinations(origin, maxPrice);
    res.json(destinations);
  } catch (error) {
    logger.error('Flight destinations error:', error);
    res.status(500).json({ error: 'Error searching flight destinations' });
  }
});

module.exports = router; 