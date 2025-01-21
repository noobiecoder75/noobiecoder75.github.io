import { createSignal, Show, For, onMount, onCleanup } from "solid-js";
import { FiSearch, FiCalendar, FiUsers, FiDollarSign, FiMessageSquare, FiList, FiMapPin, FiSave, FiFolder, FiTrash2, FiEdit3 } from 'solid-icons/fi';
import styles from "./NewQuote.module.css";
import ItineraryBuilder from "../components/itinerary/ItineraryBuilder";
import { searchService } from "../services/searchService";
import { locationService } from "../services/locationService";
import { itineraryStorage } from "../services/itineraryStorage";

function NewQuote() {
  const [activeMethod, setActiveMethod] = createSignal('chat'); // Default to chat
  const [chatMessage, setChatMessage] = createSignal("");
  const [formData, setFormData] = createSignal({
    origin: "YVR", // Default to Vancouver
    destination: "",
    dates: { start: "", end: "" },
    travelers: 1,
    budget: "",
    preferences: ""
  });
  const [searchResults, setSearchResults] = createSignal([]);
  const [error, setError] = createSignal(null);
  const [isSearching, setIsSearching] = createSignal(false);
  const [originSuggestions, setOriginSuggestions] = createSignal([]);
  const [destSuggestions, setDestSuggestions] = createSignal([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = createSignal(false);
  const [showDestSuggestions, setShowDestSuggestions] = createSignal(false);
  const [savedItineraries, setSavedItineraries] = createSignal([]);
  const [showLoadDialog, setShowLoadDialog] = createSignal(false);
  const [currentItineraryId, setCurrentItineraryId] = createSignal(null);
  const [notification, setNotification] = createSignal(null);

  onMount(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(`.${styles.locationInput}`)) {
        setShowOriginSuggestions(false);
        setShowDestSuggestions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    onCleanup(() => document.removeEventListener('click', handleClickOutside));
    loadSavedItineraries();
  });

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSearching(true);

    try {
      const results = await searchService.search({
        naturalLanguage: true,
        query: chatMessage()
      });
      
      setSearchResults(results);
      if (results.length === 0) {
        setError('No results found');
      }
    } catch (error) {
      console.error("Search error:", error);
      setError('An error occurred while searching. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    console.log('🏁 Starting form submission with data:', formData());

    // Validate required fields
    if (!formData().origin || !formData().destination || !formData().dates.start) {
      const missingFields = [];
      if (!formData().origin) missingFields.push('origin');
      if (!formData().destination) missingFields.push('destination');
      if (!formData().dates.start) missingFields.push('departure date');
      
      console.warn('❌ Validation failed - Missing required fields:', missingFields);
      setError('Please fill in origin, destination, and departure date');
      return;
    }

    setIsSearching(true);

    try {
      const formattedParams = {
        from: formData().origin.toUpperCase(),
        to: formData().destination.toUpperCase(),
        date: formData().dates.start,
        returnDate: formData().dates.end,
        adults: parseInt(formData().travelers) || 1,
        maxPrice: formData().budget ? parseFloat(formData().budget) : 10000,
        type: 'flights'
      };

      console.log('📝 Formatted parameters:', formattedParams);

      // Validate IATA codes
      const originValid = /^[A-Z]{3}$/.test(formattedParams.from);
      const destValid = /^[A-Z]{3}$/.test(formattedParams.to);
      
      if (!originValid || !destValid) {
        console.error('❌ IATA code validation failed:', {
          origin: {
            code: formattedParams.from,
            valid: originValid
          },
          destination: {
            code: formattedParams.to,
            valid: destValid
          }
        });
        setError('Please use valid 3-letter IATA airport codes (e.g., YVR, LAX)');
        return;
      }

      console.log('✈️ Making search request to API...');
      const results = await searchService.search(formattedParams);
      console.log('📦 Received results:', {
        count: results.length,
        firstResult: results[0],
        lastResult: results[results.length - 1]
      });
      
      setSearchResults(results);
      if (results.length === 0) {
        console.warn('⚠️ No results found for search criteria');
        setError('No flights found for these criteria');
      } else {
        console.log('✅ Search completed successfully with', results.length, 'results');
      }
    } catch (error) {
      console.error('❌ Search error:', {
        message: error.message,
        stack: error.stack,
        formData: formData(),
      });

      let errorMessage = 'An error occurred while searching for flights.';
      if (error.message.includes('invalid')) {
        errorMessage = 'Please check your airport codes and dates.';
        console.error('❌ Invalid input error:', error.message);
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection.';
        console.error('❌ Network error:', error.message);
      } else {
        console.error('❌ Unexpected error:', error);
      }
      setError(errorMessage);
    } finally {
      console.log('🏁 Search process completed');
      setIsSearching(false);
    }
  };

  const searchLocations = async (query, type) => {
    if (query.length < 2) return;
    
    try {
      const results = await locationService.searchLocations(query);
      if (type === 'origin') {
        setOriginSuggestions(results);
        setShowOriginSuggestions(true);
      } else {
        setDestSuggestions(results);
        setShowDestSuggestions(true);
      }
    } catch (error) {
      console.error('Location search error:', error);
    }
  };

  const loadSavedItineraries = () => {
    const itineraries = itineraryStorage.getAllItineraries();
    setSavedItineraries(itineraries);
  };

  const handleSaveItinerary = async () => {
    try {
      const itineraryData = {
        name: `Itinerary ${savedItineraries().length + 1}`,
        searchResults: searchResults(),
        formData: formData(),
        activeMethod: activeMethod(),
        chatMessage: chatMessage(),
        // Add any other state you want to preserve
      };

      if (currentItineraryId()) {
        await itineraryStorage.updateItinerary(currentItineraryId(), {
          ...itineraryData,
          name: `Itinerary ${currentItineraryId()}` // Preserve the original name
        });
      } else {
        const saved = await itineraryStorage.saveItinerary(itineraryData);
        setCurrentItineraryId(saved.id);
      }

      loadSavedItineraries();
    } catch (error) {
      console.error('Failed to save itinerary:', error);
      setError('Failed to save itinerary');
    }
  };

  const handleLoadItinerary = (itinerary) => {
    try {
      // Update form data
      setFormData(itinerary.data.formData);
      
      // Update search results
      setSearchResults(itinerary.data.searchResults);
      
      // Update active method based on saved data
      if (itinerary.data.activeMethod) {
        setActiveMethod(itinerary.data.activeMethod);
      }
      
      // Update chat message if it exists
      if (itinerary.data.chatMessage) {
        setChatMessage(itinerary.data.chatMessage);
      }

      // Set current itinerary ID
      setCurrentItineraryId(itinerary.id);
      
      // Close the dialog
      setShowLoadDialog(false);

      // Clear any existing errors
      setError(null);

      // Show success notification
      setNotification({
        type: 'success',
        message: `Loaded itinerary: ${itinerary.name}`
      });

      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Failed to load itinerary:', error);
      setError('Failed to load itinerary');
    }
  };

  const handleDeleteItinerary = async (id) => {
    try {
      await itineraryStorage.deleteItinerary(id);
      loadSavedItineraries();
      if (currentItineraryId() === id) {
        setCurrentItineraryId(null);
      }
    } catch (error) {
      setError('Failed to delete itinerary');
    }
  };

  return (
    <div class={styles.quotePage}>
      <Show when={notification()}>
        <div class={`${styles.notification} ${styles[notification().type]}`}>
          {notification().message}
        </div>
      </Show>

      <div class={styles.actionButtons}>
        <button 
          onClick={handleSaveItinerary}
          class={styles.saveButton}
        >
          <FiSave /> {currentItineraryId() ? 'Update' : 'Save'} Itinerary
        </button>
        <button 
          onClick={() => setShowLoadDialog(true)}
          class={styles.loadButton}
        >
          <FiFolder /> Load Itinerary
        </button>
      </div>

      <Show when={showLoadDialog()}>
        <div class={styles.dialogOverlay}>
          <div class={styles.dialog}>
            <h2>Saved Itineraries</h2>
            <div class={styles.itinerariesList}>
              <For each={savedItineraries()}>
                {(itinerary) => (
                  <div class={styles.savedItinerary}>
                    <div class={styles.itineraryInfo}>
                      <h3>{itinerary.name}</h3>
                      <span>Last updated: {new Date(itinerary.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <div class={styles.itineraryActions}>
                      <button 
                        onClick={() => handleLoadItinerary(itinerary)}
                        class={styles.loadButton}
                      >
                        <FiEdit3 /> Load
                      </button>
                      <button 
                        onClick={() => handleDeleteItinerary(itinerary.id)}
                        class={styles.deleteButton}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                )}
              </For>
            </div>
            <button 
              onClick={() => setShowLoadDialog(false)}
              class={styles.closeButton}
            >
              Close
            </button>
          </div>
        </div>
      </Show>

      <div class={styles.searchContainer}>
        {/* Toggle Buttons */}
        <div class={styles.methodToggle}>
          <button 
            class={`${styles.toggleButton} ${activeMethod() === 'chat' ? styles.active : ''}`}
            onClick={() => setActiveMethod('chat')}
          >
            <FiMessageSquare />
            Chat with AI
          </button>
          <button 
            class={`${styles.toggleButton} ${activeMethod() === 'form' ? styles.active : ''}`}
            onClick={() => setActiveMethod('form')}
          >
            <FiList />
            Use Form
          </button>
        </div>

        {/* Input Methods */}
        <Show when={activeMethod() === 'chat'}>
          <div class={styles.chatInterface}>
            <h2>Describe Your Perfect Trip</h2>
            <form onSubmit={handleChatSubmit} class={styles.chatForm}>
              <div class={styles.chatInput}>
                <textarea
                  value={chatMessage()}
                  onInput={(e) => setChatMessage(e.target.value)}
                  placeholder="Example: I'm looking for a romantic getaway to Paris next June for 2 people. We'd like to stay in a 4-star hotel near the Eiffel Tower and our budget is $3000."
                  rows="4"
                />
              </div>
              <button 
                type="submit" 
                class={styles.searchButton}
                disabled={isSearching()}
              >
                {isSearching() ? 'Processing...' : 'Search with AI'}
              </button>
            </form>
            
            {/* Add error display */}
            <Show when={error()}>
              <div class={styles.errorMessage}>
                {error()}
              </div>
            </Show>
          </div>
        </Show>

        <Show when={activeMethod() === 'form'}>
          <div class={styles.formInterface}>
            <h2>Enter Trip Details</h2>
            <form onSubmit={handleFormSubmit} class={styles.tripForm}>
              <div class={styles.formGrid}>
                {/* Origin City */}
                <div class={styles.formGroup}>
                  <label>
                    <FiMapPin />
                    <span>From</span>
                  </label>
                  <div class={styles.locationInput}>
                    <input
                      type="text"
                      value={formData().origin}
                      onInput={(e) => {
                        const value = e.target.value;
                        setFormData({ ...formData(), origin: value });
                        searchLocations(value, 'origin');
                      }}
                      onFocus={() => setShowOriginSuggestions(true)}
                      placeholder="City or airport code"
                    />
                    <Show when={showOriginSuggestions() && originSuggestions().length > 0}>
                      <div class={styles.suggestions}>
                        <For each={originSuggestions()}>
                          {(suggestion) => (
                            <div
                              class={styles.suggestionItem}
                              onClick={() => {
                                setFormData({ ...formData(), origin: suggestion.iataCode });
                                setShowOriginSuggestions(false);
                              }}
                            >
                              {suggestion.displayName}
                            </div>
                          )}
                        </For>
                      </div>
                    </Show>
                  </div>
                </div>

                {/* Destination */}
                <div class={styles.formGroup}>
                  <label>
                    <FiSearch />
                    <span>To</span>
                  </label>
                  <div class={styles.locationInput}>
                    <input
                      type="text"
                      value={formData().destination}
                      onInput={(e) => {
                        const value = e.target.value;
                        setFormData({ ...formData(), destination: value });
                        searchLocations(value, 'destination');
                      }}
                      onFocus={() => setShowDestSuggestions(true)}
                      placeholder="City or airport code"
                    />
                    <Show when={showDestSuggestions() && destSuggestions().length > 0}>
                      <div class={styles.suggestions}>
                        <For each={destSuggestions()}>
                          {(suggestion) => (
                            <div
                              class={styles.suggestionItem}
                              onClick={() => {
                                setFormData({ ...formData(), destination: suggestion.iataCode });
                                setShowDestSuggestions(false);
                              }}
                            >
                              {suggestion.displayName}
                            </div>
                          )}
                        </For>
                      </div>
                    </Show>
                  </div>
                </div>

                {/* Dates - Full Width */}
                <div class={styles.formGroup + ' ' + styles.fullWidth}>
                  <label>
                    <FiCalendar />
                    <span>Travel Dates</span>
                  </label>
                  <div class={styles.dateInputs}>
                    <input
                      type="date"
                      value={formData().dates.start}
                      onInput={(e) => setFormData({
                        ...formData(),
                        dates: { ...formData().dates, start: e.target.value }
                      })}
                    />
                    <span>to</span>
                    <input
                      type="date"
                      value={formData().dates.end}
                      onInput={(e) => setFormData({
                        ...formData(),
                        dates: { ...formData().dates, end: e.target.value }
                      })}
                    />
                  </div>
                </div>

                {/* Travelers */}
                <div class={styles.formGroup}>
                  <label>
                    <FiUsers />
                    <span>Travelers</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData().travelers}
                    onInput={(e) => setFormData({
                      ...formData(),
                      travelers: e.target.value
                    })}
                  />
                </div>

                {/* Budget */}
                <div class={styles.formGroup}>
                  <label>
                    <FiDollarSign />
                    <span>Budget</span>
                  </label>
                  <input
                    type="number"
                    value={formData().budget}
                    onInput={(e) => setFormData({
                      ...formData(),
                      budget: e.target.value
                    })}
                    placeholder="Total budget in USD"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                class={styles.searchButton}
                disabled={isSearching()}
              >
                <FiSearch /> {isSearching() ? 'Searching...' : 'Search Flights'}
              </button>
            </form>
          </div>
        </Show>
      </div>

      {/* Results Section */}
      <div class={styles.resultsContainer}>
        <ItineraryBuilder 
          initialResults={searchResults()} 
          isLoading={isSearching()} 
          error={error()}
        />
      </div>
    </div>
  );
}

export default NewQuote; 