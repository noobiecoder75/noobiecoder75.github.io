import { createSignal, onMount, createEffect } from "solid-js";
import { 
  potentialRevenue, 
  realizedRevenue, 
  commissionsByType,
  loadCommissionData 
} from "../state/commissionsState";
import { TbChartBar, TbPlane, TbHome, TbCar, TbMap } from 'solid-icons/tb';
import styles from "./CommissionDashboard.module.css";

/**
 * CommissionDashboard Component
 * Displays an overview of commission earnings and breakdowns by travel category
 */
function CommissionDashboard() {
  console.log('CommissionDashboard: Component initialized');

  // Load commission data when component mounts
  onMount(async () => {
    console.log('CommissionDashboard: Component mounted');
    try {
      await loadCommissionData();
      console.log('CommissionDashboard: Data loaded successfully');
    } catch (error) {
      console.error('CommissionDashboard: Error loading data:', error);
    }
  });

  // Track changes in revenue data
  createEffect(() => {
    console.log('CommissionDashboard: Revenue data updated', {
      realized: realizedRevenue(),
      potential: potentialRevenue()
    });
  });

  // Track changes in commission breakdowns
  createEffect(() => {
    console.log('CommissionDashboard: Commission breakdowns updated', {
      flights: commissionsByType().flights,
      hotels: commissionsByType().hotels,
      transport: commissionsByType().transport,
      activities: commissionsByType().activities
    });
  });

  return (
    <div class={styles.dashboard}>
      {/* Dashboard Header */}
      <div class={styles.header}>
        <div class={styles.headerTitle}>
          <TbChartBar />
          <h2>Commission Overview</h2>
        </div>
      </div>

      {/* Revenue Summary Cards */}
      <div class={styles.summaryCards}>
        {/* Realized Revenue Card */}
        <div class={styles.card}>
          <h3>Realized Revenue</h3>
          <div class={styles.amount}>${realizedRevenue().toLocaleString()}</div>
          <div class={styles.label}>From confirmed bookings</div>
        </div>
        {/* Potential Revenue Card */}
        <div class={styles.card}>
          <h3>Potential Revenue</h3>
          <div class={styles.amount}>${potentialRevenue().toLocaleString()}</div>
          <div class={styles.label}>From pending quotes</div>
        </div>
      </div>

      {/* Commission Breakdown by Category */}
      <div class={styles.breakdownSection}>
        <h3>Commission Breakdown</h3>
        <div class={styles.breakdown}>
          {/* Flights Category */}
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

          {/* Hotels Category */}
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

          {/* Transportation Category */}
          <div class={styles.category}>
            <div class={styles.categoryHeader}>
              <TbCar />
              <span>Transportation</span>
            </div>
            <div class={styles.categoryAmounts}>
              <div>
                <span>Realized:</span>
                <span>${commissionsByType().transport?.realized.toLocaleString()}</span>
              </div>
              <div>
                <span>Potential:</span>
                <span>${commissionsByType().transport?.potential.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Activities Category */}
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
  );
}

export default CommissionDashboard; 