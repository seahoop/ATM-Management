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

// Get real-time data for specific major stocks
export const getMajorStocksData = async () => {
  const stockSymbols = ['NVDA', 'AAPL', '2222.SR', 'COST', 'AMZN', 'MSFT', 'GOOGL'];
  const stockData = {};

  try {
    // Fetch quotes for all stocks in parallel
    const quotePromises = stockSymbols.map(symbol => getStockQuote(symbol));
    const quotes = await Promise.all(quotePromises);

    // Fetch company profiles for all stocks in parallel
    const profilePromises = stockSymbols.map(symbol => getCompanyProfile(symbol));
    const profiles = await Promise.all(profilePromises);

    // Combine the data
    stockSymbols.forEach((symbol, index) => {
      const quote = quotes[index];
      const profile = profiles[index];
      
      if (quote && profile) {
        const stockKey = getStockKeyFromSymbol(symbol);
        stockData[stockKey] = {
          symbol: symbol,
          companyName: profile.name || 'Unknown Company',
          currentPrice: quote.c,
          change: quote.d,
          changePercent: quote.dp,
          high: quote.h,
          low: quote.l,
          volume: quote.v,
          marketCap: formatMarketCap(profile.marketCapitalization),
          description: profile.finnhubIndustry || 'No description available'
        };
      }
    });

    return stockData;
  } catch (error) {
    console.error('Error fetching major stocks data:', error);
    throw error;
  }
};

// Helper function to convert symbol to stock key
const getStockKeyFromSymbol = (symbol) => {
  const symbolMap = {
    'NVDA': 'nvidia',
    'AAPL': 'apple',
    '2222.SR': 'saudiAramco',
    'COST': 'costco',
    'AMZN': 'amazon',
    'MSFT': 'microsoft',
    'GOOGL': 'google'
  };
  return symbolMap[symbol] || symbol.toLowerCase();
};

// Helper function to format market cap
const formatMarketCap = (marketCap) => {
  if (!marketCap) return 'N/A';
  if (marketCap >= 1e12) return (marketCap / 1e12).toFixed(1) + 'T';
  if (marketCap >= 1e9) return (marketCap / 1e9).toFixed(1) + 'B';
  if (marketCap >= 1e6) return (marketCap / 1e6).toFixed(1) + 'M';
  return marketCap.toString();
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
      description: 'NVIDIA Corporation designs and manufactures computer graphics processors, chipsets, and related multimedia software. The company is a leader in AI computing and gaming technologies.'
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
      description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company is known for its innovative consumer electronics and software.'
    },
    saudiAramco: {
      symbol: '2222.SR',
      companyName: 'Saudi Aramco',
      currentPrice: 32.45,
      change: 0.85,
      changePercent: 2.69,
      high: 32.80,
      low: 31.90,
      volume: 12345600,
      marketCap: '2.1T',
      description: 'Saudi Arabian Oil Company (Saudi Aramco) is the world\'s largest integrated oil and gas company. It engages in the exploration, production, refining, distribution, and marketing of petroleum and natural gas.'
    },
    costco: {
      symbol: 'COST',
      companyName: 'Costco Wholesale Corporation',
      currentPrice: 678.92,
      change: 8.76,
      changePercent: 1.31,
      high: 682.50,
      low: 675.30,
      volume: 23456700,
      marketCap: '300B',
      description: 'Costco Wholesale Corporation operates membership warehouses that offer branded and private-label products in a range of merchandise categories. The company is known for its bulk retail model and competitive pricing.'
    },
    amazon: {
      symbol: 'AMZN',
      companyName: 'Amazon.com Inc.',
      currentPrice: 145.67,
      change: 3.21,
      changePercent: 2.25,
      high: 147.20,
      low: 143.80,
      volume: 56789000,
      marketCap: '1.5T',
      description: 'Amazon.com Inc. engages in the retail sale of consumer products and subscriptions in North America and internationally. The company operates through North America, International, and Amazon Web Services segments.'
    },
    microsoft: {
      symbol: 'MSFT',
      companyName: 'Microsoft Corporation',
      currentPrice: 378.85,
      change: 5.67,
      changePercent: 1.52,
      high: 380.20,
      low: 375.40,
      volume: 34567800,
      marketCap: '2.8T',
      description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide. The company is a leader in cloud computing, productivity software, and gaming technologies.'
    },
    google: {
      symbol: 'GOOGL',
      companyName: 'Alphabet Inc. (Google)',
      currentPrice: 142.56,
      change: 2.34,
      changePercent: 1.67,
      high: 143.90,
      low: 141.20,
      volume: 45678900,
      marketCap: '1.8T',
      description: 'Alphabet Inc. provides online advertising services in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America. The company operates through Google Services, Google Cloud, and Other Bets segments.'
    }
  };
};