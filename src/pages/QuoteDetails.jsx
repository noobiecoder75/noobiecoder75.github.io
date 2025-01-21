import { createSignal, onMount, Show, createEffect } from "solid-js";
import { useNavigate, useParams } from "@solidjs/router";
import { 
  TbArrowLeft,
  TbMail,
  TbTrash,
  TbCopy,
  TbShare,
  TbPlane,
  TbHome,
  TbCar,
  TbMap,
  TbCalendar,
  TbUsers,
  TbAlertCircle,
  TbEdit,
  TbCheck,
  TbX 
} from 'solid-icons/tb';
import { calculateQuoteCommission } from "../state/commissionsState";
import styles from "./QuoteDetails.module.css";

function QuoteDetails() {
  const params = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = createSignal(null);
  const [error, setError] = createSignal(null);
  const [loading, setLoading] = createSignal(true);
  const [editMode, setEditMode] = createSignal(false);
  const [commission, setCommission] = createSignal(0);

  // Create an effect to watch for params.id changes
  createEffect(() => {
    if (params.id) {
      loadQuoteData(params.id);
    }
  });

  const loadQuoteData = (quoteId) => {
    try {
      setLoading(true);
      const savedQuotes = JSON.parse(localStorage.getItem('recentQuotes') || '[]');
      const foundQuote = savedQuotes.find(q => q.id === quoteId);
      
      if (!foundQuote) {
        console.error(`Quote not found with ID: ${quoteId}`);
        setError('Quote not found');
        return;
      }

      setQuote(foundQuote);
      // Calculate commission if not already stored
      const quoteCommission = foundQuote.commission || calculateQuoteCommission(foundQuote.cartItems);
      setCommission(quoteCommission);
      
      console.log('Quote loaded successfully:', foundQuote);
      console.log('Cart Items:', foundQuote.cartItems);
      console.log('Flight details:', foundQuote.cartItems?.find(item => item.type === 'flight'));
    } catch (err) {
      console.error('Error loading quote:', err);
      setError('Failed to load quote details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    try {
      const savedQuotes = JSON.parse(localStorage.getItem('recentQuotes') || '[]');
      const updatedQuotes = savedQuotes.filter(q => q.id !== params.id);
      localStorage.setItem('recentQuotes', JSON.stringify(updatedQuotes));
      console.log('Quote deleted successfully:', params.id);
      navigate('/saved-quotes');
    } catch (err) {
      console.error('Error deleting quote:', err);
      setError('Failed to delete quote');
    }
  };

  const handleResend = () => {
    try {
      // Mock email sending
      console.log('Attempting to resend quote to:', quote().client);
      setTimeout(() => {
        console.log('Quote resent successfully');
        alert(`Quote resent to ${quote().client}`);
      }, 1000);
    } catch (err) {
      console.error('Error resending quote:', err);
      setError('Failed to resend quote');
    }
  };

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      console.log('Quote link copied:', window.location.href);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Error copying link:', err);
      setError('Failed to copy link');
    }
  };

  const handleEditQuote = () => {
    // Navigate to BookingSummary with existing quote data
    navigate('/booking-summary', {
      state: {
        ...quote(),
        isEditing: true,
        originalQuoteId: params.id
      }
    });
  };

  // Error boundary effect
  createEffect(() => {
    if (error()) {
      console.error('Quote Details Error:', error());
    }
  });

  return (
    <div class={styles.quoteDetailsPage}>
      <div class={styles.container}>
        <button 
          class={styles.backButton}
          onClick={() => navigate('/saved-quotes')}
        >
          <TbArrowLeft />
          Back to Quotes
        </button>

        <Show when={loading()}>
          <div class={styles.loadingState}>Loading quote details...</div>
        </Show>

        <Show when={error()}>
          <div class={styles.errorState}>
            <TbAlertCircle />
            <p>{error()}</p>
            <button 
              class={styles.retryButton}
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </Show>

        <Show when={!loading() && !error() && quote()}>
          <div class={styles.quoteContent}>
            <div class={styles.header}>
              <div class={styles.tripInfo}>
                <h1>{quote().title}</h1>
                <div class={styles.destination}>
                  <span class={styles.origin}>{quote().origin}</span>
                  <span class={styles.arrow}>→</span>
                  <span class={styles.destinationCity}>{quote().destination}</span>
                </div>
                <div class={styles.tripMeta}>
                  <span>
                    <TbCalendar />
                    {quote().travelDates}
                  </span>
                  <span>
                    <TbUsers />
                    {quote().passengers?.length || 1} Passenger(s)
                  </span>
                </div>
                <p class={styles.summary}>{quote().summary}</p>
                <div class={styles.transportation}>
                  <TbPlane />
                  <p>{quote().transportation}</p>
                </div>
              </div>
              <div class={styles.priceSection}>
                <button 
                  class={styles.editButton}
                  onClick={handleEditQuote}
                >
                  <TbEdit />
                  Edit Quote
                </button>
                <div class={`${styles.status} ${styles[quote().status.toLowerCase()]}`}>
                  {quote().status}
                </div>
                <div class={styles.amount}>
                  ${quote().amount?.toLocaleString()}
                </div>
                <div class={styles.commission}>
                  <span>Commission</span>
                  <span>${commission().toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div class={styles.bookingItems}>
              <For each={quote().cartItems}>
                {(item) => {
                  const ItemIcon = (() => {
                    switch (item.type) {
                      case 'flight': return TbPlane;
                      case 'hotel': return TbHome;
                      case 'transfer': return TbCar;
                      case 'activity': return TbMap;
                      default: return TbMap;
                    }
                  })();

                  return (
                    <div class={styles.bookingCard}>
                      <div class={styles.cardIcon}>
                        <ItemIcon />
                      </div>
                      <div class={styles.cardContent}>
                        <h3>{item.title}</h3>
                        <Show when={item.type === 'flight'}>
                          <div class={styles.flightDetails}>
                            <div class={styles.flightSection}>
                              <h4>Outbound Flight</h4>
                              <div class={styles.flightInfo}>
                                <p class={styles.airline}>
                                  {item.details?.outbound?.airline || 'Airline not specified'}
                                </p>
                                <div class={styles.route}>
                                  <span>{item.details?.outbound?.from || item.details?.outbound?.departure}</span>
                                  <span class={styles.arrow}>→</span>
                                  <span>{item.details?.outbound?.to || item.details?.outbound?.arrival}</span>
                                </div>
                                <div class={styles.flightMeta}>
                                  <p class={styles.flightClass}>
                                    {item.details?.outbound?.class || 'Class not specified'}
                                  </p>
                                  <p class={styles.flightTime}>
                                    {item.details?.outbound?.time || 
                                     `${item.details?.outbound?.departure} - ${item.details?.outbound?.arrival}`}
                                  </p>
                                  <p class={styles.flightDuration}>
                                    {item.details?.outbound?.duration || 'Duration not specified'}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <Show when={item.details?.return}>
                              <div class={styles.flightSection}>
                                <h4>Return Flight</h4>
                                <div class={styles.flightInfo}>
                                  <p class={styles.airline}>
                                    {item.details?.return?.airline || 'Airline not specified'}
                                  </p>
                                  <div class={styles.route}>
                                    <span>{item.details?.return?.from || item.details?.return?.departure}</span>
                                    <span class={styles.arrow}>→</span>
                                    <span>{item.details?.return?.to || item.details?.return?.arrival}</span>
                                  </div>
                                  <div class={styles.flightMeta}>
                                    <p class={styles.flightClass}>
                                      {item.details?.return?.class || 'Class not specified'}
                                    </p>
                                    <p class={styles.flightTime}>
                                      {item.details?.return?.time || 
                                       `${item.details?.return?.departure} - ${item.details?.return?.arrival}`}
                                    </p>
                                    <p class={styles.flightDuration}>
                                      {item.details?.return?.duration || 'Duration not specified'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </Show>
                          </div>
                        </Show>
                        <Show when={item.type === 'hotel'}>
                          <div class={styles.hotelDetails}>
                            <p>{item.details.roomType}</p>
                            <p>{item.details.checkIn} - {item.details.checkOut}</p>
                            <p>{item.details.guests} Guest(s)</p>
                          </div>
                        </Show>
                        <div class={styles.itemPrice}>
                          ${item.price?.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                }}
              </For>
            </div>

            <div class={styles.itinerary}>
              <h2>Trip Itinerary</h2>
              <div class={styles.itineraryContent}>
                <For each={quote().itinerary.dailyPlan}>
                  {(day, index) => (
                    <div class={styles.dayPlan}>
                      <h3>Day {index() + 1}</h3>
                      <p>{day}</p>
                    </div>
                  )}
                </For>
              </div>
            </div>

            <div class={styles.actions}>
              <button 
                class={styles.actionButton}
                onClick={handleResend}
              >
                <TbMail />
                Resend Quote
              </button>
              <button 
                class={styles.actionButton}
                onClick={handleCopyLink}
              >
                <TbCopy />
                Copy Link
              </button>
              <button 
                class={styles.actionButton}
                onClick={() => {
                  // Implement share functionality
                }}
              >
                <TbShare />
                Share
              </button>
              <button 
                class={`${styles.actionButton} ${styles.deleteButton}`}
                onClick={handleDelete}
              >
                <TbTrash />
                Delete Quote
              </button>
            </div>
          </div>
        </Show>
      </div>
    </div>
  );
}

export default QuoteDetails; 