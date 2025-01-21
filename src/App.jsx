import { Router, useRoutes, Routes, Route } from "@solidjs/router";
import { lazy, Suspense } from "solid-js";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import styles from "./App.module.css";
import NewQuote from "./pages/NewQuote";
import Prompt from './pages/Prompt';
import AgentProfile from "./pages/AgentProfile";
import SelectedItinerary from "./pages/SelectedItinerary";
import CustomerDetails from "./pages/CustomerDetails";
import BookingSummary from "./pages/BookingSummary";
import ReviewBooking from "./pages/ReviewBooking";
import Payment from "./pages/Payment";
import SavedQuotes from "./pages/SavedQuotes";
import QuoteDetails from "./pages/QuoteDetails";
import CommissionDashboardPage from "./pages/CommissionDashboardPage";
import Contacts from "./pages/Contacts";

// Lazy load pages with explicit paths
const Home = lazy(() => import("./pages/Home.jsx"));
const Search = lazy(() => import("./pages/Search.jsx"));
const Results = lazy(() => import("./pages/Results.jsx"));
const Quote = lazy(() => import("./pages/Quote.jsx"));
const Booking = lazy(() => import("./pages/Booking.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const Bookings = lazy(() => import("./pages/Bookings.jsx"));
const Messages = lazy(() => import("./pages/Messages.jsx"));
const Settings = lazy(() => import("./pages/Settings.jsx"));
const ItineraryBuilder = lazy(() => import("./components/itinerary/ItineraryBuilder.jsx"));

// Define routes
const routes = [
  {
    path: "/",
    component: Home,
  },
  {
    path: "/dashboard",
    component: Dashboard,
  },
  {
    path: "/search",
    component: Search,
  },
  {
    path: "/results",
    component: Results,
  },
  {
    path: "/quote",
    component: Quote,
  },
  {
    path: "/booking",
    component: Booking,
  },
  {
    path: "/bookings",
    component: Bookings,
  },
  {
    path: "/messages",
    component: Messages,
  },
  {
    path: "/settings",
    component: Settings,
  },
  {
    path: "/new-quote",
    component: NewQuote,
  },
  {
    path: "/prompt",
    component: Prompt,
  },
  {
    path: "/agent-profile",
    component: AgentProfile
  },
  {
    path: "/selected-itinerary",
    component: SelectedItinerary
  },
  {
    path: "/customer-details",
    component: CustomerDetails
  },
  {
    path: "/booking-summary",
    component: BookingSummary
  },
  {
    path: "/review-booking",
    component: ReviewBooking
  },
  {
    path: "/payment",
    component: Payment
  },
  {
    path: "/saved-quotes",
    component: SavedQuotes
  },
  {
    path: "/quote/:id",
    component: QuoteDetails
  },
  {
    path: "/commission-dashboard",
    component: CommissionDashboardPage
  },
  {
    path: "/contacts",
    component: Contacts
  },
  {
    path: "/contacts/:id",
    component: Contacts
  }
];

function App() {
  const Routes = useRoutes(routes);

  return (
    <Router>
      <div class={styles.appWrapper}>
        <Navbar />
        <main class={styles.mainContent}>
          <Suspense fallback={<div>Loading...</div>}>
            {Routes()}
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App; 