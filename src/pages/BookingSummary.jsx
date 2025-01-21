import { createSignal, createEffect, Show, For } from "solid-js";
import { useNavigate, useLocation } from "@solidjs/router";
import { 
  TbPlane, 
  TbHome, 
  TbCar, 
  TbMap,
  TbEdit,
  TbRefresh,
  TbCheck,
  TbCreditCard,
  TbArrowLeft,
  TbAlertCircle,
  TbClock,
  TbWifi,
  TbTrain,
  TbBus,
  TbTrash,
  TbChevronUp,
  TbChevronDown,
  TbUser,
  TbChevronUp as TbChevronUpIcon,
  TbChevronDown as TbChevronDownIcon
} from 'solid-icons/tb';
import styles from "./BookingSummary.module.css";
import { calculateQuoteCommission } from "../state/commissionsState";

function BookingSummary() {
  console.log('BookingSummary component rendering');
  const location = useLocation();
  const navigate = useNavigate();
  
  console.log('BookingSummary location state:', location.state);

  const [selectedFlight, setSelectedFlight] = createSignal(null);
  const [showFlightOptions, setShowFlightOptions] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);
  const [totalPrice, setTotalPrice] = createSignal(0);
  const [bookingItems, setBookingItems] = createSignal([]);
  const [lastUpdateTime, setLastUpdateTime] = createSignal(new Date());
  const [showHotelOptions, setShowHotelOptions] = createSignal(false);
  const [showTransferOptions, setShowTransferOptions] = createSignal(false);
  const [showActivityOptions, setShowActivityOptions] = createSignal(false);
  const [selectedDayIndex, setSelectedDayIndex] = createSignal(null);
  const [selectedTransferId, setSelectedTransferId] = createSignal(null);
  const [inventoryError, setInventoryError] = createSignal({
    type: 'transfer',
    transferId: 'arrival',
    message: 'Cannot pull in live inventory'
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = createSignal(false);
  const [itemToDelete, setItemToDelete] = createSignal(null);
  const [showFlightDetails, setShowFlightDetails] = createSignal(false);
  const [commission, setCommission] = createSignal(0);

  // Mock flight options
  const flightOptions = [
    {
      id: 1,
      airline: "Singapore Airlines",
      departure: "10:30 AM",
      arrival: "2:45 PM",
      price: 1200,
      seats: 4,
      class: "Economy",
      duration: "4h 15m",
      stops: 0
    },
    {
      id: 2,
      airline: "Emirates",
      departure: "1:15 PM",
      arrival: "5:30 PM",
      price: 1350,
      seats: 2,
      class: "Economy",
      duration: "4h 15m",
      stops: 0
    },
    // Add more flight options
  ];

  // Add mock data
  const hotelOptions = [
    {
      id: 1,
      name: "Grand Resort & Spa",
      rating: 5,
      price: 2200,
      roomType: "Deluxe Ocean View",
      amenities: ["Pool", "Spa", "Restaurant", "Beach Access"],
      available: 3
    },
    {
      id: 2,
      name: "Luxury Beach Hotel",
      rating: 4,
      price: 1800,
      roomType: "Premium Suite",
      amenities: ["Pool", "Gym", "Restaurant"],
      available: 5
    }
  ];

  const transferOptions = [
    {
      id: 1,
      type: "Private Luxury Sedan",
      price: 120,
      capacity: "3 passengers",
      features: ["Meet & Greet", "Flight Tracking", "Free Waiting Time"]
    },
    {
      id: 2,
      type: "Premium SUV",
      price: 180,
      capacity: "6 passengers",
      features: ["Meet & Greet", "Flight Tracking", "Free Waiting Time", "Extra Luggage Space"]
    }
  ];

  const activityOptions = [
    {
      id: 1,
      name: "City Discovery Tour",
      duration: "4 hours",
      price: 89,
      highlights: ["Historical Sites", "Local Markets", "Cultural Demo"],
      available: 8
    },
    {
      id: 2,
      name: "Adventure Package",
      duration: "Full Day",
      price: 149,
      highlights: ["Hiking", "Water Sports", "Lunch Included"],
      available: 12
    }
  ];

  createEffect(() => {
    if (location.state?.itinerary) {
      generateBookingItems(location.state.itinerary);
    } else {
      navigate('/prompt');
    }
  });

  const generateBookingItems = (itinerary) => {
    const items = [
      {
        type: 'flight',
        icon: TbPlane,
        title: 'Flights',
        details: {
          outbound: {
            from: itinerary.origin,
            to: itinerary.destination,
            departure: "10:30 AM",
            arrival: "2:45 PM",
            date: itinerary.travelDates.split(' - ')[0],
            airline: "Singapore Airlines",
            class: "Economy",
            duration: "4h 15m"
          },
          return: {
            from: itinerary.destination,
            to: itinerary.origin,
            departure: "3:30 PM",
            arrival: "7:45 PM",
            date: itinerary.travelDates.split(' - ')[1],
            airline: "Singapore Airlines",
            class: "Economy",
            duration: "4h 15m"
          }
        },
        price: Math.round(itinerary.estimatedCost * 0.3),
        editable: true
      },
      {
        type: 'hotel',
        icon: TbHome,
        title: 'Hotel',
        details: {
          name: "Grand Resort & Spa",
          checkIn: itinerary.travelDates.split(' - ')[0],
          checkOut: itinerary.travelDates.split(' - ')[1],
          roomType: "Deluxe Room",
          guests: location.state?.passengers?.length || 1
        },
        price: Math.round(itinerary.estimatedCost * 0.4),
        editable: true
      },
    ];

    // Generate separate transfer items
    const transfers = [
      {
        type: 'transfer',
        icon: TbCar,
        title: 'Airport Arrival Transfer',
        details: {
          type: "Private Car",
          date: itinerary.travelDates.split(' - ')[0],
          route: "Airport to Hotel",
          vehicle: "Luxury Sedan",
          transferType: 'arrival'
        },
        price: Math.round(itinerary.estimatedCost * 0.05),
        editable: true,
        transferId: 'arrival'
      },
      {
        type: 'transfer',
        icon: TbCar,
        title: 'Airport Departure Transfer',
        details: {
          type: "Private Car",
          date: itinerary.travelDates.split(' - ')[1],
          route: "Hotel to Airport",
          vehicle: "Luxury Sedan",
          transferType: 'departure'
        },
        price: Math.round(itinerary.estimatedCost * 0.05),
        editable: true,
        transferId: 'departure'
      }
    ];

    // Add any additional transfers from the itinerary
    if (itinerary.additionalTransfers) {
      itinerary.additionalTransfers.forEach((transfer, index) => {
        transfers.push({
          type: 'transfer',
          icon: getTransferIcon(transfer.mode),
          title: `Day ${transfer.day} Transfer`,
          details: {
            type: transfer.mode,
            date: transfer.date,
            route: transfer.route,
            vehicle: transfer.vehicle,
            transferType: 'additional'
          },
          price: Math.round(itinerary.estimatedCost * 0.03),
          editable: true,
          transferId: `additional-${index}`
        });
      });
    }

    items.push(...transfers);

    // Add individual activities as separate items
    itinerary.dailyPlan.forEach((day, index) => {
      items.push({
        type: 'activity',
        icon: TbMap,
        title: `Day ${index + 1} Activity`,
        details: {
          name: day.replace(/Day \d+:/, '').trim(),
          duration: "Full Day",
          description: day.replace(/Day \d+:/, '').trim()
        },
        price: Math.round((itinerary.estimatedCost * 0.2) / itinerary.dailyPlan.length),
        editable: true,
        dayIndex: index
      });
    });

    setBookingItems(items);
    calculateTotal(items);
  };

  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => sum + item.price, 0);
    setTotalPrice(total);
  };

  const handleChangeFlight = () => {
    setIsLoading(true);
    setShowFlightOptions(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  const handleSelectFlight = (flight) => {
    setSelectedFlight(flight);
    const updatedItems = bookingItems().map(item => {
      if (item.type === 'flight') {
        return {
          ...item,
          details: {
            ...item.details,
            outbound: {
              ...item.details.outbound,
              departure: flight.departure,
              arrival: flight.arrival,
              airline: flight.airline,
              duration: flight.duration
            },
            return: {
              ...item.details.return,
              departure: flight.departure,
              arrival: flight.arrival,
              airline: flight.airline,
              duration: flight.duration
            },
            price: flight.price
          }
        };
      }
      return item;
    });
    setBookingItems(updatedItems);
    calculateTotal(updatedItems);
    setShowFlightOptions(false);
  };

  const handleProceedToPayment = () => {
    // Transform booking items to remove icon components
    const sanitizedItems = bookingItems().map(item => {
      if (item.type === 'flight') {
        return {
          ...item,
          icon: undefined,
          type: 'flight',
          details: {
            outbound: {
              airline: item.details.outbound.airline,
              from: item.details.outbound.from || item.details.outbound.departure,
              to: item.details.outbound.to || item.details.outbound.arrival,
              departure: item.details.outbound.departure,
              arrival: item.details.outbound.arrival,
              class: item.details.outbound.class,
              duration: item.details.outbound.duration,
              time: `${item.details.outbound.departure} - ${item.details.outbound.arrival}`
            },
            return: item.details.return ? {
              airline: item.details.return.airline,
              from: item.details.return.from || item.details.return.departure,
              to: item.details.return.to || item.details.return.arrival,
              departure: item.details.return.departure,
              arrival: item.details.return.arrival,
              class: item.details.return.class,
              duration: item.details.return.duration,
              time: `${item.details.return.departure} - ${item.details.return.arrival}`
            } : null
          }
        };
      }
      // For other items
      return {
        ...item,
        icon: undefined,
        type: item.type
      };
    });

    if (location.state?.isEditing) {
      // Update existing quote
      const savedQuotes = JSON.parse(localStorage.getItem('recentQuotes') || '[]');
      const updatedQuotes = savedQuotes.map(quote => {
        if (quote.id === location.state.originalQuoteId) {
          return {
            ...quote,
            cartItems: sanitizedItems,
            amount: totalPrice(),
            status: 'Updated',
            lastUpdated: new Date().toISOString()
          };
        }
        return quote;
      });
      localStorage.setItem('recentQuotes', JSON.stringify(updatedQuotes));
      navigate(`/quote/${location.state.originalQuoteId}`);
    } else {
      // Proceed with normal payment flow
      navigate('/payment', {
        state: {
          ...location.state,
          cartItems: sanitizedItems,
          totalAmount: totalPrice(),
          origin: location.state?.itinerary.origin,
          destination: location.state?.itinerary.destination,
          travelDates: location.state?.itinerary.travelDates
        }
      });
    }
  };

  // Helper function to generate description
  const getItemDescription = (item) => {
    switch (item.type) {
      case 'flight':
        return `${item.details.outbound.airline} - ${item.details.outbound.class}`;
      case 'hotel':
        return `${item.details.roomType} - ${item.details.guests} Guest(s)`;
      case 'transfer':
        return `${item.details.type} - ${item.details.vehicle}`;
      case 'activity':
        return item.details.name;
      default:
        return '';
    }
  };

  const handleEditItem = (type, transferId) => {
    setIsLoading(true);
    console.log(`🔄 Change button clicked for ${type}${transferId ? ` (${transferId})` : ''}`);
    
    switch(type) {
      case 'flight':
        console.log('✈️ Opening flight options modal');
        setShowFlightOptions(true);
        break;
      case 'hotel':
        console.log('🏨 Opening hotel options modal');
        setShowHotelOptions(true);
        break;
      case 'transfer':
        console.log(`🚗 Opening transfer options modal for ${transferId}`);
        setSelectedTransferId(transferId);
        setShowTransferOptions(true);
        break;
      case 'activity':
        console.log(`🎯 Opening activities options modal for day ${selectedDayIndex() + 1}`);
        setSelectedDayIndex(selectedDayIndex());
        setShowActivityOptions(true);
        break;
    }

    // Simulate API call
    console.log('⏳ Fetching latest options from system...');
    setTimeout(() => {
      setIsLoading(false);
      console.log('✅ Options loaded successfully');
    }, 1500);
  };

  const handleSelectHotel = (hotel) => {
    console.log('🏨 Selected hotel:', hotel);
    const updatedItems = bookingItems().map(item => {
      if (item.type === 'hotel') {
        return {
          ...item,
          details: {
            ...item.details,
            name: hotel.name,
            roomType: hotel.roomType,
            amenities: hotel.amenities
          },
          price: hotel.price
        };
      }
      return item;
    });
    setBookingItems(updatedItems);
    calculateTotal(updatedItems);
    setShowHotelOptions(false);
  };

  const handleSelectTransfer = (transfer, transferId) => {
    console.log(`🚗 Selected transfer for ${transferId}:`, transfer);
    const updatedItems = bookingItems().map(item => {
      if (item.type === 'transfer' && item.transferId === transferId) {
        return {
          ...item,
          details: {
            ...item.details,
            type: transfer.type,
            vehicle: transfer.type,
            capacity: transfer.capacity,
            features: transfer.features
          },
          price: transfer.price
        };
      }
      return item;
    });
    setBookingItems(updatedItems);
    calculateTotal(updatedItems);
    setShowTransferOptions(false);
  };

  const handleSelectActivity = (activity, dayIndex) => {
    console.log(`🎯 Selected activity for day ${dayIndex + 1}:`, activity);
    const updatedItems = bookingItems().map(item => {
      if (item.type === 'activity' && item.dayIndex === dayIndex) {
        return {
          ...item,
          details: {
            name: activity.name,
            duration: activity.duration,
            description: activity.highlights.join(", ")
          },
          price: activity.price
        };
      }
      return item;
    });
    setBookingItems(updatedItems);
    calculateTotal(updatedItems);
    setShowActivityOptions(false);
  };

  // Helper function to get the appropriate icon
  const getTransferIcon = (mode) => {
    switch (mode.toLowerCase()) {
      case 'train':
        return TbTrain;
      case 'coach':
        return TbBus;
      case 'car':
      default:
        return TbCar;
    }
  };

  const handleDelete = (item) => {
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    console.log('🗑️ Deleting item:', itemToDelete());
    const updatedItems = bookingItems().filter(item => {
      if (item.type === itemToDelete().type) {
        if (item.type === 'activity') {
          return item.dayIndex !== itemToDelete().dayIndex;
        }
        if (item.type === 'transfer') {
          return item.transferId !== itemToDelete().transferId;
        }
        return false;
      }
      return true;
    });
    
    setBookingItems(updatedItems);
    calculateTotal(updatedItems);
    setShowDeleteConfirm(false);
  };

  createEffect(() => {
    const items = bookingItems();
    if (items.length > 0) {
      const totalCommission = calculateQuoteCommission(items);
      setCommission(totalCommission);
    }
  });

  return (
    <div class={styles.bookingSummaryPage}>
      <div class={styles.container}>
        <div class={styles.header}>
          <h1>Review Your Booking</h1>
          <div class={styles.tripSummary}>
            <div class={styles.destination}>
              <span>{location.state?.itinerary.origin}</span>
              <span class={styles.arrow}>→</span>
              <span>{location.state?.itinerary.destination}</span>
            </div>
            <div class={styles.dates}>{location.state?.itinerary.travelDates}</div>
            <div class={styles.passengers}>
              {location.state?.passengers?.length || 1} Passenger(s)
            </div>
          </div>
        </div>

        <div class={styles.bookingItems}>
          <For each={bookingItems()}>
            {(item) => (
              <div 
                class={styles.bookingCard} 
                data-type={item.type}
              >
                <div class={styles.cardHeader}>
                  <div class={styles.cardTitle}>
                    <item.icon />
                    <h2>{item.title}</h2>
                  </div>
                  <div class={styles.cardActions}>
                    <Show 
                      when={inventoryError().type === item.type && 
                            inventoryError().transferId === item.transferId}
                      fallback={
                        <div class={styles.liveIndicator}>
                          <TbWifi class={styles.liveIcon} />
                          <span>Live</span>
                        </div>
                      }
                    >
                      <div class={styles.errorIndicator}>
                        <TbAlertCircle class={styles.errorIcon} />
                        <span>Offline</span>
                        <div class={styles.errorTooltip}>
                          {inventoryError().message}
                          <button 
                            class={styles.retryButton}
                            onClick={() => handleEditItem(item.type, item.transferId)}
                          >
                            Change option
                          </button>
                        </div>
                      </div>
                    </Show>
                    <div class={styles.actionButtons}>
                      <button
                        class={`${styles.editButton} ${inventoryError().type === item.type ? styles.warning : ''}`}
                        onClick={() => handleEditItem(item.type, item.transferId)}
                      >
                        <TbEdit />
                        Change
                      </button>
                      <button
                        class={styles.deleteButton}
                        onClick={() => handleDelete(item)}
                      >
                        <TbTrash />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                <div class={styles.cardContent}>
                  <Show when={item.type === 'flight'}>
                    <div class={styles.flightDetails}>
                      {/* Outbound Flight */}
                      <div class={styles.flightSection}>
                        <div class={styles.flightLabel}>Outbound Flight • {item.details.outbound.date}</div>
                        <div class={styles.route}>
                          <div class={styles.departure}>
                            <h3>{item.details.outbound.from}</h3>
                            <p>{item.details.outbound.departure}</p>
                          </div>
                          <div class={styles.duration}>
                            <div class={styles.line} />
                            <span class={styles.time}>{item.details.outbound.duration}</span>
                          </div>
                          <div class={styles.arrival}>
                            <h3>{item.details.outbound.to}</h3>
                            <p>{item.details.outbound.arrival}</p>
                          </div>
                        </div>
                        
                        <div class={styles.flightInfo}>
                          <div class={styles.flightBadge}>
                            <TbPlane />
                            {item.details.outbound.airline}
                          </div>
                          <div class={styles.flightBadge}>
                            <TbUser />
                            {item.details.outbound.class}
                          </div>
                        </div>
                      </div>

                      {/* Return Flight */}
                      <div class={styles.flightSection}>
                        <div class={styles.flightLabel}>Return Flight • {item.details.return.date}</div>
                        <div class={styles.route}>
                          <div class={styles.departure}>
                            <h3>{item.details.return.from}</h3>
                            <p>{item.details.return.departure}</p>
                          </div>
                          <div class={styles.duration}>
                            <div class={styles.line} />
                            <span class={styles.time}>{item.details.return.duration}</span>
                          </div>
                          <div class={styles.arrival}>
                            <h3>{item.details.return.to}</h3>
                            <p>{item.details.return.arrival}</p>
                          </div>
                        </div>
                        
                        <div class={styles.flightInfo}>
                          <div class={styles.flightBadge}>
                            <TbPlane />
                            {item.details.return.airline}
                          </div>
                          <div class={styles.flightBadge}>
                            <TbUser />
                            {item.details.return.class}
                          </div>
                        </div>
                      </div>

                      <button 
                        class={styles.viewMoreButton}
                        onClick={() => setShowFlightDetails(!showFlightDetails())}
                      >
                        {showFlightDetails() ? <TbChevronUpIcon /> : <TbChevronDownIcon />}
                        {showFlightDetails() ? 'Show Less' : 'View More Details'}
                      </button>

                      <Show when={showFlightDetails()}>
                        <div class={styles.expandedDetails}>
                          <Show when={item.details.outbound.connection}>
                            <div class={styles.connectionInfo}>
                              <TbClock />
                              {item.details.outbound.connection.duration} layover in {item.details.outbound.connection.airport}
                            </div>
                          </Show>
                          
                          <div class={styles.detailsGrid}>
                            <div class={styles.detailItem}>
                              <h4><TbPlane /> Aircraft</h4>
                              <p>Boeing 787 Dreamliner</p>
                            </div>
                            <div class={styles.detailItem}>
                              <h4><TbUser /> Seat</h4>
                              <p>Economy Plus (Extra Legroom)</p>
                            </div>
                            <div class={styles.detailItem}>
                              <h4><TbMap /> Baggage</h4>
                              <p>2 x 23kg Checked</p>
                            </div>
                            <div class={styles.detailItem}>
                              <h4><TbCheck /> Miles</h4>
                              <p>Earn 2,450 Points</p>
                            </div>
                          </div>
                        </div>
                      </Show>
                    </div>
                  </Show>

                  <Show when={item.type === 'hotel'}>
                    <div class={styles.hotelDetails}>
                      <h3>{item.details.name}</h3>
                      <p>{item.details.roomType}</p>
                      <p>{item.details.checkIn} - {item.details.checkOut}</p>
                      <p>{item.details.guests} Guest(s)</p>
                    </div>
                  </Show>

                  <Show when={item.type === 'transfer'}>
                    <div class={styles.transferDetails}>
                      <p>{item.details.type}</p>
                      <p>{item.details.pickup}</p>
                      <p>{item.details.return}</p>
                      <p>{item.details.vehicle}</p>
                    </div>
                  </Show>

                  <Show when={item.type === 'activity'}>
                    <div class={styles.activityDetails}>
                      <h3>Day {item.dayIndex + 1}</h3>
                      <p class={styles.activityName}>{item.details.name}</p>
                      <p class={styles.activityDuration}>{item.details.duration}</p>
                      <p class={styles.activityDescription}>{item.details.description}</p>
                    </div>
                  </Show>
                </div>

                <div class={styles.price} data-type={item.type.charAt(0).toUpperCase() + item.type.slice(1)}>
                  ${item.price.toLocaleString()}
                </div>
              </div>
            )}
          </For>
        </div>

        <Show when={showFlightOptions()}>
          <div 
            class={styles.flightOptionsModal}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowFlightOptions(false);
              }
            }}
          >
            <div class={styles.modalContent}>
              <div class={styles.modalHeader}>
                <h2>Available Flights</h2>
                <div class={styles.modalControls}>
                  <div class={styles.liveIndicator}>
                    <TbWifi class={styles.liveIcon} />
                    <span>Live from System</span>
                    <div class={styles.lastUpdate}>
                      <TbClock />
                      Last updated: {lastUpdateTime().toLocaleTimeString()}
                    </div>
                  </div>
                  <button 
                    class={styles.closeButton}
                    onClick={() => setShowFlightOptions(false)}
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <Show when={isLoading()} fallback={
                <>
                  <div class={styles.flightSystemInfo}>
                    <p>Showing real-time availability and pricing from our booking system</p>
                    <div class={styles.flightStats}>
                      <span>{flightOptions.length} flights found</span>
                      <span>•</span>
                      <span>{Math.floor(Math.random() * 50 + 20)} people viewing</span>
                    </div>
                  </div>
                  <div class={styles.flightList}>
                    <For each={flightOptions}>
                      {(flight) => (
                        <div 
                          class={styles.flightOption}
                          onClick={() => handleSelectFlight(flight)}
                        >
                          <div class={styles.flightOptionDetails}>
                            <h3>{flight.airline}</h3>
                            <div class={styles.flightTimes}>
                              <span>{flight.departure} - {flight.arrival}</span>
                              <span class={styles.duration}>{flight.duration}</span>
                            </div>
                            <div class={styles.flightInfo}>
                              <span>{flight.stops === 0 ? 'Direct' : `${flight.stops} Stop(s)`}</span>
                              <span>{flight.seats} seats left</span>
                            </div>
                          </div>
                          <div class={styles.flightOptionPrice}>
                            ${flight.price.toLocaleString()}
                          </div>
                        </div>
                      )}
                    </For>
                  </div>
                </>
              }>
                <div class={styles.loading}>
                  <TbRefresh class={styles.spinner} />
                  <p>Fetching latest flight options from system...</p>
                  <span class={styles.loadingDetail}>Checking real-time availability and prices</span>
                </div>
              </Show>
            </div>
          </div>
        </Show>

        {/* Hotel Options Modal */}
        <Show when={showHotelOptions()}>
          <div 
            class={styles.optionsModal}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowHotelOptions(false);
              }
            }}
          >
            <div class={styles.modalContent}>
              <div class={styles.modalHeader}>
                <h2>Available Hotels</h2>
                <div class={styles.modalControls}>
                  <div class={styles.liveIndicator}>
                    <TbWifi class={styles.liveIcon} />
                    <span>Live from System</span>
                    <div class={styles.lastUpdate}>
                      <TbClock />
                      Last updated: {lastUpdateTime().toLocaleTimeString()}
                    </div>
                  </div>
                  <button 
                    class={styles.closeButton}
                    onClick={() => setShowHotelOptions(false)}
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <Show when={isLoading()} fallback={
                <div class={styles.optionsList}>
                  <For each={hotelOptions}>
                    {(hotel) => (
                      <div 
                        class={styles.optionCard}
                        onClick={() => handleSelectHotel(hotel)}
                      >
                        <div class={styles.optionHeader}>
                          <h3>{hotel.name}</h3>
                          <div class={styles.rating}>
                            {"★".repeat(hotel.rating)}
                          </div>
                        </div>
                        <div class={styles.optionDetails}>
                          <p class={styles.roomType}>{hotel.roomType}</p>
                          <div class={styles.amenities}>
                            {hotel.amenities.join(" • ")}
                          </div>
                          <div class={styles.availability}>
                            {hotel.available} rooms available
                          </div>
                        </div>
                        <div class={styles.optionPrice}>
                          ${hotel.price.toLocaleString()}
                          <span>/night</span>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              }>
                <div class={styles.loading}>
                  <TbRefresh class={styles.spinner} />
                  <p>Fetching available hotels...</p>
                  <span class={styles.loadingDetail}>Checking real-time availability and rates</span>
                </div>
              </Show>
            </div>
          </div>
        </Show>

        {/* Transfer Options Modal */}
        <Show when={showTransferOptions()}>
          <div 
            class={styles.optionsModal}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowTransferOptions(false);
              }
            }}
          >
            <div class={styles.modalContent}>
              <div class={styles.modalHeader}>
                <h2>
                  Available Transfers for{' '}
                  {selectedTransferId()?.includes('additional') ? 'Day Trip' :
                   selectedTransferId() === 'arrival' ? 'Airport Arrival' : 'Airport Departure'}
                </h2>
                <div class={styles.modalControls}>
                  <div class={styles.liveIndicator}>
                    <TbWifi class={styles.liveIcon} />
                    <span>Live from System</span>
                    <div class={styles.lastUpdate}>
                      <TbClock />
                      Last updated: {lastUpdateTime().toLocaleTimeString()}
                    </div>
                  </div>
                  <button 
                    class={styles.closeButton}
                    onClick={() => setShowTransferOptions(false)}
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <Show when={isLoading()} fallback={
                <div class={styles.optionsList}>
                  <For each={transferOptions}>
                    {(transfer) => (
                      <div 
                        class={styles.optionCard}
                        onClick={() => handleSelectTransfer(transfer, selectedTransferId())}
                      >
                        <div class={styles.transferOption}>
                          <div class={styles.transferIcon}>
                            <TbCar />
                          </div>
                          <div>
                            <h3>{transfer.type}</h3>
                            <p>{transfer.capacity}</p>
                            <div class={styles.transferFeatures}>
                              {transfer.features.map(feature => (
                                <span class={styles.transferFeature}>{feature}</span>
                              ))}
                            </div>
                          </div>
                          <div class={styles.optionPrice}>
                            ${transfer.price.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              }>
                <div class={styles.loading}>
                  <TbRefresh class={styles.spinner} />
                  <p>Fetching available transfers...</p>
                  <span class={styles.loadingDetail}>Checking real-time availability</span>
                </div>
              </Show>
            </div>
          </div>
        </Show>

        {/* Activities Options Modal */}
        <Show when={showActivityOptions()}>
          <div 
            class={styles.optionsModal}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowActivityOptions(false);
              }
            }}
          >
            <div class={styles.modalContent}>
              <div class={styles.modalHeader}>
                <h2>Available Activities for Day {selectedDayIndex() + 1}</h2>
                <div class={styles.modalControls}>
                  <div class={styles.liveIndicator}>
                    <TbWifi class={styles.liveIcon} />
                    <span>Live from System</span>
                    <div class={styles.lastUpdate}>
                      <TbClock />
                      Last updated: {lastUpdateTime().toLocaleTimeString()}
                    </div>
                  </div>
                  <button 
                    class={styles.closeButton}
                    onClick={() => setShowActivityOptions(false)}
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <Show when={isLoading()} fallback={
                <div class={styles.optionsList}>
                  <For each={activityOptions}>
                    {(activity) => (
                      <div 
                        class={styles.optionCard}
                        onClick={() => handleSelectActivity(activity, selectedDayIndex())}
                      >
                        <div class={styles.optionHeader}>
                          <h3>{activity.name}</h3>
                          <span class={styles.activityDuration}>{activity.duration}</span>
                        </div>
                        <div class={styles.activityHighlights}>
                          {activity.highlights.map(highlight => (
                            <span class={styles.highlight}>{highlight}</span>
                          ))}
                        </div>
                        <div class={styles.availability}>
                          {activity.available} spots remaining
                        </div>
                        <div class={styles.optionPrice}>
                          ${activity.price.toLocaleString()}
                          <span>/person</span>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              }>
                <div class={styles.loading}>
                  <TbRefresh class={styles.spinner} />
                  <p>Fetching available activities...</p>
                  <span class={styles.loadingDetail}>Checking real-time availability</span>
                </div>
              </Show>
            </div>
          </div>
        </Show>

        <Show when={showDeleteConfirm()}>
          <div 
            class={styles.confirmModal}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowDeleteConfirm(false);
              }
            }}
          >
            <div class={styles.confirmContent}>
              <h3>Confirm Deletion</h3>
              <p>Are you sure you want to remove this {itemToDelete()?.type}?</p>
              <div class={styles.confirmActions}>
                <button
                  class={styles.cancelButton}
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  class={styles.confirmButton}
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </Show>

        <div class={styles.summary}>
          <div class={styles.totalPrice}>
            <span>Total Price</span>
            <span>${totalPrice().toLocaleString()}</span>
          </div>
          <div class={styles.commission}>
            <span>Potential Commission</span>
            <span>${commission().toLocaleString()}</span>
          </div>
          <div class={styles.actions}>
            <button 
              class={styles.backButton}
              onClick={() => navigate(-1)}
            >
              <TbArrowLeft />
              Back
            </button>
            <button 
              class={styles.paymentButton}
              onClick={handleProceedToPayment}
            >
              <TbCreditCard />
              {location.state?.isEditing ? 'Update Quote' : 'Proceed to Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingSummary; 