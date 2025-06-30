import axios from 'axios';

// You'll need to replace this with your actual Finnhub API key
const FINNHUB_API_KEY = 'd1h1ck9r01qkdlvr5d20d1h1ck9r01qkdlvr5d2g';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

// Create axios instance with base configuration
const finnhubApi = axios.create({
  baseURL: FINNHUB_BASE_URL,
  headers: {
    'X-Finnhub-Token': FINNHUB_API_KEY
  }
});

// Get stock symbols for a specific exchange
export const getStockSymbols = async (exchange = 'US') => {
  try {
    const response = await finnhubApi.get(`/stock/symbol?exchange=${exchange}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching stock symbols:', error);
    throw error;
  }
};

// Get real-time quote for a specific stock
export const getStockQuote = async (symbol) => {
  try {
    const response = await finnhubApi.get(`/quote?symbol=${symbol}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    throw error;
  }
};

// Get company profile
export const getCompanyProfile = async (symbol) => {
  try {
    const response = await finnhubApi.get(`/stock/profile2?symbol=${symbol}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching profile for ${symbol}:`, error);
    throw error;
  }
};

// Get historical data (candles)
export const getStockCandles = async (symbol, resolution = 'D', from, to) => {
  try {
    const response = await finnhubApi.get(`/stock/candle`, {
      params: {
        symbol,
        resolution,
        from,
        to
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching candles for ${symbol}:`, error);
    throw error;
  }
};

// Get news for a specific company
export const getCompanyNews = async (symbol, from, to) => {
  try {
    const response = await finnhubApi.get(`/company-news`, {
      params: {
        symbol,
        from,
        to
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching news for ${symbol}:`, error);
    throw error;
  }
};

// Mock data for demonstration (when API key is not available)
export const getMockStockData = () => {
  return {
    nvidia: {
      symbol: 'NVDA',
      companyName: 'NVIDIA Corporation',
      currentPrice: 485.09,
      change: 12.45,
      changePercent: 2.63,
      high: 492.50,
      low: 478.20,
      volume: 45678900,
      marketCap: '1.2T',
      description: 'NVIDIA Corporation designs and manufactures computer graphics processors, chipsets, and related multimedia software.'
    },
    apple: {
      symbol: 'AAPL',
      companyName: 'Apple Inc.',
      currentPrice: 175.43,
      change: -2.15,
      changePercent: -1.21,
      high: 178.90,
      low: 174.20,
      volume: 67890100,
      marketCap: '2.7T',
      description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.'
    }
  };
}; 