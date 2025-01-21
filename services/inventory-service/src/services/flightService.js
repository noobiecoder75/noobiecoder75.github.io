const Amadeus = require('amadeus');
const logger = require('../utils/logger');

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET
});

const flightService = {
  async searchFlights(params) {
    try {
      logger.info('Starting flight search with params:', {
        from: params.from,
        to: params.to,
        date: params.date,
        returnDate: params.returnDate,
        adults: params.adults,
        maxPrice: params.maxPrice
      });

      const { from, to, date, returnDate, adults = 1, maxPrice } = params;

      // Build the request parameters
      const requestParams = {
        originLocationCode: from,
        destinationLocationCode: to,
        departureDate: date,
        adults: parseInt(adults),
        currencyCode: 'USD',
        max: 250
      };

      // Log the Amadeus SDK configuration
      logger.debug('Amadeus SDK Configuration:', {
        clientId: process.env.AMADEUS_CLIENT_ID ? 'Set' : 'Missing',
        clientSecret: process.env.AMADEUS_CLIENT_SECRET ? 'Set' : 'Missing'
      });

      // Add optional parameters
      if (returnDate) {
        logger.debug('Adding return date to request');
        requestParams.returnDate = returnDate;
      }

      if (maxPrice && !isNaN(maxPrice)) {
        logger.debug('Adding max price to request');
        requestParams.maxPrice = parseInt(maxPrice);
      }

      logger.info('Making Amadeus API request with params:', requestParams);

      try {
        // Use the correct endpoint for flight offers search
        const response = await amadeus.shopping.flightOffersSearch.get(requestParams);
        logger.debug('Raw Amadeus API response:', {
          status: response.statusCode,
          headers: response.headers,
          data: response.data ? 'Data received' : 'No data'
        });

        if (!response.data || response.data.length === 0) {
          logger.warn('No flight offers found for the given criteria', { params: requestParams });
          return [];
        }

        logger.info(`Found ${response.data.length} flight offers`);
        logger.debug('First flight offer sample:', response.data[0]);

        // Transform the response
        const transformedResults = response.data.map(offer => ({
          id: offer.id,
          type: 'flight',
          price: {
            amount: parseFloat(offer.price.total),
            currency: offer.price.currency
          },
          itineraries: offer.itineraries.map(itinerary => ({
            duration: itinerary.duration,
            segments: itinerary.segments.map(segment => ({
              departure: {
                iataCode: segment.departure.iataCode,
                terminal: segment.departure.terminal,
                at: segment.departure.at,
                city: segment.departure.iataCode
              },
              arrival: {
                iataCode: segment.arrival.iataCode,
                terminal: segment.arrival.terminal,
                at: segment.arrival.at,
                city: segment.arrival.iataCode
              },
              carrierCode: segment.carrierCode,
              number: segment.number,
              aircraft: segment.aircraft.code,
              duration: segment.duration,
              id: segment.id
            }))
          })),
          validatingAirlineCodes: offer.validatingAirlineCodes,
          bookingClasses: offer.travelerPricings?.[0]?.fareDetailsBySegment?.map(fare => ({
            class: fare.cabin,
            availability: fare.availability
          }))
        }));

        logger.info('Successfully transformed flight offers', {
          originalCount: response.data.length,
          transformedCount: transformedResults.length
        });

        return transformedResults;
      } catch (apiError) {
        logger.error('Amadeus API Error:', {
          message: apiError.message,
          code: apiError.code,
          statusCode: apiError.response?.statusCode,
          apiResponse: apiError.response?.data,
          requestParams
        });
        throw apiError;
      }
    } catch (error) {
      logger.error('Flight search error:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        stack: error.stack,
        params
      });
      throw error;
    }
  },

  async searchFlightDestinations(origin, maxPrice) {
    try {
      logger.info(`Searching flight destinations from ${origin} with max price ${maxPrice}`);
      
      // Using the flight destinations endpoint
      const response = await amadeus.client.get('/v1/shopping/flight-destinations', {
        origin: origin,
        maxPrice: maxPrice
      });

      return response.data;
    } catch (error) {
      logger.error('Flight destinations search error:', error);
      throw error;
    }
  }
};

module.exports = flightService; 