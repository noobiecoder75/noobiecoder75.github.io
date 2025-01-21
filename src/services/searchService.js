import { amadeusService } from './amadeusService';
import { chatGptService } from './chatGptService';

export const searchService = {
  async search(params) {
    try {
      let searchParams = params;

      // If this is a natural language query, process it with ChatGPT
      if (params.naturalLanguage) {
        console.log('🔍 Processing natural language query:', params.query);
        const processedParams = await chatGptService.processSearchQuery(params.query);
        
        // Format dates to YYYY-MM-DD
        const formatDate = (dateStr) => {
          if (!dateStr) return undefined;
          const date = new Date(dateStr);
          return date.toISOString().split('T')[0];
        };

        // Convert ChatGPT response to API parameters
        searchParams = {
          from: 'YVR', // Default origin
          to: processedParams.destination,
          date: formatDate(processedParams.departureDate),
          returnDate: formatDate(processedParams.returnDate),
          adults: processedParams.travelers || 1,
          maxPrice: processedParams.maxBudget || 10000,
          preferences: processedParams.preferences
        };
        
        console.log('🎯 Converted parameters:', searchParams);

        // Validate required parameters
        if (!searchParams.date) {
          throw new Error('Departure date is required');
        }
      }

      // Make API calls based on the processed parameters
      const type = searchParams.type || 'all';
      let results = [];

      if (type === 'all' || type === 'flights') {
        console.log('✈️ Searching flights with params:', searchParams);
        const flights = await amadeusService.searchFlights(searchParams);
        console.log('📋 Found flights:', flights.length);
        results = [...results, ...flights];
      }

      return results;
    } catch (error) {
      console.error('❌ Search service error:', error);
      throw error;
    }
  }
}; 