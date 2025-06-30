import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { getStockQuote, getCompanyProfile, getMockStockData } from './services/stockIntegration';
import '../pagesCss/StockMarket.css';

function StockMarket() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = location.state?.user;

    const [stockData, setStockData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStock, setSelectedStock] = useState('nvidia');
    const [refreshInterval, setRefreshInterval] = useState(null);

    // Set up auto-refresh every 30 seconds
    useEffect(() => {
        fetchStockData();
        
        const interval = setInterval(fetchStockData, 30000);
        setRefreshInterval(interval);

        return () => {
            if (interval) clearInterval(interval);
        };
    }, []);

    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            if (refreshInterval) clearInterval(refreshInterval);
        };
    }, [refreshInterval]);

    // Fetch stock data
    const fetchStockData = async () => {
        try {
            setLoading(true);
            setError(null);

            // For demonstration, we'll use mock data
            // In production, you would use the actual API calls
            const mockData = getMockStockData();
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setStockData(mockData);
        } catch (err) {
            setError('Failed to fetch stock data. Please try again later.');
            console.error('Error fetching stock data:', err);
        } finally {
            setLoading(false);
        }
    };


    if (!user) {
        return <div className="stock-market-container">No user data available.</div>;
    }

    const handleBack = () => {
        navigate('/dashboard', { state: { user } });
    };

    const formatNumber = (num) => {
        if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
        return num.toString();
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
    };

    const StockCard = ({ stockKey, data }) => {
        const isPositive = data.change >= 0;
        const isSelected = selectedStock === stockKey;

        return (
            <div 
                className={`stock-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedStock(stockKey)}
            >
                <div className="stock-header">
                    <h3>{data.symbol}</h3>
                    <span className="company-name">{data.companyName}</span>
                </div>
                
                <div className="stock-price">
                    <span className="current-price">{formatPrice(data.currentPrice)}</span>
                    <span className={`price-change ${isPositive ? 'positive' : 'negative'}`}>
                        {isPositive ? '+' : ''}{formatPrice(data.change)} ({isPositive ? '+' : ''}{data.changePercent}%)
                    </span>
                </div>

                <div className="stock-details">
                    <div className="detail-row">
                        <span>High:</span>
                        <span>{formatPrice(data.high)}</span>
                    </div>
                    <div className="detail-row">
                        <span>Low:</span>
                        <span>{formatPrice(data.low)}</span>
                    </div>
                    <div className="detail-row">
                        <span>Volume:</span>
                        <span>{formatNumber(data.volume)}</span>
                    </div>
                    <div className="detail-row">
                        <span>Market Cap:</span>
                        <span>{data.marketCap}</span>
                    </div>
                </div>
            </div>
        );
    };

    const StockDetail = ({ data }) => {
        if (!data) return null;

        return (
            <div className="stock-detail-panel">
                <div className="detail-header">
                    <h2>{data.companyName} ({data.symbol})</h2>
                    <div className="current-price-large">
                        <span className="price">{formatPrice(data.currentPrice)}</span>
                        <span className={`change ${data.change >= 0 ? 'positive' : 'negative'}`}>
                            {data.change >= 0 ? '+' : ''}{formatPrice(data.change)} ({data.change >= 0 ? '+' : ''}{data.changePercent}%)
                        </span>
                    </div>
                </div>

                <div className="company-description">
                    <h3>About {data.companyName}</h3>
                    <p>{data.description}</p>
                </div>

                <div className="trading-info">
                    <h3>Trading Information</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Current Price:</label>
                            <span>{formatPrice(data.currentPrice)}</span>
                        </div>
                        <div className="info-item">
                            <label>Day High:</label>
                            <span>{formatPrice(data.high)}</span>
                        </div>
                        <div className="info-item">
                            <label>Day Low:</label>
                            <span>{formatPrice(data.low)}</span>
                        </div>
                        <div className="info-item">
                            <label>Volume:</label>
                            <span>{formatNumber(data.volume)}</span>
                        </div>
                        <div className="info-item">
                            <label>Market Cap:</label>
                            <span>{data.marketCap}</span>
                        </div>
                        <div className="info-item">
                            <label>Change:</label>
                            <span className={data.change >= 0 ? 'positive' : 'negative'}>
                                {data.change >= 0 ? '+' : ''}{formatPrice(data.change)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="chart-placeholder">
                    <h3>Price Chart</h3>
                    <div className="chart-container">
                        <p>Chart visualization would be displayed here</p>
                        <p>You can integrate libraries like Chart.js or Recharts for actual charts</p>
                    </div>
                </div>
            </div>
        );
    };

    if (loading && Object.keys(stockData).length === 0) {
        return (
            <div className="stock-market-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading stock data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="stock-market-container">
            <div className="stock-market-header">
                <h1>Stock Market</h1>
                <div className="header-controls">
                    <button 
                        className="refresh-btn"
                        onClick={fetchStockData}
                        disabled={loading}
                    >
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                    <button className="back-btn" onClick={handleBack}>
                        Back to Dashboard
                    </button>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="stock-market-content">
                <div className="stock-cards-container">
                    <h2>Available Stocks</h2>
                    <div className="stock-cards">
                        {Object.entries(stockData).map(([key, data]) => (
                            <StockCard key={key} stockKey={key} data={data} />
                        ))}
                    </div>
                </div>

                <div className="stock-detail-container">
                    <StockDetail data={stockData[selectedStock]} />
                </div>
            </div>

            <div className="stock-market-footer">
                <p>Data refreshes automatically every 30 seconds</p>
                <p>Last updated: {new Date().toLocaleTimeString()}</p>
            </div>
        </div>
    );
}

export default StockMarket;