import { createSignal, createEffect, onMount, onError } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { FiSearch, FiDollarSign, FiClock, FiPlusCircle, FiAlertCircle, FiCalendar, FiFileText, FiStar, FiMapPin, FiPackage } from 'solid-icons/fi';
import styles from "./Home.module.css";
import CommissionDashboard from "../components/CommissionDashboard";
import { 
  potentialRevenue, 
  realizedRevenue,
  loadCommissionData 
} from "../state/commissionsState";
import { TbChartBar } from 'solid-icons/tb';
import { ErrorBoundary } from "solid-js";
import { Show, For } from "solid-js";
import { refreshNavbar, setRefreshNavbar } from "../state/refreshState";

function Home() {
  // Error handling signal
  const [error, setError] = createSignal(null);

  // Global error boundary for the component
  onError((err) => {
    console.error("Home component error:", err);
    setError(err);
  });

  // State management with error handling
  const [searchQuery, setSearchQuery] = createSignal("");
  const navigate = useNavigate();
  const [bookings, setBookings] = createSignal([]);
  const [recentQuotes, setRecentQuotes] = createSignal([]);

  const handleSearch = (e) => {
    try {
      e.preventDefault();
      if (searchQuery()) {
        navigate('/prompt', { 
          state: { 
            initialPrompt: searchQuery(),
            fromHome: true 
          } 
        });
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to process search request");
    }
  };

  // Mock data for recent searches
  const recentSearches = [
    "Luxury beach vacation in Maldives",
    "Family trip to Disney World",
    "Ski trip to Swiss Alps"
  ];

  // Mock data for dashboard statistics
  const upcomingBookings = [
    { id: 1, client: "John & Sarah Smith", destination: "Bali", date: "June 15, 2024" },
    { id: 2, client: "Thompson Family", destination: "Disney World", date: "July 1, 2024" }
  ];

  const alerts = [
    { id: 1, type: "warning", message: "System maintenance scheduled for tonight at 2 AM EST" },
    { id: 2, type: "info", message: "New direct flights available from JFK to Bali" }
  ];

  // Mock data for featured travel deals
  const featuredDeals = [
    {
      id: 1,
      type: 'package',
      title: 'Luxury Alps Ski Package',
      description: 'All-inclusive winter getaway with premium ski passes',
      price: '$2,999',
      saving: '25%',
      image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&q=80&w=500',
      period: 'Dec 2024 - Mar 2025'
    },
    {
      id: 2,
      type: 'destination',
      title: 'Caribbean Summer Escapes',
      description: 'Special rates at 5-star beach resorts',
      price: '$1,899',
      saving: '30%',
      image: 'https://images.unsplash.com/photo-1547150492-da7ff1742941?auto=format&fit=crop&q=80&w=500',
      period: 'Jun - Aug 2024'
    },
    {
      id: 3,
      type: 'add-on',
      title: 'Premium Travel Insurance',
      description: 'Comprehensive coverage with COVID protection',
      price: '$199',
      saving: '15%',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=500',
      period: 'Limited time offer'
    },
    {
      id: 4,
      type: 'package',
      title: 'Japan Cherry Blossom Tour',
      description: 'Cultural experience during peak season',
      price: '$3,499',
      saving: '20%',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=500',
      period: 'Mar - Apr 2025'
    }
  ];

  // Helper function to get appropriate icon for deal type
  const getDealIcon = (type) => {
    switch(type) {
      case 'package':
        return <FiPackage />;
      case 'destination':
        return <FiMapPin />;
      case 'add-on':
        return <FiStar />;
      default:
        return <FiPackage />;
    }
  };

  // Mock data for recent activities and bookings
  const recentActivities = {
    recentQuotes: [
      { id: 1, client: "Robert Chen", destination: "Paris", date: "2 hours ago", status: "Pending" },
      { id: 2, client: "Maria Garcia", destination: "Tokyo", date: "5 hours ago", status: "Viewed" },
      { id: 3, client: "James Wilson", destination: "Cancun", date: "1 day ago", status: "Accepted" }
    ],
    recentlyViewed: [
      { id: 1, type: "Hotel", name: "Ritz Carlton Bali", time: "30 mins ago" },
      { id: 2, type: "Flight", name: "NYC to London - Business", time: "1 hour ago" },
      { id: 3, type: "Package", name: "Mediterranean Cruise", time: "3 hours ago" }
    ],
    inProgressBookings: [
      { id: 1, client: "Sophie Turner", type: "Flight + Hotel", progress: "Payment Pending" },
      { id: 2, client: "Alex Johnson", type: "All-Inclusive Resort", progress: "Documents Required" }
    ]
  };

  // Modified recent search click handler
  const handleRecentSearchClick = (search) => {
    navigate('/prompt', { 
      state: { 
        initialPrompt: search,
        fromHome: true 
      } 
    });
  };

  // Add loadData function
  const loadData = () => {
    try {
      // Load bookings
      const savedBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      const sortedBookings = savedBookings
        .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate))
        .slice(0, 3);
      setBookings(sortedBookings);

      // Load quotes
      const savedQuotes = JSON.parse(localStorage.getItem('recentQuotes') || '[]');
      const sortedQuotes = savedQuotes
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3); // Show only the 3 most recent quotes
      setRecentQuotes(sortedQuotes);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError("Failed to load data");
    }
  };

  // Modified onMount
  onMount(async () => {
    try {
      await loadCommissionData();
      loadData();
    } catch (err) {
      console.error("Failed to load data:", err);
      setError("Failed to load data");
    }
  });

  // Add createEffect to watch for refreshNavbar changes
  createEffect(() => {
    if (refreshNavbar()) {
      loadData();
      setRefreshNavbar(false);
    }
  });

  // Add navigation handler for bookings
  const handleBookingClick = (bookingId) => {
    try {
      navigate(`/booking/${bookingId}`);
    } catch (err) {
      console.error("Navigation error:", err);
      setError("Failed to navigate to booking details");
    }
  };

  // Add navigation handler for quotes
  const handleQuoteClick = (quoteId) => {
    try {
      navigate(`/quote/${quoteId}`);
    } catch (err) {
      console.error("Navigation error:", err);
      setError("Failed to navigate to quote details");
    }
  };

  return (
    <div class={styles.home}>
      {/* Error Display */}
      {error() && (
        <div class={styles.errorAlert}>
          <FiAlertCircle />
          <p>{error()}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {/* Revenue Overview Section */}
      <section class={styles.revenueOverview}>
        <ErrorBoundary fallback={err => (
          <div class={styles.sectionError}>
            <FiAlertCircle />
            <p>Failed to load revenue overview</p>
          </div>
        )}>
          <div class={styles.revenueHeader}>
            <div class={styles.headerTitle}>
              <TbChartBar />
              <h2>Revenue Overview</h2>
            </div>
          </div>
          <div class={styles.revenueCards}>
            <div class={styles.revenueCard}>
              <h3>Realized Revenue</h3>
              <div class={styles.revenueAmount}>${realizedRevenue().toLocaleString()}</div>
              <div class={styles.revenueLabel}>From confirmed bookings</div>
            </div>
            <div class={styles.revenueCard}>
              <h3>Potential Revenue</h3>
              <div class={styles.revenueAmount}>${potentialRevenue().toLocaleString()}</div>
              <div class={styles.revenueLabel}>From pending quotes</div>
            </div>
          </div>
        </ErrorBoundary>
      </section>

      {/* Hero Section with Search */}
      <ErrorBoundary fallback={err => (
        <div class={styles.sectionError}>
          <FiAlertCircle />
          <p>Search functionality unavailable</p>
        </div>
      )}>
        <section class={styles.hero}>
          <h1>Create Unforgettable Travel Experiences</h1>
          <p class={styles.subtitle}>Use natural language to describe the perfect trip for your clients</p>
          
          <form onSubmit={handleSearch} class={styles.searchForm}>
            <div class={styles.searchBox}>
              <FiSearch class={styles.searchIcon} />
              <input
                type="text"
                placeholder="Where would you like to go? e.g. 'Honeymoon in Bali next June under $3,000'"
                value={searchQuery()}
                onInput={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" class={styles.searchButton}>
              Generate Trip
            </button>
          </form>

          {/* Recent Searches Section - Moved here */}
          <div class={styles.recentSearchesWrapper}>
            <h2>
              <FiClock />
              Recent Searches
            </h2>
            <div class={styles.searchList}>
              {recentSearches.map((search) => (
                <button 
                  class={styles.recentSearchItem}
                  onClick={() => handleRecentSearchClick(search)}
                >
                  <FiSearch />
                  <span>{search}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </ErrorBoundary>

      {/* Updated Stats Dashboard Section */}
      <ErrorBoundary fallback={err => (
        <div class={styles.sectionError}>
          <FiAlertCircle />
          <p>Unable to load statistics</p>
        </div>
      )}>
        <section class={styles.statsSection}>
          <div class={styles.statsGrid}>
            <div class={styles.statsCard}>
              <div class={styles.cardHeader}>
                <FiCalendar />
                <h3>Upcoming Bookings</h3>
              </div>
              <div class={styles.bookingsList}>
                <Show
                  when={bookings().length > 0}
                  fallback={
                    <div class={styles.emptyState}>
                      No upcoming bookings
                    </div>
                  }
                >
                  <For each={bookings()}>
                    {booking => (
                      <div 
                        class={styles.bookingItem}
                        onClick={() => handleBookingClick(booking.id)}
                      >
                        <div class={styles.bookingInfo}>
                          <strong>{booking.client}</strong>
                          <span>{booking.destination}</span>
                        </div>
                        <div class={styles.bookingMeta}>
                          <div class={styles.bookingDate}>
                            {new Date(booking.bookingDate).toLocaleDateString()}
                          </div>
                          <div class={styles.bookingAmount}>
                            ${booking.amount?.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )}
                  </For>
                </Show>
              </div>
            </div>

            <div class={styles.statsCard}>
              <div class={styles.cardHeader}>
                <FiFileText />
                <h3>Recent Quotes ({recentQuotes().length})</h3>
              </div>
              <div class={styles.quotesList}>
                <Show
                  when={recentQuotes().length > 0}
                  fallback={
                    <div class={styles.emptyState}>
                      No recent quotes
                    </div>
                  }
                >
                  <For each={recentQuotes()}>
                    {quote => (
                      <div 
                        class={styles.quoteItem}
                        onClick={() => handleQuoteClick(quote.id)}
                      >
                        <div class={styles.quoteInfo}>
                          <strong>{quote.client}</strong>
                          <span>{quote.destination}</span>
                        </div>
                        <div class={styles.quoteMeta}>
                          <div class={styles.quoteDate}>
                            {quote.date}
                          </div>
                          <div class={styles.quoteAmount}>
                            ${quote.amount?.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )}
                  </For>
                </Show>
              </div>
            </div>

            <div class={styles.statsCard}>
              <div class={styles.cardHeader}>
                <FiAlertCircle />
                <h3>Important Alerts</h3>
              </div>
              <div class={styles.alertsList}>
                {alerts.map(alert => (
                  <div class={`${styles.alertItem} ${styles[alert.type]}`}>
                    <FiAlertCircle />
                    <p>{alert.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </ErrorBoundary>

      {/* Featured Deals Section */}
      <section class={styles.featuredSection}>
        <div class={styles.sectionHeader}>
          <h2>Featured Deals & Inspiration</h2>
          <button class={styles.viewAllButton}>View All Deals</button>
        </div>

        <div class={styles.dealsGrid}>
          {featuredDeals.map(deal => (
            <div class={styles.dealCard} key={deal.id}>
              <div class={styles.dealImage} style={{"background-image": `url(${deal.image})`}}>
                <div class={styles.dealBadge}>
                  {getDealIcon(deal.type)}
                  <span>{deal.type}</span>
                </div>
                <div class={styles.dealSaving}>Save {deal.saving}</div>
              </div>
              <div class={styles.dealContent}>
                <h3>{deal.title}</h3>
                <p>{deal.description}</p>
                <div class={styles.dealFooter}>
                  <div class={styles.dealPrice}>
                    <span>From</span>
                    <strong>{deal.price}</strong>
                  </div>
                  <div class={styles.dealPeriod}>{deal.period}</div>
                </div>
                <button class={styles.dealButton}>View Details</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Activity Sidebar */}
      <aside class={styles.activitySidebar}>
        <div class={styles.activitySection}>
          <h3>Recent Quotes</h3>
          <div class={styles.activityList}>
            {recentActivities.recentQuotes.map(quote => (
              <div class={styles.activityItem}>
                <div class={styles.activityInfo}>
                  <strong>{quote.client}</strong>
                  <span>{quote.destination}</span>
                </div>
                <div class={styles.activityMeta}>
                  <span class={styles.activityDate}>{quote.date}</span>
                  <span class={`${styles.status} ${styles[quote.status.toLowerCase()]}`}>
                    {quote.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div class={styles.activitySection}>
          <h3>Recently Viewed</h3>
          <div class={styles.activityList}>
            {recentActivities.recentlyViewed.map(item => (
              <div class={styles.activityItem}>
                <div class={styles.activityInfo}>
                  <span class={styles.itemType}>{item.type}</span>
                  <strong>{item.name}</strong>
                </div>
                <span class={styles.activityTime}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div class={styles.activitySection}>
          <h3>In-Progress Bookings</h3>
          <div class={styles.activityList}>
            {recentActivities.inProgressBookings.map(booking => (
              <div class={styles.activityItem}>
                <div class={styles.activityInfo}>
                  <strong>{booking.client}</strong>
                  <span>{booking.type}</span>
                </div>
                <div class={styles.progressBadge}>
                  {booking.progress}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

export default Home; 