import { createSignal } from "solid-js";
import { FiSearch, FiPlus } from 'solid-icons/fi';
import styles from "./Contacts.module.css";
import ContactForm from "../components/ContactForm";

function Contacts() {
  const [searchQuery, setSearchQuery] = createSignal("");
  const [showAddContact, setShowAddContact] = createSignal(false);

  return (
    <div class={styles.contactsPage}>
      <div class={styles.header}>
        <h1>Contacts</h1>
        <button 
          class={styles.addButton}
          onClick={() => setShowAddContact(true)}
        >
          <FiPlus />
          Add Contact
        </button>
      </div>

      <div class={styles.controls}>
        <div class={styles.searchBox}>
          <FiSearch />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery()}
            onInput={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div class={styles.contactsList}>
        <p>No contacts to display</p>
      </div>

      {showAddContact() && (
        <ContactForm 
          onClose={() => setShowAddContact(false)}
          onSave={(contact) => {
            console.log('New contact:', contact);
            setShowAddContact(false);
          }}
        />
      )}
    </div>
  );
}

export default Contacts; 