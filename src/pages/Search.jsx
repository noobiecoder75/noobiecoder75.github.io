import { createSignal, createResource } from "solid-js";
import styles from "./Search.module.css";

function Search() {
  const [searchQuery, setSearchQuery] = createSignal('');
  const [searchParams, setSearchParams] = createSignal(null);

  // Resource for query processing
  const [queryResult] = createResource(searchQuery, async (query) => {
    if (!query) return null;
    
    // Mock API call for now
    return new Promise(resolve => setTimeout(() => {
      resolve({
        destination: "parsed destination",
        dates: "parsed dates",
        budget: "parsed budget",
        preferences: ["parsed", "preferences"]
      });
    }, 1000));
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    const result = await queryResult();
    if (result) {
      setSearchParams(result);
    }
  };

  return (
    <div class={styles.searchPage}>
      <h1>Travel Search</h1>
      <div class={styles.searchContainer}>
        <form onSubmit={handleSearch} class={styles.searchForm}>
          <div class={styles.inputGroup}>
            <label for="search">Travel Preferences</label>
            <textarea
              id="search"
              value={searchQuery()}
              onInput={(e) => setSearchQuery(e.target.value)}
              placeholder="Describe the perfect trip (e.g., 'Romantic getaway in June for under $2,000, somewhere warm, with a spa')"
              rows="4"
            />
          </div>
          <button 
            type="submit" 
            class={styles.searchButton}
            disabled={queryResult.loading}
          >
            {queryResult.loading ? 'Processing...' : 'Search'}
          </button>
        </form>

        {searchParams() && (
          <div class={styles.paramsDisplay}>
            <h3>Search Parameters:</h3>
            <pre>{JSON.stringify(searchParams(), null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default Search; 