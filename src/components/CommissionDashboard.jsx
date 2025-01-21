import { createSignal, onMount } from "solid-js";
import { 
  potentialRevenue, 
  realizedRevenue, 
  commissionsByType,
  loadCommissionData 
} from "../state/commissionsState";
import { TbChartBar, TbPlane, TbHome, TbCar, TbMap } from 'solid-icons/tb';
import styles from "./CommissionDashboard.module.css";

function CommissionDashboard() {
  onMount(() => {
    loadCommissionData();
  });

  return (
    <div class={styles.dashboard}>
      <div class={styles.header}>
        <div class={styles.headerTitle}>
          <TbChartBar />
          <h2>Commission Overview</h2>
        </div>
      </div>

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

      <div class={styles.breakdownSection}>
        <h3>Commission Breakdown</h3>
        <div class={styles.breakdown}>
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