const STORAGE_KEY = 'savedItineraries';

export const itineraryStorage = {
  saveItinerary(itinerary) {
    try {
      const savedItineraries = this.getAllItineraries();
      const timestamp = new Date().toISOString();
      
      const itineraryToSave = {
        id: crypto.randomUUID(),
        name: itinerary.name || `Itinerary ${savedItineraries.length + 1}`,
        createdAt: timestamp,
        updatedAt: timestamp,
        data: itinerary,
        version: 1
      };

      savedItineraries.push(itineraryToSave);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedItineraries));
      return itineraryToSave;
    } catch (error) {
      console.error('Error saving itinerary:', error);
      throw error;
    }
  },

  getAllItineraries() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error getting itineraries:', error);
      return [];
    }
  },

  getItineraryById(id) {
    try {
      const itineraries = this.getAllItineraries();
      return itineraries.find(item => item.id === id);
    } catch (error) {
      console.error('Error getting itinerary:', error);
      return null;
    }
  },

  updateItinerary(id, updates) {
    try {
      const itineraries = this.getAllItineraries();
      const index = itineraries.findIndex(item => item.id === id);
      
      if (index !== -1) {
        itineraries[index] = {
          ...itineraries[index],
          ...updates,
          updatedAt: new Date().toISOString(),
          version: (itineraries[index].version || 1) + 1
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(itineraries));
        return itineraries[index];
      }
      return null;
    } catch (error) {
      console.error('Error updating itinerary:', error);
      throw error;
    }
  },

  deleteItinerary(id) {
    try {
      const itineraries = this.getAllItineraries();
      const filtered = itineraries.filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting itinerary:', error);
      throw error;
    }
  }
}; 