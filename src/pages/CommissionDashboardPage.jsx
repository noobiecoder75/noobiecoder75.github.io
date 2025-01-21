import { createSignal, onMount } from "solid-js";
import { 
  potentialRevenue, 
  realizedRevenue, 
  commissionsByType,
  loadCommissionData 
} from "../state/commissionsState";
import { TbChartBar, TbPlane, TbHome, TbCar, TbMap, TbSettings, TbBook } from 'solid-icons/tb';
import CommissionSettings from "../components/CommissionSettings";
import styles from "./CommissionDashboardPage.module.css";

function CommissionDashboardPage() {
  const [showSettings, setShowSettings] = createSignal(false);
  const [bookings, setBookings] = createSignal([]);

  onMount(() => {
    loadCommissionData();
    // Load bookings
    const savedBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    setBookings(savedBookings);
  });

  return (
    <div class={styles.dashboardPage}>
      <div class={styles.container}>
        <div class={styles.bookingsSection}>
          <div class={styles.sectionHeader}>
            <div class={styles.headerTitle}>
              <TbBook />
              <h2>Recent Bookings</h2>
            </div>
          </div>
          <div class={styles.bookingsGrid}>
            <For each={bookings()}>
              {booking => (
                <div class={styles.bookingCard}>
                  <div class={styles.bookingHeader}>
                    <strong>{booking.client}</strong>
                    <span class={styles.bookingStatus}>Confirmed</span>
                  </div>
                  <div class={styles.bookingDetails}>
                    <div class={styles.destination}>
                      <span class={styles.label}>Destination</span>
                      <span>{booking.destination}</span>
                    </div>
                    <div class={styles.amount}>
                      <span class={styles.label}>Amount</span>
                      <span>${booking.amount?.toLocaleString()}</span>
                    </div>
                    <div class={styles.commission}>
                      <span class={styles.label}>Commission</span>
                      <span>${booking.commission?.toLocaleString()}</span>
                    </div>
                  </div>
                  <div class={styles.bookingDate}>
                    {new Date(booking.bookingDate).toLocaleDateString()}
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>

        <div class={styles.header}>
          <div class={styles.headerTitle}>
            <TbChartBar />
            <h1>Commission Dashboard</h1>
          </div>
          <button 
            class={styles.settingsButton}
            onClick={() => setShowSettings(true)}
          >
            <TbSettings />
            Settings
          </button>
        </div>

        <div class={styles.grid}>
          <div class={styles.summarySection}>
            <div class={styles.summaryCards}>
              <div class={styles.card}>
                <h3>Realized Revenue</h3>
                <div class={styles.amount}>${realizedRevenue().toLocaleString()}</div>
                <div class={styles.label}>From confirmed bookings</div>
              </div>
              <div class={styles.card}>
                <h3>Potential Revenue</h3>
                <div class={styles.amount}>${potentialRevenue().toLocaleString()}</div>
                <div class={styles.label}>From pending quotes</div>
              </div>
            </div>
          </div>

          <div class={styles.breakdownSection}>
            <h2>Commission Breakdown</h2>
            <div class={styles.categories}>
              <div class={styles.category}>
                <div class={styles.categoryHeader}>
                  <TbPlane />
                  <span>Flights</span>
                </div>
                <div class={styles.categoryAmounts}>
                  <div>
                    <span>Realized:</span>
                    <span>${commissionsByType().flights?.realized.toLocaleString()}</span>
                  </div>
                  <div>
                    <span>Potential:</span>
                    <span>${commissionsByType().flights?.potential.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div class={styles.category}>
                <div class={styles.categoryHeader}>
                  <TbHome />
                  <span>Hotels</span>
                </div>
                <div class={styles.categoryAmounts}>
                  <div>
                    <span>Realized:</span>
                    <span>${commissionsByType().hotels?.realized.toLocaleString()}</span>
                  </div>
                  <div>
                    <span>Potential:</span>
                    <span>${commissionsByType().hotels?.potential.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div class={styles.category}>
                <div class={styles.categoryHeader}>
                  <TbCar />
                  <span>Transfers</span>
                </div>
                <div class={styles.categoryAmounts}>
                  <div>
                    <span>Realized:</span>
                    <span>${commissionsByType().transfers?.realized.toLocaleString()}</span>
                  </div>
                  <div>
                    <span>Potential:</span>
                    <span>${commissionsByType().transfers?.potential.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div class={styles.category}>
                <div class={styles.categoryHeader}>
                  <TbMap />
                  <span>Activities</span>
                </div>
                <div class={styles.categoryAmounts}>
                  <div>
                    <span>Realized:</span>
                    <span>${commissionsByType().activities?.realized.toLocaleString()}</span>
                  </div>
                  <div>
                    <span>Potential:</span>
                    <span>${commissionsByType().activities?.potential.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CommissionSettings 
        isOpen={showSettings()} 
        onClose={() => setShowSettings(false)} 
      />
    </div>
  );
}

export default CommissionDashboardPage; 