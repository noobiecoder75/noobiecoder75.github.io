const AMADEUS_API_URL = 'https://test.api.amadeus.com/v1';
const CLIENT_ID = '5doPG2ycVz3u1UoFUugLf4CSVbwcSJ1N';
const CLIENT_SECRET = 'mnt3djOp6jrrhidH';

class AmadeusService {
  constructor() {
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry > Date.now()) {
      return this.accessToken;
    }

    const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    });

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000);
    return this.accessToken;
  }

  async searchFlights(params) {
    try {
      const token = await this.getAccessToken();
      
      const queryParams = new URLSearchParams({
        originLocationCode: params.from,
        destinationLocationCode: params.to,
        departureDate: params.date,
        adults: params.adults || 1,
        currencyCode: 'USD',
        max: 250
      });

      if (params.returnDate) {
        queryParams.append('returnDate', params.returnDate);
      }

      if (params.maxPrice) {
        queryParams.append('maxPrice', params.maxPrice);
      }

      const response = await fetch(
        `https://test.api.amadeus.com/v2/shopping/flight-offers?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.errors?.[0]?.detail || 'Flight search failed');
      }

      return data.data.map(offer => ({
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
        validatingAirlineCodes: offer.validatingAirlineCodes
      }));
    } catch (error) {
      console.error('Flight search error:', error);
      throw error;
    }
  }

  async searchLocations(keyword) {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(
        `${AMADEUS_API_URL}/reference-data/locations?keyword=${encodeURIComponent(keyword)}&subType=CITY,AIRPORT&page[limit]=10&view=LIGHT`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.errors?.[0]?.detail || 'Location search failed');
      }

      return data.data.map(location => ({
        iataCode: location.iataCode,
        name: location.name,
        cityName: location.address?.cityName,
        countryCode: location.address?.countryCode,
        type: location.subType
      }));
    } catch (error) {
      console.error('Location search error:', error);
      throw error;
    }
  }
}

export const amadeusService = new AmadeusService(); 