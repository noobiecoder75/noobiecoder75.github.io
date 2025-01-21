import { createSignal, onMount } from "solid-js";
import { useNavigate, useLocation } from "@solidjs/router";
import { TbCheck, TbClock, TbUsers, TbPlane, TbCalendar, TbCreditCard } from 'solid-icons/tb';
import styles from "./ReviewBooking.module.css";

function ReviewBooking() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = createSignal(true);

  onMount(() => {
    // Simulate loading state
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  });

  const handleContinue = () => {
    navigate('/booking-summary', { 
      state: location.state 
    });
  };

  return (
    <div class={styles.reviewPage}>
      <div class={styles.container}>
        <Show when={!isLoading()} fallback={
          <div class={styles.loading}>
            <div class={styles.loadingSpinner} />
            <h2>Preparing Your Booking Review</h2>
            <p>Please wait while we gather all your booking details...</p>
          </div>
        }>
          <div class={styles.content}>
            <div class={styles.header}>
              <div class={styles.icon}>
                <TbCheck />
              </div>
              <h1>Ready to Review Your Booking</h1>
              <p>We've prepared a detailed summary of your travel arrangements</p>
            </div>

            <div class={styles.summary}>
              <div class={styles.summaryItem}>
                <TbClock />
                <div>
                  <h3>Estimated Review Time</h3>
                  <p>5-10 minutes</p>
                </div>
              </div>
              
              <div class={styles.summaryItem}>
                <TbUsers />
                <div>
                  <h3>Passengers</h3>
                  <p>{location.state?.passengers?.length || 0} travelers</p>
                </div>
              </div>
              
              <div class={styles.summaryItem}>
                <TbPlane />
                <div>
                  <h3>Journey</h3>
                  <p>{location.state?.origin} → {location.state?.destination}</p>
                </div>
              </div>
              
              <div class={styles.summaryItem}>
                <TbCalendar />
                <div>
                  <h3>Travel Dates</h3>
                  <p>{location.state?.travelDates}</p>
                </div>
              </div>
              
              <div class={styles.summaryItem}>
                <TbCreditCard />
                <div>
                  <h3>Total Amount</h3>
                  <p>${location.state?.totalAmount?.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div class={styles.actions}>
              <button 
                class={styles.continueButton}
                onClick={handleContinue}
              >
                Continue to Review
              </button>
            </div>
          </div>
        </Show>
      </div>
    </div>
  );
}

export default ReviewBooking; 