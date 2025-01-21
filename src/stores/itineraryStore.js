import { createStore } from "solid-js/store";

const [itinerary, setItinerary] = createStore({
  segments: [],
  totalPrice: {
    amount: 0,
    currency: 'USD'
  },
  dateRange: {
    start: null,
    end: null
  }
});

export const itineraryStore = {
  get segments() {
    return itinerary.segments;
  },

  get totalPrice() {
    return itinerary.totalPrice;
  },

  addSegment(segment) {
    setItinerary("segments", [...itinerary.segments, segment]);
    this.updateTotalPrice();
  },

  removeSegment(segmentId) {
    setItinerary("segments", 
      itinerary.segments.filter(s => s.id !== segmentId)
    );
    this.updateTotalPrice();
  },

  reorderSegments(startIndex, endIndex) {
    const segments = [...itinerary.segments];
    const [removed] = segments.splice(startIndex, 1);
    segments.splice(endIndex, 0, removed);
    setItinerary("segments", segments);
  },

  updateTotalPrice() {
    const total = itinerary.segments.reduce(
      (sum, segment) => sum + parseFloat(segment.price.amount), 
      0
    );
    
    setItinerary("totalPrice", {
      amount: total.toFixed(2),
      currency: itinerary.segments[0]?.price.currency || 'USD'
    });
  },

  clear() {
    setItinerary({
      segments: [],
      totalPrice: {
        amount: 0,
        currency: 'USD'
      },
      dateRange: { start: null, end: null }
    });
  }
}; 