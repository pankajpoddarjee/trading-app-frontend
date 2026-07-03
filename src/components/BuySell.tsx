import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./Layout/AdminLayout";
import { Search, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { getQuote, searchSymbol, getChartData } from "../api/api";
import ChartComponent from './ChartComponent';

interface StockQuote {
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
}

const BuySell: React.FC = () => {
  const navigate = useNavigate();
  const [symbol, setSymbol] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [orderType, setOrderType] = useState<"BUY" | "SELL">("BUY");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [user, setUser] = useState<any>(null);
  // Chart state
  const [chartData, setChartData] = useState<any>(null);
  const [chartLoading, setChartLoading] = useState<boolean>(false);
  const [chartError, setChartError] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate("/login");
    }
  }, []);

  // Search stocks
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.length > 1) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Fetch chart data when symbol changes
  useEffect(() => {
    if (symbol) {
      fetchChartData(symbol);
    }
  }, [symbol]);

const handleSearch = async (query: string) => {
  setSearchLoading(true);
  try {
    console.log("🔍 Searching for:", query);
    const response = await searchSymbol(query);
    console.log("📥 Full response:", response);
    
    // ✅ Safe data extraction
    let results = [];
    if (response && response.data) {
      if (Array.isArray(response.data)) {
        results = response.data;
      } else if (response.data.result) {
        results = response.data.result;
      } else {
        results = [];
      }
    }
    
    console.log("📊 Results count:", results.length);
    setSearchResults(results);
  } catch (error: any) {
    console.error("❌ Search error:", error.message);
    setSearchResults([]);
  } finally {
    setSearchLoading(false);
  }
};

  const handleSymbolSelect = async (selectedSymbol: string) => {
    console.log("🔍 Symbol selected:", selectedSymbol);
    setSymbol(selectedSymbol);
    setSearchQuery(selectedSymbol);
    setSearchResults([]);
    await fetchQuote(selectedSymbol);
  };

  const fetchQuote = async (sym: string) => {
    setLoading(true);
    try {
      const response = await getQuote(sym);
      const data = response.data;
      setQuote({
        c: data.price || 0,
        d: data.change || 0,
        dp: data.changePercent || 0,
        h: data.high || 0,
        l: data.low || 0,
        o: data.open || 0,
        pc: data.previousClose || 0,
      });
    } catch (error) {
      console.error("Quote error:", error);
      setQuote(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async (sym: string) => {
  console.log("📊 Fetching chart for:", sym);
  setChartLoading(true);
  setChartData(null);
  setChartError(null);

  try {
    const response = await getChartData(sym, "1mo");
    console.log("📥 Chart API response:", response.data);

    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      // ✅ Filter out null/undefined values
      const validData = response.data.filter((item: any) => item && item.close !== null);
      
      if (validData.length > 0) {
        setChartData(validData);
        console.log("✅ Chart data loaded:", validData.length, "points");
      } else {
        setChartError("No valid price data available");
      }
    } else {
      setChartError("No chart data available for this symbol");
    }
  } catch (error: any) {
    console.error("❌ Chart error:", error);
    setChartError(error.message || "Failed to load chart data");
  } finally {
    setChartLoading(false);
  }
};

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !quote) {
      setMessage({ type: "error", text: "Please search and select a stock first" });
      return;
    }
    if (quantity < 1) {
      setMessage({ type: "error", text: "Quantity must be at least 1" });
      return;
    }

    const total = quantity * quote.c;
    if (orderType === "BUY" && user && total > user.balance) {
      setMessage({
        type: "error",
        text: `Insufficient balance! You need ₹${total.toLocaleString()}`,
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("http://localhost:5000/api/trade/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          symbol,
          type: orderType,
          quantity,
          price: quote.c,
          total,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Order failed");

      const updatedUser = {
        ...user,
        balance: user.balance - (orderType === "BUY" ? total : 0),
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      setMessage({
        type: "success",
        text: `${orderType} order placed! ${quantity} shares of ${symbol} at ₹${quote.c}`,
      });
      setQuantity(1);
      setSymbol("");
      setSearchQuery("");
      setQuote(null);
      setChartData(null);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to place order" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="buy-sell-container">
        {/* Header */}
        <div className="buy-sell-header">
          <h1 className="buy-sell-title">Trade Stocks</h1>
          <p className="buy-sell-subtitle">Buy and sell stocks with real-time prices</p>
        </div>

        {/* Balance Card */}
        <div className="buy-sell-balance-card">
          <div className="buy-sell-balance-content">
            <div className="buy-sell-balance-left">
              <span className="buy-sell-balance-label">Available Balance</span>
              <span className="buy-sell-balance-amount">
                ₹{user?.balance?.toLocaleString() || "0"}
              </span>
            </div>
            <div className="buy-sell-balance-right">
              <span className="buy-sell-balance-label">Buying Power</span>
              <span className="buy-sell-balance-amount">
                ₹{user?.balance?.toLocaleString() || "0"}
              </span>
            </div>
          </div>
        </div>

        {message && (
          <div className={`buy-sell-message ${message.type}`}>{message.text}</div>
        )}

        {/* Main Trading Card */}
        <div className="buy-sell-card">
          {/* Search Section */}
          <div className="buy-sell-search-section">
            <div className="buy-sell-search-wrapper">
              <Search size={18} className="buy-sell-search-icon" />
              <input
                type="text"
                className="buy-sell-search-input"
                placeholder="Search stocks (e.g., AAPL, TSLA, RELIANCE)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
              />
              {searchLoading && <Loader2 size={18} className="buy-sell-search-loader" />}
            </div>

            {searchResults.length > 0 && (
              <div className="buy-sell-search-results">
                {searchResults.slice(0, 8).map((item: any) => (
                  <div
                    key={item.symbol}
                    className="buy-sell-search-result"
                    onClick={() => handleSymbolSelect(item.symbol)}
                  >
                    <span className="buy-sell-search-result-symbol">{item.symbol}</span>
                    <span className="buy-sell-search-result-desc">{item.description}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stock Info */}
          {symbol && (
            <div className="buy-sell-stock-info">
              <div className="buy-sell-stock-header">
                <h2 className="buy-sell-stock-symbol">{symbol}</h2>
                {quote && (
                  <div className="buy-sell-stock-price-section">
                    <span className="buy-sell-stock-price">₹{quote.c.toFixed(2)}</span>
                    <span
                      className={`buy-sell-stock-change ${quote.d >= 0 ? "positive" : "negative"}`}
                    >
                      {quote.d >= 0 ? "+" : ""}
                      {quote.d.toFixed(2)} ({quote.dp.toFixed(2)}%)
                    </span>
                  </div>
                )}
              </div>

              {quote && (
                <div className="buy-sell-stock-details">
                  <div className="buy-sell-stock-detail">
                    <span className="buy-sell-stock-detail-label">Open</span>
                    <span className="buy-sell-stock-detail-value">₹{quote.o.toFixed(2)}</span>
                  </div>
                  <div className="buy-sell-stock-detail">
                    <span className="buy-sell-stock-detail-label">High</span>
                    <span className="buy-sell-stock-detail-value">₹{quote.h.toFixed(2)}</span>
                  </div>
                  <div className="buy-sell-stock-detail">
                    <span className="buy-sell-stock-detail-label">Low</span>
                    <span className="buy-sell-stock-detail-value">₹{quote.l.toFixed(2)}</span>
                  </div>
                  <div className="buy-sell-stock-detail">
                    <span className="buy-sell-stock-detail-label">Prev Close</span>
                    <span className="buy-sell-stock-detail-value">₹{quote.pc.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Order Form */}
          {symbol && quote && (
            <form onSubmit={handlePlaceOrder} className="buy-sell-order-form">
              <div className="buy-sell-order-type">
                <button
                  type="button"
                  className={`buy-sell-order-btn ${orderType === "BUY" ? "active-buy" : ""}`}
                  onClick={() => setOrderType("BUY")}
                >
                  <TrendingUp size={18} /> Buy
                </button>
                <button
                  type="button"
                  className={`buy-sell-order-btn ${orderType === "SELL" ? "active-sell" : ""}`}
                  onClick={() => setOrderType("SELL")}
                >
                  <TrendingDown size={18} /> Sell
                </button>
              </div>

              <div className="buy-sell-order-fields">
                <div className="buy-sell-order-field">
                  <label className="buy-sell-order-label">Quantity</label>
                  <input
                    type="number"
                    className="buy-sell-order-input"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    min="1"
                    max="10000"
                    required
                  />
                </div>
                <div className="buy-sell-order-field">
                  <label className="buy-sell-order-label">Price (per share)</label>
                  <input
                    type="text"
                    className="buy-sell-order-input"
                    value={`₹${quote.c.toFixed(2)}`}
                    disabled
                  />
                </div>
              </div>

              <div className="buy-sell-order-total">
                <span className="buy-sell-order-total-label">Total Amount</span>
                <span className="buy-sell-order-total-value">
                  ₹{(quantity * quote.c).toFixed(2)}
                </span>
              </div>

              <button
                type="submit"
                className={`buy-sell-place-order ${orderType === "BUY" ? "buy" : "sell"}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {orderType === "BUY" ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                    {orderType} {symbol}
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        
        {/* Chart Section — Safety Check */}
        {symbol && chartData && Array.isArray(chartData) && chartData.length > 0 && (
          <ChartComponent 
            data={chartData}
            symbol={symbol}
            loading={chartLoading}
            error={chartError}
          />
        )}

        {/* Show loading/error separately */}
        {symbol && chartLoading && (
          <div className="chart-container">
            <div className="chart-loading">Loading chart...</div>
          </div>
        )}

        {symbol && chartError && !chartLoading && (
          <div className="chart-container">
            <div className="chart-error">{chartError}</div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default BuySell;