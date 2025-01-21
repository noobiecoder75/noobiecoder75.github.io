import { A } from "@solidjs/router";
import { FiHome, FiBook, FiMail, FiSettings, FiLogOut, FiMenu, FiX, FiPlusCircle, FiMessageSquare, FiUsers } from 'solid-icons/fi';
import { createSignal, onMount, createEffect } from "solid-js";
import styles from "./Navbar.module.css";
import { For, Show } from "solid-js/web";
import { useNavigate } from "@solidjs/router";
import { refreshNavbar, setRefreshNavbar } from "../state/refreshState"; // Import the refresh state
import CommissionSettings from "./CommissionSettings";
import CommissionDashboard from "./CommissionDashboard";
import { TbSettings, TbChartBar } from 'solid-icons/tb';

function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = createSignal(false);
  const [recentQuotes, setRecentQuotes] = createSignal([]);
  const [bookings, setBookings] = createSignal([]);
  const [showCommissionSettings, setShowCommissionSettings] = createSignal(false);
  const navigate = useNavigate();

  const loadData = () => {
    const savedQuotes = JSON.parse(localStorage.getItem('recentQuotes') || '[]');
    const savedBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    setRecentQuotes(savedQuotes);
    setBookings(savedBookings);
  };

  onMount(() => {
    loadData();
  });

  createEffect(() => {
    if (refreshNavbar()) {
      loadData();
      setRefreshNavbar(false);
    }
  });

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen());

  const handleViewMore = (section) => {
    if (section === 'quotes') {
      navigate('/saved-quotes');
    }
  };

  // Mock data for activities
  const activities = {
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

  return (
    <>
      <nav class={styles.navbar}>
        <div class={styles.navLeft}>
          <button class={styles.menuButton} onClick={toggleSidebar}>
            {isSidebarOpen() ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <A href="/" class={styles.logoLink}>
            <div class={styles.logo}>TravelGPT</div>
          </A>
        </div>

        <div class={styles.navRight}>
          <A href="/agent-profile" class={styles.profileButton}>
            Agent Profile
          </A>
        </div>
      </nav>

      {/* Combined Sidebar */}
      <div class={`${styles.sidebar} ${isSidebarOpen() ? styles.open : ''}`}>
        <div class={styles.sidebarContent}>
          {/* Navigation Section */}
          <div class={styles.sidebarSection}>
            <div class={styles.sectionHeader}>
              <h3>Navigation</h3>
            </div>
            <div class={styles.navLinks}>
              <A href="/" class={styles.navLink} onClick={toggleSidebar}>
                <FiHome />
                <span>Dashboard</span>
              </A>
              <A href="/contacts" class={styles.navLink} onClick={toggleSidebar}>
                <FiUsers />
                <span>Contacts</span>
              </A>
              <A href="/new-quote" class={styles.navLink} onClick={toggleSidebar}>
                <FiPlusCircle />
                <span>New Quote</span>
              </A>
              <A href="/bookings" class={styles.navLink} onClick={toggleSidebar}>
                <FiBook />
                <span>Bookings</span>
              </A>
              <A href="/messages" class={styles.navLink} onClick={toggleSidebar}>
                <FiMail />
                <span>Messages</span>
              </A>
              <A href="/prompt" class={styles.navLink} onClick={toggleSidebar}>
                <FiMessageSquare />
                <span>Prompt</span>
              </A>
              <A href="/settings" class={styles.navLink} onClick={toggleSidebar}>
                <FiSettings />
                <span>Settings</span>
              </A>
              <A href="/commission-dashboard" class={styles.navLink} onClick={toggleSidebar}>
                <TbChartBar />
                <span>Commission Dashboard</span>
              </A>
            </div>
          </div>

          {/* Recent Quotes Section */}
          <div class={styles.sidebarSection}>
            <div class={styles.sectionHeader}>
              <h3>Recent Quotes</h3>
              <button 
                class={styles.viewMoreButton}
                onClick={() => handleViewMore('quotes')}
              >
                View More
              </button>
            </div>
            <div class={styles.activityList}>
              <For each={recentQuotes()}>
                {quote => (
                  <div 
                    class={styles.activityItem}
                    onClick={() => {
                      // Force a reload when switching between quotes
                      const currentPath = window.location.pathname;
                      const newPath = `/quote/${quote.id}`;
                      
                      if (currentPath.startsWith('/quote/')) {
                        // If we're already on a quote page, force reload the data
                        navigate(newPath, { replace: true });
                        // Trigger a refresh to ensure the new quote loads
                        setRefreshNavbar(true);
                      } else {
                        // Normal navigation for first quote view
                        navigate(newPath);
                      }
                    }}
                    role="button"
                    tabindex="0"
                  >
                    <div class={styles.activityInfo}>
                      <strong>{quote.client}</strong>
                      <span>{quote.destination}</span>
                    </div>
                    <div class={styles.activityMeta}>
                      <span class={styles.activityDate}>{quote.date}</span>
                      <span class={`${styles.status} ${styles[quote.status.toLowerCase()]}`}>
                        ${quote.amount?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </For>
              <Show when={recentQuotes().length === 0}>
                <div class={styles.emptyState}>
                  No recent quotes
                </div>
              </Show>
            </div>
          </div>

          <div class={styles.sidebarSection}>
            <div class={styles.sectionHeader}>
              <h3>Recently Viewed</h3>
              <button 
                class={styles.viewMoreButton}
                onClick={() => handleViewMore('viewed')}
              >
                View More
              </button>
            </div>
            <div class={styles.activityList}>
              {activities.recentlyViewed.map(item => (
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

          <div class={styles.sidebarSection}>
            <div class={styles.sectionHeader}>
              <h3>In-Progress Bookings</h3>
              <button 
                class={styles.viewMoreButton}
                onClick={() => handleViewMore('bookings')}
              >
                View More
              </button>
            </div>
            <div class={styles.activityList}>
              {activities.inProgressBookings.map(booking => (
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

          <div class={styles.sidebarSection}>
            <div class={styles.sectionHeader}>
              <h3>Recent Bookings</h3>
              <button 
                class={styles.viewMoreButton}
                onClick={() => handleViewMore('bookings')}
              >
                View More
              </button>
            </div>
            <div class={styles.activityList}>
              <For each={bookings()}>
                {booking => (
                  <div 
                    class={styles.activityItem}
                    onClick={() => navigate(`/booking/${booking.id}`)}
                    role="button"
                    tabindex="0"
                  >
                    <div class={styles.activityInfo}>
                      <strong>{booking.client}</strong>
                      <span>{booking.destination}</span>
                    </div>
                    <div class={styles.activityMeta}>
                      <span class={styles.activityDate}>{booking.date}</span>
                      <span class={`${styles.status} ${styles.confirmed}`}>
                        ${booking.amount?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </For>
              <Show when={bookings().length === 0}>
                <div class={styles.emptyState}>
                  No recent bookings
                </div>
              </Show>
            </div>
          </div>

          <div class={styles.sidebarSection}>
            <div class={styles.sectionHeader}>
              <h3>Commission Dashboard</h3>
            </div>
            <CommissionDashboard />
            <button 
              class={styles.settingsButton}
              onClick={() => setShowCommissionSettings(true)}
            >
              <TbSettings />
              Commission Settings
            </button>
          </div>

          <button class={styles.logoutButton}>
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen() && (
        <div class={styles.overlay} onClick={toggleSidebar} />
      )}

      <CommissionSettings 
        isOpen={showCommissionSettings()} 
        onClose={() => setShowCommissionSettings(false)} 
      />
    </>
  );
}

export default Navbar; 