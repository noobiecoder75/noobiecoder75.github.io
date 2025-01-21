import { createSignal, createResource } from 'solid-js';
import styles from './SearchInterface.module.css';

function SearchInterface() {
  const [searchQuery, setSearchQuery] = createSignal('');
  const [searchParams, setSearchParams] = createSignal(null);

  // Resource for LLM query processing
  const [queryResult] = createResource(searchQuery, async (query) => {
    if (!query) return null;
    
    try {
      const response = await fetch('/api/process-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      return await response.json();
    } catch (error) {
      console.error('Error processing query:', error);
      return null;
    }
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    const result = await queryResult();
    if (result) {
      setSearchParams(result);
      // Trigger search with structured parameters
    }
  };

  return (
    <div class={styles.searchContainer}>
      <h2>Travel Search</h2>
      <div class={styles.searchBox}>
        <textarea
          value={searchQuery()}
          onInput={(e) => setSearchQuery(e.target.value)}
          placeholder="Describe the perfect trip (e.g., 'Romantic getaway in June for under $2,000, somewhere warm, with a spa')"
          class={styles.searchInput}
        />
        <button 
          onClick={handleSearch}
          class={styles.searchButton}
          disabled={queryResult.loading}
        >
          {queryResult.loading ? 'Processing...' : 'Search'}
        </button>
      </div>

      {/* Structured Parameters Display */}
      {searchParams() && (
        <div class={styles.paramsDisplay}>
          <h3>Understood Parameters:</h3>
          <pre>{JSON.stringify(searchParams(), null, 2)}</pre>
        </div>
      )}

      {/* Results will be displayed here */}
      {queryResult() && (
        <div class={styles.resultsContainer}>
          {/* Results component will go here */}
        </div>
      )}
    </div>
  );
}

export default SearchInterface; 