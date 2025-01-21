import { createSignal, onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { 
  TbSearch, 
  TbFilter, 
  TbArrowUp, 
  TbArrowDown,
  TbTrash,
  TbMail,
  TbEye,
  TbCopy
} from 'solid-icons/tb';
import styles from "./SavedQuotes.module.css";

function SavedQuotes() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = createSignal([]);
  const [sortField, setSortField] = createSignal('date');
  const [sortDirection, setSortDirection] = createSignal('desc');
  const [searchTerm, setSearchTerm] = createSignal('');

  onMount(() => {
    const savedQuotes = JSON.parse(localStorage.getItem('recentQuotes') || '[]');
    setQuotes(savedQuotes);
  });

  const handleSort = (field) => {
    if (sortField() === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedQuotes = () => {
    let filtered = quotes().filter(quote => 
      quote.client.toLowerCase().includes(searchTerm().toLowerCase()) ||
      quote.destination.toLowerCase().includes(searchTerm().toLowerCase())
    );

    return filtered.sort((a, b) => {
      const direction = sortDirection() === 'asc' ? 1 : -1;
      switch (sortField()) {
        case 'date':
          return direction * (new Date(b.date) - new Date(a.date));
        case 'amount':
          return direction * (a.amount - b.amount);
        case 'client':
          return direction * a.client.localeCompare(b.client);
        default:
          return 0;
      }
    });
  };

  const handleDelete = (id) => {
    const updatedQuotes = quotes().filter(quote => quote.id !== id);
    setQuotes(updatedQuotes);
    localStorage.setItem('recentQuotes', JSON.stringify(updatedQuotes));
  };

  const resendQuote = (quote) => {
    // Mock email sending
    setTimeout(() => {
      alert(`Quote resent to ${quote.client}`);
    }, 1000);
  };

  return (
    <div class={styles.savedQuotesPage}>
      <div class={styles.container}>
        <div class={styles.header}>
          <h1>Saved Quotes</h1>
          <p>Manage and track your sent quotes</p>
        </div>

        <div class={styles.controls}>
          <div class={styles.search}>
            <TbSearch />
            <input
              type="text"
              placeholder="Search by client or destination..."
              value={searchTerm()}
              onInput={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div class={styles.sortButtons}>
            <button 
              class={`${styles.sortButton} ${sortField() === 'date' ? styles.active : ''}`}
              onClick={() => handleSort('date')}
            >
              Date {sortField() === 'date' && (sortDirection() === 'asc' ? <TbArrowUp /> : <TbArrowDown />)}
            </button>
            <button 
              class={`${styles.sortButton} ${sortField() === 'amount' ? styles.active : ''}`}
              onClick={() => handleSort('amount')}
            >
              Amount {sortField() === 'amount' && (sortDirection() === 'asc' ? <TbArrowUp /> : <TbArrowDown />)}
            </button>
            <button 
              class={`${styles.sortButton} ${sortField() === 'client' ? styles.active : ''}`}
              onClick={() => handleSort('client')}
            >
              Client {sortField() === 'client' && (sortDirection() === 'asc' ? <TbArrowUp /> : <TbArrowDown />)}
            </button>
          </div>
        </div>

        <div class={styles.quotesList}>
          <For each={filteredAndSortedQuotes()}>
            {quote => (
              <div class={styles.quoteCard}>
                <div class={styles.quoteHeader}>
                  <div class={styles.clientInfo}>
                    <h3>{quote.client}</h3>
                    <span class={styles.destination}>{quote.destination}</span>
                  </div>
                  <div class={styles.quoteAmount}>
                    ${quote.amount?.toLocaleString()}
                  </div>
                </div>

                <div class={styles.quoteDetails}>
                  <div class={styles.detail}>
                    <span>Sent:</span>
                    <span>{quote.date}</span>
                  </div>
                  <div class={styles.detail}>
                    <span>Status:</span>
                    <span class={styles.status}>{quote.status}</span>
                  </div>
                </div>

                <div class={styles.actions}>
                  <button 
                    class={styles.actionButton}
                    onClick={() => resendQuote(quote)}
                  >
                    <TbMail />
                    Resend
                  </button>
                  <button 
                    class={styles.actionButton}
                    onClick={() => navigate(`/quote/${quote.id}`)}
                  >
                    <TbEye />
                    View
                  </button>
                  <button 
                    class={styles.actionButton}
                    onClick={() => handleDelete(quote.id)}
                  >
                    <TbTrash />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  );
}

export default SavedQuotes; 