import { createSignal, createEffect, For, Show } from "solid-js";
import { useNavigate, useLocation } from "@solidjs/router";
import { 
  TbSearch, 
  TbUser, 
  TbUsers,
  TbCalendar,
  TbId,
  TbMail,
  TbPhone,
  TbCheck,
  TbAlertCircle,
  TbPlane,
  TbHome,
  TbMapPin,
  TbPlus,
  TbUserPlus,
  TbTrash,
  TbArrowLeft
} from 'solid-icons/tb';
import styles from "./CustomerDetails.module.css";

function CustomerDetails() {
  console.log('CustomerDetails component rendering');
  const location = useLocation();
  const navigate = useNavigate();
  
  // Add this log right away
  console.log('Initial location state:', location.state);

  const [passengers, setPassengers] = createSignal([]);
  const [isFormValid, setIsFormValid] = createSignal(false);
  const [showCrmMessage, setShowCrmMessage] = createSignal(false);
  const [cartItems, setCartItems] = createSignal([]);
  const [showManualInput, setShowManualInput] = createSignal(true);
  const [manualEntryError, setManualEntryError] = createSignal(null);

  // Add error boundary
  try {
    createEffect(() => {
      console.log('🔄 createEffect running');
      console.log('Location state in effect:', location.state);
      
      if (!location.state?.itinerary) {
        console.warn('⚠️ No itinerary found in state, redirecting to prompt');
        navigate('/prompt');
        return;
      }

      // Generate cart items
      console.log('📦 Generating cart items from itinerary');
      generateCartItems(location.state.itinerary);
    });
  } catch (error) {
    console.error('Error in createEffect:', error);
  }

  // Generate cart items based on itinerary
  const generateCartItems = (itineraryData) => {
    console.log('🏁 Generating cart items for itinerary:', itineraryData);
    const items = [];
    
    // Log flight item
    const flightItem = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'flight',
      icon: TbPlane,
      name: `Flight from ${itineraryData.origin} to ${itineraryData.destination}`,
      description: itineraryData.transportation,
      price: Math.round(itineraryData.estimatedCost * 0.3)
    };
    console.log('✈️ Adding flight item:', flightItem);
    items.push(flightItem);

    // Log hotel item
    const hotelItem = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'hotel',
      icon: TbHome,
      name: 'Hotel Accommodation',
      description: itineraryData.accommodation,
      price: Math.round(itineraryData.estimatedCost * 0.4)
    };
    console.log('🏨 Adding hotel item:', hotelItem);
    items.push(hotelItem);

    // Log activity items
    itineraryData.dailyPlan.forEach((day, index) => {
      const activityPrice = Math.round((itineraryData.estimatedCost * 0.3) / itineraryData.dailyPlan.length);
      const activityItem = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'activity',
        icon: TbMapPin,
        name: `Day ${index + 1} Activities`,
        description: day.replace(`Day ${index + 1}:`, '').trim(),
        price: activityPrice
      };
      console.log(`🎯 Adding activity for day ${index + 1}:`, activityItem);
      items.push(activityItem);
    });

    console.log('✅ Final cart items:', items);
    setCartItems(items);
  };

  const handleCrmSearch = () => {
    setShowCrmMessage(true);
    setTimeout(() => setShowCrmMessage(false), 3000);
  };

  const handleConnectHubspot = () => {
    setShowCrmMessage(true);
    setTimeout(() => setShowCrmMessage(false), 3000);
  };

  const validatePassenger = (passenger) => {
    return (
      passenger.firstName.trim() !== '' &&
      passenger.lastName.trim() !== '' &&
      passenger.dateOfBirth.trim() !== '' &&
      passenger.passportNumber.trim() !== '' &&
      passenger.email.trim() !== '' &&
      passenger.phone.trim() !== ''
    );
  };

  const updatePassenger = (index, field, value) => {
    const updatedPassengers = [...passengers()];
    
    // Get the actual value from the event if it's an input event
    const newValue = value?.target?.value ?? value;
    
    updatedPassengers[index] = {
      ...updatedPassengers[index],
      [field]: newValue
    };
    updatedPassengers[index].isValid = validatePassenger(updatedPassengers[index]);
    setPassengers(updatedPassengers);
    
    // Check if all passengers are valid
    setIsFormValid(updatedPassengers.every(p => p.isValid));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isFormValid()) {
      console.log('📝 Form submitted with passengers:', passengers());
      console.log('🛒 Current cart items:', cartItems());
      
      navigate('/review-booking', {
        state: {
          ...location.state,
          passengers: passengers(),
          cartItems: cartItems(),
          totalAmount: location.state?.totalAmount,
          origin: location.state?.origin,
          destination: location.state?.destination,
          travelDates: location.state?.travelDates,
          itinerary: location.state?.itinerary
        }
      });
    }
  };

  const handleManualEntry = () => {
    console.log('🖊️ Toggling manual entry mode');
    
    try {
      // Toggle manual input mode
      if (showManualInput()) {
        console.log('📝 Disabling manual entry mode');
        setShowManualInput(false);
        return;
      }

      if (!location.state?.itinerary) {
        const error = 'No itinerary data found for manual entry';
        console.error('❌', error);
        setManualEntryError(error);
        return;
      }

      const passengerCount = location.state?.passengerCount || 1;
      console.log(`👥 Initializing form for ${passengerCount} passenger(s)`);
      
      // Initialize passenger forms
      setPassengers(Array(passengerCount).fill().map(() => ({
        type: 'adult',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        passportNumber: '',
        email: '',
        phone: '',
        isValid: false
      })));

      setShowManualInput(true);
      setManualEntryError(null);
      console.log('✅ Manual entry mode activated successfully');
    } catch (error) {
      console.error('❌ Error initializing manual entry:', error);
      setManualEntryError('Failed to initialize manual entry form');
    }
  };

  const addPassenger = () => {
    console.log('➕ Adding new passenger');
    const currentPassengers = passengers();
    setPassengers([...currentPassengers, {
      type: 'adult',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      passportNumber: '',
      email: '',
      phone: '',
      isValid: false
    }]);
  };

  const removePassenger = (indexToRemove) => {
    console.log('🗑️ Removing passenger at index:', indexToRemove);
    const currentPassengers = passengers();
    if (currentPassengers.length > 1) { // Prevent removing the last passenger
      setPassengers(currentPassengers.filter((_, index) => index !== indexToRemove));
    }
  };

  return (
    <div class={styles.customerDetailsPage}>
      <div class={styles.container}>
        <Show 
          when={location.state?.itinerary}
          fallback={
            <div class={styles.error}>
              <h2>No Itinerary Data</h2>
              <p>Please select an itinerary first.</p>
              <button 
                class={styles.backButton}
                onClick={() => navigate('/prompt')}
              >
                Back to Search
              </button>
            </div>
          }
        >
          <div class={styles.headerSection}>
            <button
              type="button"
              class={styles.backButton}
              onClick={() => navigate(-1)}
            >
              <TbArrowLeft />
              Back to Selected Itinerary
            </button>
            <h1>Complete Your Booking</h1>
          </div>
          
          <div class={styles.content}>
            {/* Left Panel - Passenger Details */}
            <div class={styles.passengerDetailsSection}>
              <div class={styles.crmOptions}>
                <h2>Add Passenger Details</h2>
                <div class={styles.crmButtons}>
                  <button 
                    class={styles.hubspotButton}
                    onClick={handleConnectHubspot}
                  >
                    <TbPlus />
                    Connect Hubspot CRM
                  </button>
                  <button 
                    class={styles.crmButton}
                    onClick={handleCrmSearch}
                  >
                    <TbSearch />
                    Search in CRM
                  </button>
                  <button 
                    class={`${styles.manualButton} ${showManualInput() ? styles.active : ''}`}
                    onClick={handleManualEntry}
                  >
                    <TbUserPlus />
                    {showManualInput() ? 'Hide Manual Entry' : 'Enter Manually'}
                  </button>
                </div>
                <Show when={showCrmMessage()}>
                  <div class={styles.crmMessage}>
                    <TbAlertCircle />
                    CRM integration is not available in this demo
                  </div>
                </Show>
              </div>

              <Show when={showManualInput()}>
                <form onSubmit={handleSubmit} class={styles.passengerForm}>
                  <For each={passengers()}>
                    {(passenger, index) => (
                      <div class={styles.passengerCard}>
                        <div class={styles.passengerHeader}>
                          <div class={styles.passengerHeaderLeft}>
                            <TbUsers />
                            <h2>Passenger {index() + 1}</h2>
                          </div>
                          <div class={styles.passengerHeaderRight}>
                            <span class={passenger.isValid ? styles.valid : styles.invalid}>
                              {passenger.isValid ? 'Complete' : 'Incomplete'}
                            </span>
                            <Show when={index() > 0}>
                              <button 
                                type="button"
                                class={styles.removePassengerButton}
                                onClick={() => removePassenger(index())}
                              >
                                <TbTrash />
                              </button>
                            </Show>
                          </div>
                        </div>

                        <div class={styles.formGrid}>
                          <div class={styles.formGroup}>
                            <label>
                              <TbUser />
                              First Name
                            </label>
                            <input
                              type="text"
                              value={passenger.firstName}
                              onChange={(e) => updatePassenger(index(), 'firstName', e.currentTarget.value)}
                              required
                            />
                          </div>

                          <div class={styles.formGroup}>
                            <label>
                              <TbUser />
                              Last Name
                            </label>
                            <input
                              type="text"
                              value={passenger.lastName}
                              onChange={(e) => updatePassenger(index(), 'lastName', e.currentTarget.value)}
                              required
                            />
                          </div>

                          <div class={styles.formGroup}>
                            <label>
                              <TbCalendar />
                              Date of Birth
                            </label>
                            <input
                              type="date"
                              value={passenger.dateOfBirth}
                              onChange={(e) => updatePassenger(index(), 'dateOfBirth', e.currentTarget.value)}
                              required
                            />
                          </div>

                          <div class={styles.formGroup}>
                            <label>
                              <TbId />
                              Passport Number
                            </label>
                            <input
                              type="text"
                              value={passenger.passportNumber}
                              onChange={(e) => updatePassenger(index(), 'passportNumber', e.currentTarget.value)}
                              required
                            />
                          </div>

                          <div class={styles.formGroup}>
                            <label>
                              <TbMail />
                              Email
                            </label>
                            <input
                              type="email"
                              value={passenger.email}
                              onChange={(e) => updatePassenger(index(), 'email', e.currentTarget.value)}
                              required
                            />
                          </div>

                          <div class={styles.formGroup}>
                            <label>
                              <TbPhone />
                              Phone
                            </label>
                            <input
                              type="tel"
                              value={passenger.phone}
                              onChange={(e) => updatePassenger(index(), 'phone', e.currentTarget.value)}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </For>

                  {/* Only show Add Passenger button when manual input is active */}
                  <Show when={showManualInput()}>
                    <div class={styles.passengerActions}>
                      <button
                        type="button"
                        class={styles.addPassengerButton}
                        onClick={addPassenger}
                      >
                        <TbUserPlus />
                        Add Another Passenger
                      </button>
                    </div>
                  </Show>

                  <div class={styles.formActions}>
                    <button
                      type="submit"
                      class={styles.submitButton}
                      disabled={!isFormValid()}
                    >
                      <TbCheck />
                      Continue to Review
                    </button>
                  </div>
                </form>
              </Show>
            </div>

            {/* Right Panel - Trip Summary and Cart */}
            <div class={styles.summarySection}>
              <div class={styles.tripSummary}>
                <h2>Trip Summary</h2>
                <div class={styles.tripDetails}>
                  <div class={styles.route}>
                    <span>{location.state?.origin}</span>
                    <span>→</span>
                    <span>{location.state?.destination}</span>
                  </div>
                  <div class={styles.dates}>
                    {location.state?.travelDates}
                  </div>
                  <div class={styles.amount}>
                    Total: ${location.state?.totalAmount?.toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div class={styles.cartItems}>
                <h3>Itemized Breakdown</h3>
                <For each={cartItems()}>
                  {item => (
                    <div class={styles.cartItem}>
                      <div class={styles.itemIcon}>
                        <item.icon />
                      </div>
                      <div class={styles.itemDetails}>
                        <h3>{item.name}</h3>
                        <p>{item.description}</p>
                      </div>
                      <div class={styles.itemPrice}>
                        ${item.price.toLocaleString()}
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </div>
        </Show>
      </div>
      <Show when={manualEntryError()}>
        <div class={styles.manualEntryError}>
          <TbAlertCircle />
          {manualEntryError()}
        </div>
      </Show>
    </div>
  );
}

export default CustomerDetails; 