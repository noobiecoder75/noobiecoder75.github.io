import { createSignal, onMount } from "solid-js";
import { useNavigate, useLocation } from "@solidjs/router";
import { 
  TbMail, 
  TbCreditCard, 
  TbCheck,
  TbCopy,
  TbShare,
  TbSend,
  TbReceipt,
  TbPlane,
  TbHome,
  TbCar,
  TbMap
} from 'solid-icons/tb';
import { convertToRealizedRevenue, calculateQuoteCommission } from "../state/commissionsState";
import styles from "./Payment.module.css";
import { setRefreshNavbar } from "../state/refreshState"; // Import the refresh state

// Add icon mapping
const iconMap = {
  'TbPlane': TbPlane,
  'flight': TbPlane,
  'TbHome': TbHome,
  'hotel': TbHome,
  'TbCar': TbCar,
  'transfer': TbCar,
  'TbMap': TbMap,
  'activity': TbMap
};

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const [emailSent, setEmailSent] = createSignal(false);
  const [showShareOptions, setShowShareOptions] = createSignal(false);
  const [copied, setCopied] = createSignal(false);
  const [commission, setCommission] = createSignal(0);
  const [paymentProcessed, setPaymentProcessed] = createSignal(false);

  // Calculate commission on mount
  onMount(() => {
    if (location.state?.cartItems) {
      const totalCommission = calculateQuoteCommission(location.state.cartItems);
      setCommission(totalCommission);
    }
  });

  const handleSendEmail = () => {
    setEmailSent(true);
    
    // Transform cart items to remove icon components before saving
    const sanitizedCartItems = location.state?.cartItems.map(item => ({
      ...item,
      icon: undefined,
      type: item.type
    }));

    // Save to recent quotes
    const newQuote = {
      id: Math.random().toString(36).substr(2, 9),
      client: location.state?.passengers[0]?.firstName + " " + location.state?.passengers[0]?.lastName,
      destination: location.state?.destination,
      origin: location.state?.origin,
      date: "Just now",
      status: "Sent",
      amount: location.state?.totalAmount,
      commission: commission(), // Add commission to quote data
      itinerary: location.state?.itinerary,
      travelDates: location.state?.travelDates,
      passengers: location.state?.passengers,
      cartItems: sanitizedCartItems,
      title: location.state?.itinerary.title,
      summary: location.state?.itinerary.summary,
      transportation: location.state?.itinerary.transportation
    };
    
    // Convert potential commission to realized commission
    convertToRealizedRevenue(sanitizedCartItems);
    
    // Add to local storage
    const existingQuotes = JSON.parse(localStorage.getItem('recentQuotes') || '[]');
    localStorage.setItem('recentQuotes', JSON.stringify([newQuote, ...existingQuotes]));

    // Trigger a refresh in the Navbar
    setRefreshNavbar(true);
  };

  const handleDirectPayment = () => {
    try {
      // Process the payment (mock)
      setPaymentProcessed(true);
      
      // Convert potential commission to realized commission
      if (location.state?.cartItems) {
        convertToRealizedRevenue(location.state.cartItems);
      }

      // Create new booking entry
      const newBooking = {
        id: Math.random().toString(36).substr(2, 9),
        client: location.state?.passengers[0]?.firstName + " " + location.state?.passengers[0]?.lastName,
        destination: location.state?.destination,
        origin: location.state?.origin,
        date: "Just now",
        status: "Confirmed",
        amount: location.state?.totalAmount,
        commission: calculateQuoteCommission(location.state?.cartItems || []),
        itinerary: location.state?.itinerary,
        travelDates: location.state?.travelDates,
        passengers: location.state?.passengers,
        cartItems: location.state?.cartItems,
        title: location.state?.itinerary.title,
        summary: location.state?.itinerary.summary,
        transportation: location.state?.itinerary.transportation,
        bookingDate: new Date().toISOString()
      };

      // Remove from recent quotes and add to bookings
      const existingQuotes = JSON.parse(localStorage.getItem('recentQuotes') || '[]');
      const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      
      // Filter out the current quote if it exists
      const updatedQuotes = existingQuotes.filter(quote => 
        quote.id !== location.state?.quoteId
      );

      // Add to bookings
      localStorage.setItem('bookings', JSON.stringify([newBooking, ...existingBookings]));
      // Update quotes
      localStorage.setItem('recentQuotes', JSON.stringify(updatedQuotes));

      // Trigger navbar refresh
      setRefreshNavbar(true);
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  const copyPaymentLink = () => {
    // Mock payment link
    navigator.clipboard.writeText(`https://travelpayments.com/pay/${Math.random().toString(36).substr(2, 9)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div class={styles.paymentPage}>
      <div class={styles.container}>
        <div class={styles.columns}>
          {/* Left Column - Payment Options */}
          <div class={styles.leftColumn}>
            <h1>Complete Your Booking</h1>
            
            <div class={styles.paymentOptions}>
              <div class={styles.option}>
                <div class={styles.optionHeader}>
                  <TbMail />
                  <h3>Send Payment Link</h3>
                </div>
                <p>Send a secure payment link to your customer's email</p>
                <button 
                  class={styles.sendButton}
                  onClick={handleSendEmail}
                  disabled={emailSent()}
                >
                  {emailSent() ? (
                    <>
                      <TbCheck />
                      Sent Successfully
                    </>
                  ) : (
                    <>
                      <TbSend />
                      Send Payment Link
                    </>
                  )}
                </button>
              </div>

              <div class={styles.option}>
                <div class={styles.optionHeader}>
                  <TbCreditCard />
                  <h3>Direct Payment</h3>
                </div>
                <p>Process payment directly through our secure payment gateway</p>
                <button class={styles.payButton} onClick={handleDirectPayment}>
                  <TbCreditCard />
                  Process Payment
                </button>
              </div>

              <div class={styles.shareOptions}>
                <button 
                  class={styles.copyButton}
                  onClick={copyPaymentLink}
                >
                  {copied() ? <TbCheck /> : <TbCopy />}
                  {copied() ? 'Copied!' : 'Copy Payment Link'}
                </button>
                <button 
                  class={styles.shareButton}
                  onClick={() => setShowShareOptions(!showShareOptions())}
                >
                  <TbShare />
                  Share Quote
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Quote Summary */}
          <div class={styles.rightColumn}>
            <div class={styles.summaryCard}>
              <div class={styles.summaryHeader}>
                <TbReceipt />
                <h2>Quote Summary</h2>
              </div>

              {/* Add commission display */}
              <div class={styles.commissionSection}>
                <h3>Commission Details</h3>
                <div class={styles.commissionInfo}>
                  <span>Commission Amount</span>
                  <span>${commission().toLocaleString()}</span>
                </div>
              </div>

              <div class={styles.tripDetails}>
                <h3>{location.state?.origin} → {location.state?.destination}</h3>
                <p>{location.state?.travelDates}</p>
                <p>{location.state?.passengers?.length} Passenger(s)</p>
              </div>

              <div class={styles.itemizedList}>
                <For each={location.state?.cartItems}>
                  {(item) => {
                    const ItemIcon = iconMap[item.icon] || iconMap[item.type];
                    return (
                      <div class={styles.item}>
                        <div class={styles.itemInfo}>
                          <ItemIcon />
                          <div>
                            <h4>{item.title}</h4>
                            <p>{item.details.description}</p>
                          </div>
                        </div>
                        <div class={styles.itemPrice}>
                          ${item.price.toLocaleString()}
                        </div>
                      </div>
                    );
                  }}
                </For>
              </div>

              <div class={styles.totalAmount}>
                <span>Total Amount</span>
                <span>${location.state?.totalAmount?.toLocaleString()}</span>
              </div>

              <div class={styles.itinerarySummary}>
                <h3>Trip Itinerary</h3>
                <div class={styles.itineraryContent}>
                  {/* Render formatted itinerary */}
                  <For each={location.state?.itinerary.dailyPlan}>
                    {(day, index) => (
                      <div class={styles.dayPlan}>
                        <h4>Day {index() + 1}</h4>
                        <p>{day}</p>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment; 