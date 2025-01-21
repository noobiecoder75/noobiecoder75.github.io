import { createSignal, createEffect, onMount } from "solid-js";
import { FiSearch, FiFilter, FiPlus, FiEdit2, FiTrash2, FiMail, FiPhone } from 'solid-icons/fi';
import styles from "./Contacts.module.css";
import { contacts, loadContacts, searchContacts, filterContacts } from "../state/contactsState";
import { useNavigate } from "@solidjs/router";
import ContactForm from "../components/ContactForm";

function Contacts() {
  const [searchQuery, setSearchQuery] = createSignal("");
  const [activeFilters, setActiveFilters] = createSignal({
    hasQuotes: false,
    hasBookings: false,
    recentlyContacted: false,
    highValue: false
  });
  const [filteredContacts, setFilteredContacts] = createSignal([]);
  const [showAddContact, setShowAddContact] = createSignal(false);
  const navigate = useNavigate();

  onMount(() => {
    loadContacts();
    updateFilteredContacts();
  });

  const updateFilteredContacts = () => {
    let results = contacts();
    
    // Apply search
    if (searchQuery()) {
      results = searchContacts(searchQuery());
    }
    
    // Apply filters
    const activeFilterCount = Object.values(activeFilters()).filter(Boolean).length;
    if (activeFilterCount > 0) {
      results = filterContacts(activeFilters());
    }
    
    setFilteredContacts(results);
  };

  createEffect(() => {
    searchQuery();
    activeFilters();
    updateFilteredContacts();
  });

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

        <div class={styles.filters}>
          <button 
            class={`${styles.filterButton} ${activeFilters().hasQuotes ? styles.active : ''}`}
            onClick={() => setActiveFilters({ ...activeFilters(), hasQuotes: !activeFilters().hasQuotes })}
          >
            Has Quotes
          </button>
          <button 
            class={`${styles.filterButton} ${activeFilters().hasBookings ? styles.active : ''}`}
            onClick={() => setActiveFilters({ ...activeFilters(), hasBookings: !activeFilters().hasBookings })}
          >
            Has Bookings
          </button>
          <button 
            class={`${styles.filterButton} ${activeFilters().recentlyContacted ? styles.active : ''}`}
            onClick={() => setActiveFilters({ ...activeFilters(), recentlyContacted: !activeFilters().recentlyContacted })}
          >
            Recently Contacted
          </button>
          <button 
            class={`${styles.filterButton} ${activeFilters().highValue ? styles.active : ''}`}
            onClick={() => setActiveFilters({ ...activeFilters(), highValue: !activeFilters().highValue })}
          >
            High Value
          </button>
        </div>
      </div>

      <div class={styles.contactsList}>
        {filteredContacts().map(contact => (
          <div class={styles.contactCard}>
            <div class={styles.contactInfo}>
              <h3>{contact.name}</h3>
              <div class={styles.contactDetails}>
                <span>
                  <FiMail />
                  {contact.email}
                </span>
                <span>
                  <FiPhone />
                  {contact.phone}
                </span>
              </div>
            </div>
            
            <div class={styles.stats}>
              <div class={styles.stat}>
                <span>Quotes</span>
                <strong>{contact.quotes.length}</strong>
              </div>
              <div class={styles.stat}>
                <span>Bookings</span>
                <strong>{contact.bookings.length}</strong>
              </div>
              <div class={styles.stat}>
                <span>Total Value</span>
                <strong>
                  ${contact.bookings.reduce((sum, booking) => sum + (booking.amount || 0), 0).toLocaleString()}
                </strong>
              </div>
            </div>

            <div class={styles.actions}>
              <button 
                class={styles.editButton}
                onClick={() => navigate(`/contacts/${contact.id}`)}
              >
                <FiEdit2 />
                Edit
              </button>
              <button class={styles.deleteButton}>
                <FiTrash2 />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddContact() && (
        <ContactForm 
          onClose={() => setShowAddContact(false)}
          onSave={(contact) => {
            addContact(contact);
            setShowAddContact(false);
            updateFilteredContacts();
          }}
        />
      )}
    </div>
  );
}

export default Contacts; 