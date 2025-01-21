import { amadeusService } from './amadeusService';

export const locationService = {
  async searchLocations(query) {
    try {
      console.log('🔍 Searching locations for query:', query);
      if (!query || query.length < 2) {
        console.log('⚠️ Query too short, skipping search');
        return [];
      }

      const locations = await amadeusService.searchLocations(query);
      console.log('📍 Found locations:', locations);

      return locations.map(location => ({
        iataCode: location.iataCode,
        name: location.name,
        city: location.cityName,
        country: location.countryCode,
        displayName: `${location.cityName || location.name} (${location.iataCode})`
      }));
    } catch (error) {
      console.error('❌ Location search error:', error);
      return [];
    }
  }
}; 