import { createSignal, Show, For, onMount } from "solid-js";
import { FiSend, FiRefreshCw, FiCheck, FiArrowLeft } from 'solid-icons/fi';
import styles from "./Prompt.module.css";
import { useNavigate, useLocation } from "@solidjs/router";
import { commissionRate } from "../state/commissionsState"; // Import commission rate

function Prompt() {
  const location = useLocation();
  // Modified state initialization to handle incoming search
  const [prompt, setPrompt] = createSignal(location.state?.initialPrompt || "");
  const [isLoading, setIsLoading] = createSignal(false);
  const [itineraries, setItineraries] = createSignal([]);
  const [error, setError] = createSignal(null);
  const navigate = useNavigate();

  // System prompt that instructs GPT how to format responses
  const systemPrompt = `You are a travel planning assistant. Generate 3 distinct travel itineraries based on the user's request.
If no duration is specified, create itineraries for 7 nights / 8 days.

Format your response as a JSON array with exactly 3 itinerary objects. Each itinerary must strictly follow this format:
{
  "title": "Catchy name for the itinerary",
  "origin": "City, Country",
  "destination": "City, Country",
  "summary": "Brief overview of the experience",
  "highlights": ["Key feature 1", "Key feature 2", "Key feature 3"],
  "dailyPlan": [
    "Day 1: Detailed description of activities",
    "Day 2: Detailed description of activities",
    ... (continue for all days)
  ],
  "estimatedCost": 5000,
  "travelDates": "Suggested date range",
  "accommodation": "Detailed hotel or resort information",
  "transportation": "Flight and transfer details"
}

Requirements:
- origin and destination must include both city and country
- dailyPlan must be an array of strings, one for each day
- estimatedCost must be a number (not a string)
- Each day in dailyPlan should start with 'Day X: '
- Keep each itinerary unique with varied options and pricing
- Include at least 7 nights unless specifically requested otherwise
- Provide comprehensive daily activities for each day`;

  // Add this onMount to check for preserved state
  onMount(() => {
    if (location.state?.generatedTrips && location.state?.preserveInput) {
      setItineraries(location.state.generatedTrips);
      // Reconstruct the original prompt from preserved data
      const promptText = `Trip from ${location.state.origin} to ${location.state.destination} during ${location.state.dates}. Preferences: ${location.state.preferences.join(', ')}`;
      setPrompt(promptText);
    }
  });

  // Add this onMount to handle incoming search
  onMount(() => {
    if (location.state?.initialPrompt && location.state?.fromHome) {
      // Automatically trigger search if coming from home page
      handleSubmit(new Event('submit'));
    }
  });

  // Handle form submission to generate itineraries
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt().trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Make API call to OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt() }
          ],
          temperature: 0.7,
          max_tokens: 2500
        })
      });

      // Process and validate the response
      if (!response.ok) {
        throw new Error('Failed to generate itineraries');
      }

      const data = await response.json();
      let parsedItineraries;
      
      try {
        // Parse and validate the itineraries
        parsedItineraries = JSON.parse(data.choices[0].message.content);
        
        parsedItineraries.forEach((itinerary, index) => {
          if (!Array.isArray(itinerary.dailyPlan)) {
            throw new Error(`Itinerary ${index + 1} has invalid dailyPlan format`);
          }
          if (typeof itinerary.estimatedCost !== 'number') {
            itinerary.estimatedCost = parseFloat(itinerary.estimatedCost.replace(/[^0-9.]/g, ''));
          }
        });
        
        setItineraries(parsedItineraries);
      } catch (parseError) {
        console.error('Parsing error:', parseError);
        throw new Error('Failed to parse itineraries. Invalid format received.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(`Failed to generate itineraries: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle regeneration of a single itinerary
  const regenerateItinerary = async (index) => {
    try {
      setIsLoading(true);
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemPrompt },
            { 
              role: "user", 
              content: `${prompt()}\n\nGenerate a single new alternative itinerary following the exact same format.` 
            }
          ],
          temperature: 0.9,
          max_tokens: 2500
        })
      });

      if (!response.ok) throw new Error('Failed to regenerate itinerary');

      const data = await response.json();
      let newItineraries;
      
      try {
        newItineraries = JSON.parse(data.choices[0].message.content);
        // Ensure we get an array and take the first item
        const newItinerary = Array.isArray(newItineraries) ? newItineraries[0] : newItineraries;
        
        // Validate the new itinerary structure
        if (!newItinerary.origin || !newItinerary.destination || !Array.isArray(newItinerary.dailyPlan)) {
          throw new Error('Invalid itinerary format received');
        }

        // Convert estimatedCost to number if it's a string
        if (typeof newItinerary.estimatedCost !== 'number') {
          newItinerary.estimatedCost = parseFloat(newItinerary.estimatedCost.replace(/[^0-9.]/g, ''));
        }
        
        setItineraries(prev => {
          const updated = [...prev];
          updated[index] = newItinerary;
          return updated;
        });
      } catch (parseError) {
        console.error('Parsing error:', parseError);
        throw new Error('Failed to parse regenerated itinerary. Invalid format received.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(`Failed to regenerate itinerary: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to selected itinerary page
  const handleSelectItinerary = (selectedItinerary) => {
    navigate('/selected-itinerary', {
      state: {
        itinerary: selectedItinerary,
        generatedTrips: itineraries(),
        origin: selectedItinerary.origin,
        destination: selectedItinerary.destination,
        dates: selectedItinerary.travelDates,
        preferences: selectedItinerary.highlights,
        preserveInput: true
      }
    });
  };

  // Add a function to clear preserved state if user starts new search
  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
    // Clear preserved state when user starts typing new prompt
    if (location.state?.preserveInput) {
      navigate('.', { replace: true, state: {} });
    }
  };

  // Calculate commission for an itinerary
  const calculateCommission = (price) => {
    return price * commissionRate();
  };

  return (
    <div class={styles.promptPage}>
      <div class={styles.container}>
        {/* Add back button when coming from home */}
        {location.state?.fromHome && (
          <button 
            class={styles.backButton}
            onClick={() => navigate('/')}
          >
            <FiArrowLeft /> Back to Home
          </button>
        )}

        {/* Page header section */}
        <h1>Travel Itinerary Generator</h1>
        <p class={styles.subtitle}>
          Describe your ideal trip and get three customized itinerary options
        </p>

        {/* Prompt input form */}
        <form onSubmit={handleSubmit} class={styles.promptForm}>
          <textarea
            value={prompt()}
            onInput={handlePromptChange}
            placeholder="Example: I want a luxury beach vacation in Bali for 5 days in August, including flights from NYC, 5-star resort, and spa treatments. Budget is $5000 per person."
            disabled={isLoading()}
          />
          <button type="submit" disabled={isLoading() || !prompt().trim()}>
            <FiSend /> Generate Itineraries
          </button>
        </form>

        {/* Error message display */}
        <Show when={error()}>
          <div class={styles.error}>{error()}</div>
        </Show>

        {/* Loading state display */}
        <Show when={isLoading()}>
          <div class={styles.loading}>Generating your perfect itineraries...</div>
        </Show>

        {/* Generated itineraries grid */}
        <div class={styles.itinerariesGrid}>
          <For each={itineraries()}>
            {(itinerary, index) => (
              <div class={styles.itineraryCard}>
                {/* Origin/Destination banner */}
                <div class={styles.locationBanner}>
                  <div class={styles.location}>
                    <span class={styles.locationLabel}>From:</span>
                    <span class={styles.locationText}>{itinerary.origin}</span>
                  </div>
                  <div class={styles.locationDivider}>→</div>
                  <div class={styles.location}>
                    <span class={styles.locationLabel}>To:</span>
                    <span class={styles.locationText}>{itinerary.destination}</span>
                  </div>
                </div>

                {/* Itinerary title and summary */}
                <h2>{itinerary.title}</h2>
                <p class={styles.summary}>{itinerary.summary}</p>
                
                {/* Highlights section */}
                <div class={styles.highlights}>
                  <h3>Highlights</h3>
                  <ul>
                    <For each={itinerary.highlights}>
                      {highlight => <li>{highlight}</li>}
                    </For>
                  </ul>
                </div>

                {/* Trip details section */}
                <div class={styles.details}>
                  <div class={styles.detailItem}>
                    <strong>Dates:</strong> {itinerary.travelDates}
                  </div>
                  <div class={styles.detailItem}>
                    <strong>Cost:</strong> ${itinerary.estimatedCost.toLocaleString()}
                  </div>
                </div>

                {/* Accommodation details */}
                <div class={styles.accommodation}>
                  <h3>Accommodation</h3>
                  <p>{itinerary.accommodation}</p>
                </div>

                {/* Transportation details */}
                <div class={styles.transportation}>
                  <h3>Transportation</h3>
                  <p>{itinerary.transportation}</p>
                </div>

                {/* Daily plan timeline */}
                <div class={styles.dailyPlan}>
                  <h3>Daily Plan</h3>
                  <div class={styles.timeline}>
                    <Show 
                      when={Array.isArray(itinerary.dailyPlan)} 
                      fallback={<div class={styles.error}>Daily plan not available</div>}
                    >
                      <For each={itinerary.dailyPlan}>
                        {(day, i) => (
                          <div class={styles.timelineItem}>
                            <div class={styles.timelineDay}>
                              Day {i() + 1}
                            </div>
                            <div class={styles.timelineContent}>
                              {day.replace(`Day ${i() + 1}:`, '').trim()}
                            </div>
                          </div>
                        )}
                      </For>
                    </Show>
                  </div>
                </div>

                {/* Card action buttons */}
                <div class={styles.cardActions}>
                  <button 
                    onClick={() => handleSelectItinerary(itinerary)}
                    class={styles.selectButton}
                  >
                    <FiCheck /> Select Itinerary
                  </button>
                  <button 
                    onClick={() => regenerateItinerary(index())}
                    class={styles.regenerateButton}
                    disabled={isLoading()}
                  >
                    <FiRefreshCw /> Regenerate
                  </button>
                  <div class={styles.priceInfo}>
                    <span class={styles.price}>
                      ${itinerary.estimatedCost?.toLocaleString()}
                    </span>
                    <span class={styles.commission}>
                      (Commission: ${calculateCommission(itinerary.estimatedCost).toLocaleString()})
                    </span>
                  </div>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  );
}

export default Prompt; 