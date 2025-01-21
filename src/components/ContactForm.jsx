import { createSignal, Show } from "solid-js";
import { FiX, FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiFlag, FiStar } from 'solid-icons/fi';
import styles from "./ContactForm.module.css";

function ContactForm({ contact, onClose, onSave }) {
  const [formData, setFormData] = createSignal({
    name: contact?.name || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    address: contact?.address || '',
    dateOfBirth: contact?.dateOfBirth || '',
    nationality: contact?.nationality || '',
    preferences: contact?.preferences || {
      travelClass: 'Economy',
      preferredAirlines: '',
      preferredHotels: '',
      destinations: '',
      dietaryRequirements: '',
      specialRequests: ''
    }
  });

  const [errors, setErrors] = createSignal({});
  const [activeTab, setActiveTab] = createSignal('basic');

  const validateForm = () => {
    const newErrors = {};
    if (!formData().name) newErrors.name = 'Name is required';
    if (!formData().email) newErrors.email = 'Email is required';
    if (!formData().phone) newErrors.phone = 'Phone is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData());
    }
  };

  return (
    <div class={styles.modalOverlay}>
      <div class={styles.modal}>
        <div class={styles.modalHeader}>
          <h2>{contact ? 'Edit Contact' : 'Add New Contact'}</h2>
          <button class={styles.closeButton} onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div class={styles.tabs}>
          <button 
            class={`${styles.tab} ${activeTab() === 'basic' ? styles.active : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            Basic Info
          </button>
          <button 
            class={`${styles.tab} ${activeTab() === 'preferences' ? styles.active : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            Travel Preferences
          </button>
        </div>

        <form onSubmit={handleSubmit} class={styles.form}>
          <Show when={activeTab() === 'basic'}>
            <div class={styles.formSection}>
              <div class={styles.formGroup}>
                <label>
                  <FiUser />
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData().name}
                  onInput={(e) => setFormData({ ...formData(), name: e.target.value })}
                  class={errors().name ? styles.error : ''}
                />
                <Show when={errors().name}>
                  <span class={styles.errorMessage}>{errors().name}</span>
                </Show>
              </div>

              <div class={styles.formGroup}>
                <label>
                  <FiMail />
                  Email
                </label>
                <input
                  type="email"
                  value={formData().email}
                  onInput={(e) => setFormData({ ...formData(), email: e.target.value })}
                  class={errors().email ? styles.error : ''}
                />
                <Show when={errors().email}>
                  <span class={styles.errorMessage}>{errors().email}</span>
                </Show>
              </div>

              <div class={styles.formGroup}>
                <label>
                  <FiPhone />
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData().phone}
                  onInput={(e) => setFormData({ ...formData(), phone: e.target.value })}
                  class={errors().phone ? styles.error : ''}
                />
                <Show when={errors().phone}>
                  <span class={styles.errorMessage}>{errors().phone}</span>
                </Show>
              </div>

              <div class={styles.formGroup}>
                <label>
                  <FiMapPin />
                  Address
                </label>
                <input
                  type="text"
                  value={formData().address}
                  onInput={(e) => setFormData({ ...formData(), address: e.target.value })}
                />
              </div>

              <div class={styles.formRow}>
                <div class={styles.formGroup}>
                  <label>
                    <FiCalendar />
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData().dateOfBirth}
                    onInput={(e) => setFormData({ ...formData(), dateOfBirth: e.target.value })}
                  />
                </div>

                <div class={styles.formGroup}>
                  <label>
                    <FiFlag />
                    Nationality
                  </label>
                  <input
                    type="text"
                    value={formData().nationality}
                    onInput={(e) => setFormData({ ...formData(), nationality: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </Show>

          <Show when={activeTab() === 'preferences'}>
            <div class={styles.formSection}>
              <div class={styles.formGroup}>
                <label>
                  <FiStar />
                  Preferred Travel Class
                </label>
                <select
                  value={formData().preferences.travelClass}
                  onChange={(e) => setFormData({
                    ...formData(),
                    preferences: { ...formData().preferences, travelClass: e.target.value }
                  })}
                >
                  <option value="Economy">Economy</option>
                  <option value="Premium Economy">Premium Economy</option>
                  <option value="Business">Business</option>
                  <option value="First">First</option>
                </select>
              </div>

              <div class={styles.formGroup}>
                <label>Preferred Airlines</label>
                <input
                  type="text"
                  value={formData().preferences.preferredAirlines}
                  placeholder="e.g., Emirates, Qatar Airways"
                  onInput={(e) => setFormData({
                    ...formData(),
                    preferences: { ...formData().preferences, preferredAirlines: e.target.value }
                  })}
                />
              </div>

              <div class={styles.formGroup}>
                <label>Preferred Hotels</label>
                <input
                  type="text"
                  value={formData().preferences.preferredHotels}
                  placeholder="e.g., Hilton, Marriott"
                  onInput={(e) => setFormData({
                    ...formData(),
                    preferences: { ...formData().preferences, preferredHotels: e.target.value }
                  })}
                />
              </div>

              <div class={styles.formGroup}>
                <label>Favorite Destinations</label>
                <input
                  type="text"
                  value={formData().preferences.destinations}
                  placeholder="e.g., Beach resorts, European cities"
                  onInput={(e) => setFormData({
                    ...formData(),
                    preferences: { ...formData().preferences, destinations: e.target.value }
                  })}
                />
              </div>

              <div class={styles.formGroup}>
                <label>Dietary Requirements</label>
                <input
                  type="text"
                  value={formData().preferences.dietaryRequirements}
                  placeholder="e.g., Vegetarian, Gluten-free"
                  onInput={(e) => setFormData({
                    ...formData(),
                    preferences: { ...formData().preferences, dietaryRequirements: e.target.value }
                  })}
                />
              </div>

              <div class={styles.formGroup}>
                <label>Special Requests</label>
                <textarea
                  value={formData().preferences.specialRequests}
                  placeholder="Any additional preferences or requirements"
                  onInput={(e) => setFormData({
                    ...formData(),
                    preferences: { ...formData().preferences, specialRequests: e.target.value }
                  })}
                />
              </div>
            </div>
          </Show>

          <div class={styles.formActions}>
            <button type="button" class={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" class={styles.saveButton}>
              {contact ? 'Update Contact' : 'Add Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ContactForm; 