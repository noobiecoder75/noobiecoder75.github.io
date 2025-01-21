import { createSignal, Show } from "solid-js";
import { FiX, FiUser, FiMail, FiPhone } from 'solid-icons/fi';
import styles from "./ContactForm.module.css";

function ContactForm({ onClose, onSave }) {
  const [formData, setFormData] = createSignal({
    name: '',
    email: '',
    phone: ''
  });

  const [errors, setErrors] = createSignal({});

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
          <h2>Add New Contact</h2>
          <button class={styles.closeButton} onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} class={styles.form}>
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
          </div>

          <div class={styles.formActions}>
            <button type="button" class={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" class={styles.saveButton}>
              Add Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ContactForm; 