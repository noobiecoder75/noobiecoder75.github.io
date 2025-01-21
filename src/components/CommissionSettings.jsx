import { createSignal, onMount } from "solid-js";
import { commissionRate, setCommissionRate, saveCommissionData } from "../state/commissionsState";
import { TbSettings, TbX } from 'solid-icons/tb';
import styles from "./CommissionSettings.module.css";

function CommissionSettings({ isOpen, onClose }) {
  const [tempRate, setTempRate] = createSignal(commissionRate() * 100);
  
  const handleSave = () => {
    setCommissionRate(tempRate() / 100);
    saveCommissionData();
    onClose();
  };

  return (
    <div class={`${styles.modal} ${isOpen ? styles.open : ''}`}>
      <div class={styles.modalContent}>
        <div class={styles.modalHeader}>
          <div class={styles.headerTitle}>
            <TbSettings />
            <h2>Commission Settings</h2>
          </div>
          <button class={styles.closeButton} onClick={onClose}>
            <TbX />
          </button>
        </div>

        <div class={styles.settingsForm}>
          <div class={styles.formGroup}>
            <label>Default Commission Rate (%)</label>
            <input 
              type="number" 
              min="0" 
              max="100"
              value={tempRate()}
              onInput={(e) => setTempRate(e.target.value)}
            />
          </div>
        </div>

        <div class={styles.modalFooter}>
          <button class={styles.cancelButton} onClick={onClose}>Cancel</button>
          <button class={styles.saveButton} onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

export default CommissionSettings; 