const BASE_URLS = {
  inventory: import.meta.env.VITE_INVENTORY_SERVICE_URL,
  search: import.meta.env.VITE_SEARCH_SERVICE_URL,
  quotes: import.meta.env.VITE_QUOTES_SERVICE_URL
};

export const searchFlights = async (params) => {
  try {
    const response = await fetch(`${BASE_URLS.search}/api/flights`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      params: new URLSearchParams(params)
    });
    return await response.json();
  } catch (error) {
    console.error('Error searching flights:', error);
    throw error;
  }
};

export const searchHotels = async (params) => {
  try {
    const response = await fetch(`${BASE_URLS.search}/api/hotels`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      params: new URLSearchParams(params)
    });
    return await response.json();
  } catch (error) {
    console.error('Error searching hotels:', error);
    throw error;
  }
};

export const saveItinerary = async (itineraryData) => {
  try {
    const response = await fetch(`${BASE_URLS.quotes}/api/quotes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itineraryData)
    });
    return await response.json();
  } catch (error) {
    console.error('Error saving itinerary:', error);
    throw error;
  }
}; 