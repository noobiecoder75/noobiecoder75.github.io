import { createSignal, onMount, For, Show } from "solid-js";
import styles from "./Bookings.module.css";

function Bookings() {
  const [bookings, setBookings] = createSignal([]);

  const loadBookings = () => {
    try {
      const savedBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      const sortedBookings = savedBookings.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
      setBookings(sortedBookings);
    } catch (err) {
      console.error("Failed to load bookings:", err);
    }
  };

  onMount(() => {
    loadBookings();
  });

  return (
    <div class={styles.bookingsPage}>
      <h1>My Bookings</h1>
      
      <div class={styles.bookingsList}>
        <Show 
          when={bookings().length > 0}
          fallback={<div class={styles.emptyState}>No bookings found</div>}
        >
          <For each={bookings()}>
            {booking => (
              <div class={styles.bookingCard}>
                <div class={styles.bookingInfo}>
                  <div class={styles.clientInfo}>
                    <h3>{booking.client}</h3>
                    <span class={styles.destination}>{booking.destination}</span>
                  </div>
                  <div class={styles.bookingMeta}>
                    <div class={styles.date}>
                      {new Date(booking.bookingDate).toLocaleDateString()}
                    </div>
                    <div class={styles.amount}>
                      ${booking.amount?.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </For>
        </Show>
      </div>
    </div>
  );
}

export default Bookings; 