import { createSignal, For, Show, createEffect } from "solid-js";
import { DragDropProvider, DragDropSensors } from "@thisbeyond/solid-dnd";
import { FiSearch, FiCalendar, FiUsers, FiDollarSign, FiSave } from 'solid-icons/fi';
import { itineraryStore } from "../../stores/itineraryStore";
import { searchService } from "../../services/searchService";
import { locationService } from "../../services/locationService";
import { itineraryStorage } from "../../services/itineraryStorage";
import styles from "./ItineraryBuilder.module.css";

function ItineraryBuilder(props) {
  const [searchResults, setSearchResults] = createSignal(props.initialResults || []);
  const [displayCount, setDisplayCount] = createSignal(10);
  const [selectedFlight, setSelectedFlight] = createSignal(null);

  createEffect(() => {
    if (props.initialResults) {
      setSearchResults(props.initialResults);
    }
  });

  const formatDuration = (duration) => {
    return duration.replace('PT', '').toLowerCase();
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const handleDragEnd = ({ draggable, droppable }) => {
    if (draggable && droppable) {
      const fromIndex = Number(draggable.id);
      const toIndex = Number(droppable.id);
      itineraryStore.reorderSegments(fromIndex, toIndex);
    }
  };

  const handleSaveItinerary = async () => {
    try {
      const itineraryData = {
        name: `Custom Itinerary`,
        searchResults: props.searchResults || [],
        segments: [], // Add any segments or selected items
        totalPrice: {
          amount: 0, // Calculate total from selected items
          currency: 'USD'
        },
        dateRange: {
          start: null,
          end: null
        }
      };

      const saved = await itineraryStorage.saveItinerary(itineraryData);
      
      // Show success message or notification
      alert('Itinerary saved successfully!');
      
      // Optionally, you can call a callback if provided in props
      if (props.onSave) {
        props.onSave(saved);
      }
    } catch (error) {
      console.error('Failed to save itinerary:', error);
      alert('Failed to save itinerary. Please try again.');
    }
  };

  return (
    <div class={styles.builderContainer}>
      {/* Left Panel - Results */}
      <div class={styles.searchPanel}>
        <h2>Available Options</h2>

        {/* Loading and Error States */}
        <Show when={props.isLoading}>
          <div class={styles.loading}>Searching for flights...</div>
        </Show>

        <Show when={props.error}>
          <div class={styles.error}>{props.error}</div>
        </Show>

        {/* Results Display */}
        <Show when={searchResults().length > 0}>
          <div class={styles.searchResults}>
            <h3>Search Results</h3>
            <For each={searchResults().slice(0, displayCount())}>
              {(result) => (
                <Show when={result.type === 'flight'}>
                  <div class={styles.flightCard}>
                    <div class={styles.flightHeader}>
                      <span class={styles.airline}>
                        {result.validatingAirlineCodes[0]}
                      </span>
                      <div class={styles.flightActions}>
                        <button 
                          class={styles.detailsButton}
                          onClick={() => setSelectedFlight(
                            selectedFlight() === result.id ? null : result.id
                          )}
                        >
                          {selectedFlight() === result.id ? 'Hide Details' : 'View Details'}
                        </button>
                        <button 
                          onClick={() => itineraryStore.addSegment(result)}
                          class={styles.addButton}
                        >
                          <div class={styles.buttonContent}>
                            <span class={styles.priceText}>
                              ${result.price.amount} {result.price.currency}
                            </span>
                            <span class={styles.addText}>Add to Itinerary</span>
                          </div>
                        </button>
                      </div>
                    </div>
                    
                    <div class={styles.routeInfo}>
                      <div class={styles.route}>
                        <div class={styles.locationTime}>
                          <span class={styles.time}>
                            {formatDateTime(result.itineraries[0].segments[0].departure.at).time}
                          </span>
                          <span class={styles.location}>
                            {result.itineraries[0].segments[0].departure.iataCode}
                          </span>
                          <span class={styles.date}>
                            {formatDateTime(result.itineraries[0].segments[0].departure.at).date}
                          </span>
                        </div>

                        <div class={styles.flightDuration}>
                          <span class={styles.duration}>
                            {formatDuration(result.itineraries[0].duration)}
                          </span>
                          <div class={styles.flightLine}>
                            <span class={styles.airplane}>✈</span>
                          </div>
                        </div>

                        <div class={styles.locationTime}>
                          <span class={styles.time}>
                            {formatDateTime(result.itineraries[0].segments[0].arrival.at).time}
                          </span>
                          <span class={styles.location}>
                            {result.itineraries[0].segments[0].arrival.iataCode}
                          </span>
                          <span class={styles.date}>
                            {formatDateTime(result.itineraries[0].segments[0].arrival.at).date}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Show when={selectedFlight() === result.id}>
                      <div class={styles.flightDetails}>
                        <h4>Flight Details</h4>
                        {/* Outbound Journey */}
                        <div class={styles.journey}>
                          <h5>Outbound Flight</h5>
                          <For each={result.itineraries[0].segments}>
                            {(segment, index) => (
                              <div class={styles.segment}>
                                <div class={styles.compactSegmentDetails}>
                                  <div class={styles.flightIdentifier}>
                                    Flight {segment.carrierCode} {segment.number}
                                  </div>
                                  
                                  <div class={styles.timelineView}>
                                    <div class={styles.timeLocation}>
                                      <span class={styles.time}>
                                        {formatDateTime(segment.departure.at).time}
                                      </span>
                                      <span class={styles.location}>
                                        {segment.departure.iataCode}
                                        <span class={styles.terminal}>
                                          {segment.departure.terminal && `T${segment.departure.terminal}`}
                                        </span>
                                      </span>
                                    </div>

                                    <div class={styles.flightPath}>
                                      <span class={styles.duration}>
                                        {formatDuration(segment.duration)}
                                      </span>
                                      <div class={styles.pathLine}>
                                        <span class={styles.airplane}>✈</span>
                                      </div>
                                    </div>

                                    <div class={styles.timeLocation}>
                                      <span class={styles.time}>
                                        {formatDateTime(segment.arrival.at).time}
                                      </span>
                                      <span class={styles.location}>
                                        {segment.arrival.iataCode}
                                        <span class={styles.terminal}>
                                          {segment.arrival.terminal && `T${segment.arrival.terminal}`}
                                        </span>
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </For>
                        </div>

                        {/* Return Journey if exists */}
                        <Show when={result.itineraries[1]}>
                          <div class={styles.journey}>
                            <h5>Return Flight</h5>
                            <For each={result.itineraries[1].segments}>
                              {(segment) => (
                                <div class={styles.segment}>
                                  <div class={styles.compactSegmentDetails}>
                                    <div class={styles.flightIdentifier}>
                                      Flight {segment.carrierCode} {segment.number}
                                    </div>
                                    
                                    <div class={styles.timelineView}>
                                      <div class={styles.timeLocation}>
                                        <span class={styles.time}>
                                          {formatDateTime(segment.departure.at).time}
                                        </span>
                                        <span class={styles.location}>
                                          {segment.departure.iataCode}
                                          <span class={styles.terminal}>
                                            {segment.departure.terminal && `T${segment.departure.terminal}`}
                                          </span>
                                        </span>
                                      </div>

                                      <div class={styles.flightPath}>
                                        <span class={styles.duration}>
                                          {formatDuration(segment.duration)}
                                        </span>
                                        <div class={styles.pathLine}>
                                          <span class={styles.airplane}>✈</span>
                                        </div>
                                      </div>

                                      <div class={styles.timeLocation}>
                                        <span class={styles.time}>
                                          {formatDateTime(segment.arrival.at).time}
                                        </span>
                                        <span class={styles.location}>
                                          {segment.arrival.iataCode}
                                          <span class={styles.terminal}>
                                            {segment.arrival.terminal && `T${segment.arrival.terminal}`}
                                          </span>
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </For>
                          </div>
                        </Show>
                      </div>
                    </Show>
                  </div>
                </Show>
              )}
            </For>

            <Show when={searchResults().length > displayCount()}>
              <button 
                class={styles.loadMoreButton}
                onClick={() => setDisplayCount(displayCount() + 20)}
              >
                View More Flights
              </button>
            </Show>
          </div>
        </Show>
      </div>

      {/* Right Panel - Itinerary */}
      <div class={styles.itineraryPanel}>
        <h2>Your Itinerary</h2>
        <DragDropProvider onDragEnd={handleDragEnd}>
          <DragDropSensors>
            <div class={styles.itineraryList}>
              <For each={itineraryStore.segments}>
                {(segment, index) => (
                  <div class={styles.segment}>
                    <div class={styles.dragHandle}>⋮</div>
                    <div class={styles.segmentContent}>
                      <div class={styles.compactItineraryFlight}>
                        <div class={styles.flightMainInfo}>
                          <span class={styles.airline}>{segment.validatingAirlineCodes[0]}</span>
                          <div class={styles.miniRoute}>
                            <span>{segment.itineraries[0].segments[0].departure.iataCode}</span>
                            <span class={styles.miniArrow}>→</span>
                            <span>{segment.itineraries[0].segments[0].arrival.iataCode}</span>
                            {segment.itineraries[1] && (
                              <>
                                <span class={styles.returnArrow}>↩</span>
                                <span>{formatDateTime(segment.itineraries[1].segments[0].departure.at).date}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div class={styles.flightSecondaryInfo}>
                          <span class={styles.date}>
                            {formatDateTime(segment.itineraries[0].segments[0].departure.at).date}
                          </span>
                          <span class={styles.price}>
                            {segment.price.amount} {segment.price.currency}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => itineraryStore.removeSegment(segment.id)}
                      class={styles.removeButton}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </For>
            </div>
          </DragDropSensors>
        </DragDropProvider>

        <div class={styles.itinerarySummary}>
          <div class={styles.summaryDetails}>
            <div class={styles.summaryItem}>
              <span>Total Days:</span>
              <span>{itineraryStore.segments.length}</span>
            </div>
            <div class={styles.summaryItem}>
              <span>Total Price:</span>
              <span>
                {itineraryStore.totalPrice.amount} {itineraryStore.totalPrice.currency}
              </span>
            </div>
          </div>
          <button 
            onClick={handleSaveItinerary}
            class={styles.saveButton}
          >
            <FiSave /> Save Itinerary
          </button>
        </div>
      </div>
    </div>
  );
}

export default ItineraryBuilder; 