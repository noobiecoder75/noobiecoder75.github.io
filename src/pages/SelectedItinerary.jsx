import { createSignal, onMount, Show, For } from "solid-js";
import { useNavigate, useLocation } from "@solidjs/router";
import { 
  TbShoppingCart, 
  TbPlane, 
  TbHome, 
  TbMapPin, 
  TbCurrencyDollar,
  TbCheck,
  TbCreditCard,
  TbUser,
  TbMail,
  TbPhone,
  TbCalendar,
  TbClock,
  TbStars,
  TbArrowRight,
  TbFileDownload,
  TbBookmark,
  TbArrowLeft
} from 'solid-icons/tb';
import styles from "./SelectedItinerary.module.css";

function SelectedItinerary() {
  const location = useLocation();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = createSignal(null);
  const [cartItems, setCartItems] = createSignal([]);
  const [showBookingModal, setShowBookingModal] = createSignal(false);
  const [bookingStep, setBookingStep] = createSignal(1);
  const [bookingSuccess, setBookingSuccess] = createSignal(false);
  const [bookingForm, setBookingForm] = createSignal({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  const [selectedItem, setSelectedItem] = createSignal(null);
  const [alternatives, setAlternatives] = createSignal([]);
  const [modifiedItems, setModifiedItems] = createSignal(new Set());

  onMount(() => {
    if (location.state?.itinerary) {
      setItinerary(location.state.itinerary);
      generateCartItems(location.state.itinerary);
      console.log('Current location state:', location.state);
    } else {
      navigate('/prompt');
    }
  });

  const generateAlternatives = (item) => {
    const alternativeOptions = {
      flight: [
        {
          carrier: "Emirates Airlines",
          departure: "10:30 AM",
          arrival: "8:45 PM",
          duration: "10h 15m",
          description: "Direct flights with premium service and extra legroom",
          price: Math.round(item.price * 1.2),
          features: ["Wi-Fi", "Premium Meals", "Extra Legroom"]
        },
        {
          carrier: "Qatar Airways",
          departure: "2:15 PM",
          arrival: "11:30 PM",
          duration: "9h 15m",
          description: "Luxury flight experience with full-flat beds in business class",
          price: Math.round(item.price * 1.4),
          features: ["Flat Beds", "Lounge Access", "Gourmet Dining"]
        }
      ],
      hotel: [
        {
          name: "Luxury Beach Resort",
          description: "Beachfront luxury resort with private pool villas",
          rating: 5,
          price: Math.round(item.price * 1.3),
          features: ["Private Pool", "Ocean View", "Spa Access"]
        },
        {
          name: "Boutique City Hotel",
          description: "Modern boutique hotel in the heart of the city",
          rating: 4,
          price: Math.round(item.price * 0.8),
          features: ["Rooftop Bar", "City Views", "Art Gallery"]
        }
      ],
      activity: [
        {
          name: "Private Guided Tour",
          description: "Exclusive private tour with expert local guide",
          duration: "Full Day",
          price: Math.round(item.price * 1.5),
          features: ["Private Guide", "Luxury Transport", "Gourmet Lunch"]
        },
        {
          name: "Adventure Package",
          description: "Thrilling adventure activities with professional instructors",
          duration: "Half Day",
          price: Math.round(item.price * 0.7),
          features: ["Small Group", "Equipment Included", "Photo Package"]
        },
        {
          name: "Cultural Experience",
          description: "Immersive cultural activities and local interactions",
          duration: "Full Day",
          price: Math.round(item.price * 1.1),
          features: ["Local Guide", "Traditional Lunch", "Craft Workshop"]
        }
      ]
    };

    return alternativeOptions[item.type];
  };

  const generateCartItems = (itineraryData) => {
    const items = [];
    
    items.push({
      id: Math.random().toString(36).substr(2, 9),
      type: 'flight',
      icon: TbPlane,
      name: `Flight from ${itineraryData.origin} to ${itineraryData.destination}`,
      description: itineraryData.transportation,
      price: Math.round(itineraryData.estimatedCost * 0.3),
      details: {
        carrier: "Singapore Airlines",
        departure: "8:45 AM",
        arrival: "6:30 PM",
        duration: "9h 45m",
        stops: 1,
        rating: 4.7,
        features: ["In-flight Entertainment", "Meals Included", "Wi-Fi Available"]
      }
    });

    items.push({
      id: Math.random().toString(36).substr(2, 9),
      type: 'hotel',
      icon: TbHome,
      name: 'Hotel Accommodation',
      description: itineraryData.accommodation,
      price: Math.round(itineraryData.estimatedCost * 0.4),
      details: {
        name: "Grand Resort & Spa",
        rating: 4.5,
        location: "Beachfront",
        amenities: ["Swimming Pool", "Spa", "Restaurant", "Fitness Center"],
        roomType: "Deluxe Ocean View",
        features: ["King Bed", "Balcony", "Room Service"]
      }
    });

    itineraryData.dailyPlan.forEach((day, index) => {
      const activityPrice = Math.round((itineraryData.estimatedCost * 0.3) / itineraryData.dailyPlan.length);
      items.push({
        id: Math.random().toString(36).substr(2, 9),
        type: 'activity',
        icon: TbMapPin,
        name: `Day ${index + 1} Activities`,
        description: day.replace(`Day ${index + 1}:`, '').trim(),
        price: activityPrice,
        details: {
          duration: "Full Day",
          includes: ["Guide", "Transport", "Entrance Fees", "Lunch"],
          schedule: ["9:00 AM - Start", "12:30 PM - Lunch", "5:00 PM - Return"],
          highlights: ["Expert Guide", "Small Group", "All Inclusive"]
        }
      });
    });

    console.log('Generated cart items:', items);
    setCartItems(items);
  };

  const calculateTotal = () => {
    return cartItems().reduce((total, item) => total + item.price, 0);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingStep(bookingStep() + 1);
    
    if (bookingStep() === 2) {
      // Simulate API call
      setTimeout(() => {
        setBookingSuccess(true);
      }, 1500);
    }
  };

  const resetBooking = () => {
    setShowBookingModal(false);
    setBookingStep(1);
    setBookingSuccess(false);
  };

  const BookingModal = () => (
    <div class={styles.modalOverlay}>
      <div class={styles.modal}>
        <Show
          when={!bookingSuccess()}
          fallback={
            <div class={styles.successScreen}>
              <div class={styles.successIcon}>
                <TbCheck size={48} />
              </div>
              <h2>Booking Confirmed!</h2>
              <p>Your itinerary has been successfully booked.</p>
              <p>Confirmation details have been sent to {bookingForm().email}</p>
              <button 
                class={styles.successButton}
                onClick={() => navigate('/bookings')}
              >
                View My Bookings
              </button>
              <button 
                class={styles.closeButton}
                onClick={resetBooking}
              >
                Close
              </button>
            </div>
          }
        >
          <h2>Complete Your Booking</h2>
          <div class={styles.bookingSteps}>
            <div class={`${styles.step} ${bookingStep() >= 1 ? styles.active : ''}`}>
              Personal Details
            </div>
            <div class={`${styles.step} ${bookingStep() === 2 ? styles.active : ''}`}>
              Payment
            </div>
          </div>

          <form onSubmit={handleBookingSubmit}>
            <Show 
              when={bookingStep() === 1}
              fallback={
                <div class={styles.formStep}>
                  <h3>Payment Details</h3>
                  <div class={styles.formGroup}>
                    <label>
                      <TbCreditCard />
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      required
                      maxLength="19"
                      value={bookingForm().cardNumber}
                      onInput={(e) => setBookingForm({
                        ...bookingForm(),
                        cardNumber: e.target.value
                      })}
                    />
                  </div>
                  <div class={styles.formRow}>
                    <div class={styles.formGroup}>
                      <label>Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        required
                        maxLength="5"
                        value={bookingForm().expiryDate}
                        onInput={(e) => setBookingForm({
                          ...bookingForm(),
                          expiryDate: e.target.value
                        })}
                      />
                    </div>
                    <div class={styles.formGroup}>
                      <label>CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        required
                        maxLength="3"
                        value={bookingForm().cvv}
                        onInput={(e) => setBookingForm({
                          ...bookingForm(),
                          cvv: e.target.value
                        })}
                      />
                    </div>
                  </div>
                </div>
              }
            >
              <div class={styles.formStep}>
                <h3>Personal Information</h3>
                <div class={styles.formRow}>
                  <div class={styles.formGroup}>
                    <label>
                      <TbUser />
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={bookingForm().firstName}
                      onInput={(e) => setBookingForm({
                        ...bookingForm(),
                        firstName: e.target.value
                      })}
                    />
                  </div>
                  <div class={styles.formGroup}>
                    <label>
                      <TbUser />
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={bookingForm().lastName}
                      onInput={(e) => setBookingForm({
                        ...bookingForm(),
                        lastName: e.target.value
                      })}
                    />
                  </div>
                </div>
                <div class={styles.formGroup}>
                  <label>
                    <TbMail />
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={bookingForm().email}
                    onInput={(e) => setBookingForm({
                      ...bookingForm(),
                      email: e.target.value
                    })}
                  />
                </div>
                <div class={styles.formGroup}>
                  <label>
                    <TbPhone />
                    Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={bookingForm().phone}
                    onInput={(e) => setBookingForm({
                      ...bookingForm(),
                      phone: e.target.value
                    })}
                  />
                </div>
              </div>
            </Show>

            <div class={styles.modalActions}>
              <button 
                type="button" 
                class={styles.secondaryButton}
                onClick={() => bookingStep() === 1 ? setShowBookingModal(false) : setBookingStep(1)}
              >
                {bookingStep() === 1 ? 'Cancel' : 'Back'}
              </button>
              <button type="submit" class={styles.primaryButton}>
                {bookingStep() === 1 ? 'Continue to Payment' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </Show>
      </div>
    </div>
  );

  const handleCheckout = () => {
    console.log('Handling checkout with itinerary:', itinerary());
    console.log('Total amount:', calculateTotal());
    
    navigate('/customer-details', {
      state: {
        itinerary: itinerary(),
        totalAmount: calculateTotal(),
        passengerCount: itinerary().passengerCount || 1,
        modifiedItems: Array.from(modifiedItems()),
        origin: itinerary().origin,
        destination: itinerary().destination,
        travelDates: itinerary().travelDates
      }
    });
  };

  const handleItemClick = (item) => {
    console.log('Clicking item:', item);
    setSelectedItem(null);
    setTimeout(() => {
      setSelectedItem(item);
      setAlternatives(generateAlternatives(item));
    }, 0);
  };

  const handleSwapOption = (newOption, originalItem) => {
    console.log('Before swap - Selected Item:', selectedItem());
    console.log('Before swap - Cart Items:', cartItems());
    
    const updatedItems = cartItems().map(item => {
      if (!item.id) {
        item.id = Math.random().toString(36).substr(2, 9);
      }
      
      if (item === selectedItem()) {
        console.log('Updating item:', item.id);
        const newModified = new Set(modifiedItems());
        newModified.add(item.id);
        setModifiedItems(newModified);

        return {
          ...item,
          id: item.id,
          price: newOption.price,
          originalOption: item.originalOption || {
            price: item.price,
            description: item.description,
            details: { ...item.details }
          },
          details: {
            ...item.details,
            ...(item.type === 'flight' ? {
              carrier: newOption.carrier,
              departure: newOption.departure,
              arrival: newOption.arrival,
              duration: newOption.duration,
              features: newOption.features
            } : item.type === 'hotel' ? {
              name: newOption.name,
              rating: newOption.rating,
              features: newOption.features
            } : {
              name: newOption.name,
              duration: newOption.duration,
              features: newOption.features
            })
          },
          description: newOption.description
        };
      }
      return item;
    });

    console.log('After swap - Updated Items:', updatedItems);
    setCartItems(updatedItems);
    
    const updatedSelectedItem = updatedItems.find(item => item.id === selectedItem().id);
    console.log('After swap - New Selected Item:', updatedSelectedItem);
    setSelectedItem(updatedSelectedItem);
  };

  const handleRevertChanges = (item) => {
    console.log('Reverting changes for item:', item);
    console.log('Current modified items:', modifiedItems());
    
    const updatedItems = cartItems().map(cartItem => {
      if (cartItem.id === item.id && cartItem.originalOption) {
        console.log('Found item to revert:', cartItem);
        const newModified = new Set(modifiedItems());
        newModified.delete(cartItem.id);
        setModifiedItems(newModified);

        return {
          ...cartItem,
          price: cartItem.originalOption.price,
          description: cartItem.originalOption.description,
          details: cartItem.originalOption.details,
          originalOption: undefined
        };
      }
      return cartItem;
    });

    console.log('After revert - Updated Items:', updatedItems);
    setCartItems(updatedItems);
    
    if (selectedItem().id === item.id) {
      const newSelectedItem = updatedItems.find(cartItem => cartItem.id === item.id);
      console.log('Updating selected item to:', newSelectedItem);
      setSelectedItem(newSelectedItem);
    }
  };

  const handleEmailItinerary = () => {
    console.log('Emailing itinerary...');
  };

  const handleDownloadPDF = () => {
    console.log('Downloading PDF...');
  };

  const handleSaveItinerary = () => {
    console.log('Saving itinerary...');
  };

  const handleBackToDetails = () => {
    setSelectedItem(null);
  };

  const handleBackToItineraries = () => {
    if (location.state?.generatedTrips) {
      navigate('/prompt', { 
        state: { 
          generatedTrips: location.state.generatedTrips,
          preserveInput: true,
          origin: location.state.origin,
          destination: location.state.destination,
          dates: location.state.dates,
          preferences: location.state.preferences
        } 
      });
    } else {
      navigate('/prompt');
    }
  };

  const ItemDetails = () => {
    const item = selectedItem();
    console.log('Rendering ItemDetails for:', item);
    
    if (!item) return null;

    const details = () => {
      if (item.type === 'flight') {
        return (
          <div class={styles.flightDetails}>
            <div class={styles.mainInfo}>
              <div class={styles.timeInfo}>
                <div class={styles.departureInfo}>
                  <span class={styles.timeLabel}>Departure</span>
                  <span class={styles.timeValue}>{item.details.departure}</span>
                </div>
                <TbArrowRight class={styles.arrow} />
                <div class={styles.arrivalInfo}>
                  <span class={styles.timeLabel}>Arrival</span>
                  <span class={styles.timeValue}>{item.details.arrival}</span>
                </div>
              </div>
              <div class={styles.durationInfo}>
                <TbClock class={styles.icon} />
                <span class={styles.durationLabel}>Duration:</span>
                <span class={styles.durationValue}>{item.details.duration}</span>
              </div>
            </div>
            <div class={styles.carrierInfo}>
              <span class={styles.carrierLabel}>Carrier:</span>
              <span class={styles.carrierValue}>{item.details.carrier}</span>
            </div>
            <div class={styles.featureSection}>
              <h4>Features & Amenities</h4>
              <div class={styles.features}>
                {item.details.features.map(feature => (
                  <span class={styles.feature}>
                    <TbCheck class={styles.checkIcon} />
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      }

      if (item.type === 'hotel') {
        return (
          <div class={styles.hotelDetails}>
            <div class={styles.hotelHeader}>
              <div class={styles.hotelName}>
                <h3>{item.details.name}</h3>
                <div class={styles.rating}>
                  <TbStars class={styles.icon} />
                  <span>{item.details.rating} Stars</span>
                </div>
              </div>
              <div class={styles.location}>
                <TbMapPin class={styles.icon} />
                {item.details.location}
              </div>
            </div>
            
            <div class={styles.roomSection}>
              <h4>Room Details</h4>
              <div class={styles.roomType}>
                <span class={styles.roomLabel}>Type:</span>
                <span class={styles.roomValue}>{item.details.roomType}</span>
              </div>
              <div class={styles.roomFeatures}>
                {item.details.features.map(feature => (
                  <span class={styles.feature}>
                    <TbCheck class={styles.checkIcon} />
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <div class={styles.amenitySection}>
              <h4>Hotel Amenities</h4>
              <div class={styles.amenities}>
                {item.details.amenities.map(amenity => (
                  <span class={styles.amenity}>
                    <TbCheck class={styles.checkIcon} />
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      }

      if (item.type === 'activity') {
        return (
          <div class={styles.activityDetails}>
            <div class={styles.activityHeader}>
              <div class={styles.durationInfo}>
                <TbClock class={styles.icon} />
                <span class={styles.durationLabel}>Duration:</span>
                <span class={styles.durationValue}>{item.details.duration}</span>
              </div>
            </div>

            <div class={styles.includesSection}>
              <h4>What's Included</h4>
              <div class={styles.includesList}>
                {item.details.includes.map(include => (
                  <div class={styles.includeItem}>
                    <TbCheck class={styles.checkIcon} />
                    <span>{include}</span>
                  </div>
                ))}
              </div>
            </div>

            <div class={styles.scheduleSection}>
              <h4>Daily Schedule</h4>
              <div class={styles.timeline}>
                {item.details.schedule.map(time => (
                  <div class={styles.timelineItem}>
                    <div class={styles.timelineDot} />
                    <span>{time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div class={styles.highlightSection}>
              <h4>Highlights</h4>
              <div class={styles.highlights}>
                {item.details.highlights.map(highlight => (
                  <div class={styles.highlight}>
                    <TbStars class={styles.starIcon} />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }
    };

    return (
      <div class={styles.itemDetails}>
        <h2 class={styles.detailsTitle}>
          <item.icon class={styles.titleIcon} />
          {item.name}
        </h2>
        <div class={styles.detailsContent}>
          {details()}
        </div>
        <div class={styles.alternatives}>
          <h3>Alternative Options</h3>
          <div class={styles.alternativesList}>
            <For each={alternatives()}>
              {alternative => (
                <div class={styles.alternativeItem}>
                  <div class={styles.altIcon}>
                    {item.type === 'flight' && <TbPlane />}
                    {item.type === 'hotel' && <TbHome />}
                    {item.type === 'activity' && <TbMapPin />}
                  </div>
                  <div class={styles.altContent}>
                    <div class={styles.altMainInfo}>
                      <span class={styles.altName}>
                        {item.type === 'flight' ? alternative.carrier :
                         item.type === 'hotel' ? alternative.name :
                         alternative.name}
                      </span>
                      <span class={styles.altPrice}>${alternative.price.toLocaleString()}</span>
                    </div>
                    
                    <div class={styles.altDescription}>
                      {alternative.description}
                    </div>

                    {item.type === 'flight' && (
                      <div class={styles.altTime}>
                        {alternative.departure} → {alternative.arrival}
                        <span class={styles.altDuration}>({alternative.duration})</span>
                      </div>
                    )}

                    <div class={styles.altFeatures}>
                      {alternative.features.map(feature => (
                        <span class={styles.altFeature}>{feature}</span>
                      ))}
                    </div>

                    <button 
                      class={styles.selectButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSwapOption(alternative, item);
                      }}
                    >
                      Select This Option
                    </button>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div class={styles.selectedItineraryPage}>
      <Show when={itinerary()}>
        <div class={styles.header}>
          <div class={styles.headerTop}>
            <div class={styles.headerLeft}>
              <button 
                class={`${styles.actionButton} ${styles.backToItineraries}`}
                onClick={handleBackToItineraries}
              >
                <TbArrowLeft />
                Back to Itineraries
              </button>
              <h1>{itinerary().title}</h1>
            </div>
            <div class={styles.headerActions}>
              {selectedItem() && (
                <button 
                  class={`${styles.actionButton} ${styles.backButton}`}
                  onClick={handleBackToDetails}
                >
                  <TbArrowRight class={styles.backIcon} />
                  Back to Details
                </button>
              )}
              <button 
                class={styles.actionButton} 
                onClick={handleSaveItinerary}
              >
                <TbBookmark />
                Save Itinerary
              </button>
            </div>
          </div>
          <div class={styles.tripDetailsContainer}>
            <div class={styles.tripRoute}>
              <div class={styles.locationDetail}>
                <span class={styles.locationLabel}>From</span>
                <span class={styles.locationName}>{itinerary().origin}</span>
              </div>
              <TbArrowRight class={styles.routeArrow} />
              <div class={styles.locationDetail}>
                <span class={styles.locationLabel}>To</span>
                <span class={styles.locationName}>{itinerary().destination}</span>
              </div>
            </div>
            <div class={styles.tripDates}>
              <TbCalendar class={styles.dateIcon} />
              <span class={styles.dates}>{itinerary().travelDates}</span>
            </div>
          </div>
        </div>

        <div class={styles.content}>
          <div class={styles.summary}>
            <div class={styles.summaryActions}>
              <button 
                class={styles.actionButton} 
                onClick={handleEmailItinerary}
              >
                <TbMail />
                Email Itinerary
              </button>
              <button 
                class={styles.actionButton} 
                onClick={handleDownloadPDF}
              >
                <TbFileDownload />
                Itinerary PDF
              </button>
            </div>
            
            <Show
              when={selectedItem()}
              fallback={
                <>
                  <h2>Trip Details</h2>
                  <div class={styles.itineraryDetails}>
                    <div>
                      <h3><TbMapPin />Summary</h3>
                      <p>{itinerary().summary}</p>
                    </div>
                    
                    <div>
                      <h3><TbStars />Highlights</h3>
                      <ul>
                        <For each={itinerary().highlights}>
                          {highlight => <li>{highlight}</li>}
                        </For>
                      </ul>
                    </div>

                    <div>
                      <h3><TbCalendar />Full Itinerary</h3>
                      <ul>
                        <For each={itinerary().dailyPlan}>
                          {(day, index) => (
                            <li>
                              <strong>Day {index() + 1}</strong>
                              <span>{day.replace(`Day ${index() + 1}:`, '').trim()}</span>
                            </li>
                          )}
                        </For>
                      </ul>
                    </div>
                  </div>
                </>
              }
            >
              <ItemDetails />
            </Show>
          </div>

          <div class={styles.cartSection}>
            <div class={styles.cartHeader}>
              <TbShoppingCart />
              <h2>Itemized Breakdown</h2>
            </div>

            <div class={styles.cartItems}>
              <For each={cartItems()}>
                {item => (
                  <div 
                    class={`${styles.cartItem} ${selectedItem() === item ? styles.selected : ''} ${modifiedItems().has(item.id) ? styles.modified : ''}`}
                    onClick={() => handleItemClick(item)}
                  >
                    <div class={styles.itemIcon}>
                      <item.icon />
                    </div>
                    <div class={styles.itemDetails}>
                      <div class={styles.itemHeader}>
                        <h3>{item.name}</h3>
                        {modifiedItems().has(item.id) && (
                          <button 
                            class={styles.revertButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRevertChanges(item);
                            }}
                          >
                            Revert Changes
                          </button>
                        )}
                      </div>
                      <p>{item.description}</p>
                    </div>
                    <div class={styles.itemPrice}>
                      ${item.price.toLocaleString()}
                    </div>
                  </div>
                )}
              </For>
            </div>

            <div class={styles.cartTotal}>
              <div class={styles.totalLabel}>
                <TbCurrencyDollar />
                <span>Total Cost</span>
              </div>
              <div class={styles.totalAmount}>
                ${calculateTotal().toLocaleString()}
              </div>
            </div>

            <button 
              class={styles.checkoutButton}
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </Show>

      <Show when={location.state?.step === 'payment'}>
        <div class={styles.paymentSection}>
          <h2>Payment Details</h2>
          <div class={styles.passengerSummary}>
            <h3>Passenger Information</h3>
            <For each={location.state?.passengers}>
              {(passenger) => (
                <div class={styles.passengerInfo}>
                  <span>{passenger.firstName} {passenger.lastName}</span>
                  <span>{passenger.passportNumber}</span>
                </div>
              )}
            </For>
          </div>
        </div>
      </Show>

      <Show when={showBookingModal()}>
        <BookingModal />
      </Show>
    </div>
  );
}

export default SelectedItinerary; 