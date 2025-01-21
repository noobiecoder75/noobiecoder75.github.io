import { createSignal, createEffect } from "solid-js";

// Default commission rate (15%)
const DEFAULT_COMMISSION_RATE = 0.15;

// Create signals for tracking commissions
export const [commissionRate, setCommissionRate] = createSignal(DEFAULT_COMMISSION_RATE);
export const [potentialRevenue, setPotentialRevenue] = createSignal(0);
export const [realizedRevenue, setRealizedRevenue] = createSignal(0);
export const [commissionsByType, setCommissionsByType] = createSignal({
  flights: { potential: 0, realized: 0 },
  hotels: { potential: 0, realized: 0 },
  transfers: { potential: 0, realized: 0 },
  activities: { potential: 0, realized: 0 }
});

// Load saved commission data from localStorage
export const loadCommissionData = () => {
  const savedData = JSON.parse(localStorage.getItem('commissionData') || '{}');
  if (savedData.commissionRate) setCommissionRate(savedData.commissionRate);
  if (savedData.potentialRevenue) setPotentialRevenue(savedData.potentialRevenue);
  if (savedData.realizedRevenue) setRealizedRevenue(savedData.realizedRevenue);
  if (savedData.commissionsByType) setCommissionsByType(savedData.commissionsByType);
};

// Save commission data to localStorage
export const saveCommissionData = () => {
  const data = {
    commissionRate: commissionRate(),
    potentialRevenue: potentialRevenue(),
    realizedRevenue: realizedRevenue(),
    commissionsByType: commissionsByType()
  };
  localStorage.setItem('commissionData', JSON.stringify(data));
};

// Calculate commission for a single item
export const calculateItemCommission = (item) => {
  return item.price * commissionRate();
};

// Calculate total commission for a quote
export const calculateQuoteCommission = (items) => {
  return items.reduce((total, item) => total + calculateItemCommission(item), 0);
};

// Update potential revenue when a quote is created/updated
export const updatePotentialRevenue = (quoteItems) => {
  const commission = calculateQuoteCommission(quoteItems);
  const byType = quoteItems.reduce((acc, item) => {
    const itemCommission = calculateItemCommission(item);
    acc[item.type] = (acc[item.type] || 0) + itemCommission;
    return acc;
  }, {});

  // Update commissions by type
  setCommissionsByType(prev => ({
    ...prev,
    ...Object.keys(byType).reduce((acc, type) => ({
      ...acc,
      [type]: {
        ...prev[type],
        potential: (prev[type]?.potential || 0) + byType[type]
      }
    }), {})
  }));

  setPotentialRevenue(prev => prev + commission);
  saveCommissionData();
};

// Convert potential to realized revenue when a booking is confirmed
export const convertToRealizedRevenue = (quoteItems) => {
  const commission = calculateQuoteCommission(quoteItems);
  setPotentialRevenue(prev => prev - commission);
  setRealizedRevenue(prev => prev + commission);

  // Update commissions by type
  const byType = quoteItems.reduce((acc, item) => {
    const itemCommission = calculateItemCommission(item);
    acc[item.type] = (acc[item.type] || 0) + itemCommission;
    return acc;
  }, {});

  setCommissionsByType(prev => ({
    ...prev,
    ...Object.keys(byType).reduce((acc, type) => ({
      ...acc,
      [type]: {
        potential: prev[type]?.potential - byType[type],
        realized: prev[type]?.realized + byType[type]
      }
    }), {})
  }));

  saveCommissionData();
}; 