const BASE_URL = import.meta.env.VITE_INVENTORY_SERVICE_URL;

export const inventoryService = {
  async searchFlights(params) {
    try {
      const queryParams = new URLSearchParams({
        from: params.from || '',
        to: params.to || '',
        date: params.date || '',
        returnDate: params.returnDate || '',
        adults: params.adults || 1,
        maxPrice: params.maxPrice || ''
      }).toString();

      console.log('Making request to:', `${BASE_URL}/api/flights?${queryParams}`);
      
      const response = await fetch(`${BASE_URL}/api/flights?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Raw response status:', response.status);
      const data = await response.json();
      console.log('Parsed response data:', data);

      if (!response.ok) {
        throw new Error('Flight search failed');
      }

      return data;
    } catch (error) {
      console.error('Flight search error:', error);
      throw error;
    }
  },

  async searchHotels(params) {
    try {
      const queryParams = new URLSearchParams({
        location: params.query || '',
        checkIn: params.dates?.start || '',
        checkOut: params.dates?.end || '',
        guests: params.travelers || 1,
        maxPrice: params.budget || ''
      }).toString();

      const response = await fetch(`${BASE_URL}/api/hotels?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Hotel search failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Hotel search error:', error);
      throw error;
    }
  }
}; 