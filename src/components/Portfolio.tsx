import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./Layout/AdminLayout";
import { Plus, TrendingUp, TrendingDown, Trash2, Eye, X, Search, TrendingUp as SellIcon } from "lucide-react";
import { getPortfolio, addHolding, deleteHolding, updatePrice, sellHolding, getTransactions } from "../api/api";

interface Holding {
  id: number;
  symbol: string;
  company_name: string;
  quantity: number;
  buy_price: number;
  current_price: number;
}

interface Transaction {
  id: number;
  symbol: string;
  company_name: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  total_amount: number;
  created_at: string;
}

const Portfolio: React.FC = () => {
  const navigate = useNavigate();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({
    totalInvestment: 0,
    totalCurrentValue: 0,
    totalPnl: 0,
    totalPnlPercent: 0,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState<Holding | null>(null);
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy'); // ✅ Active tab state
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [sellData, setSellData] = useState({
    symbol: "",
    quantity: 0,
    sellPrice: 0,
  });
  const [formData, setFormData] = useState({
    symbol: "",
    companyName: "",
    quantity: 1,
    buyPrice: 0,
    currentPrice: 0,
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate("/login");
    }
    fetchHoldings();
    fetchTransactions();
  }, []);

  const fetchHoldings = async () => {
    setLoading(true);
    try {
      const response = await getPortfolio();
      console.log("📥 Portfolio response:", response.data);
      
      const holdingsData = response.data?.holdings || [];
      const summaryData = response.data?.summary || {
        totalInvestment: 0,
        totalCurrentValue: 0,
        totalPnl: 0,
        totalPnlPercent: 0,
      };
      
      setHoldings(holdingsData);
      setSummary(summaryData);
    } catch (error: any) {
      console.error("❌ Error fetching holdings:", error);
      setHoldings([]);
      setSummary({
        totalInvestment: 0,
        totalCurrentValue: 0,
        totalPnl: 0,
        totalPnlPercent: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await getTransactions();
      setTransactions(response.data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const handleAddHolding = async () => {
    if (!formData.symbol || !formData.companyName || formData.quantity <= 0 || formData.buyPrice <= 0) {
      alert("Please fill all fields correctly");
      return;
    }

    try {
      await addHolding({
        symbol: formData.symbol.toUpperCase(),
        companyName: formData.companyName,
        quantity: formData.quantity,
        buyPrice: formData.buyPrice,
        currentPrice: formData.currentPrice || formData.buyPrice,
      });
      
      await fetchHoldings();
      await fetchTransactions();
      setShowAddModal(false);
      setFormData({ symbol: "", companyName: "", quantity: 1, buyPrice: 0, currentPrice: 0 });
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to add holding");
    }
  };

  const handleSell = async () => {
    if (!selectedHolding) return;
    if (sellData.quantity <= 0 || sellData.sellPrice <= 0) {
      alert("Please enter valid quantity and price");
      return;
    }
    if (sellData.quantity > selectedHolding.quantity) {
      alert(`You only have ${selectedHolding.quantity} shares`);
      return;
    }

    try {
      await sellHolding({
        symbol: selectedHolding.symbol,
        quantity: sellData.quantity,
        sellPrice: sellData.sellPrice,
      });
      
      await fetchHoldings();
      await fetchTransactions();
      setShowSellModal(false);
      setSelectedHolding(null);
      setSellData({ symbol: "", quantity: 0, sellPrice: 0 });
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to sell");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to remove this holding?")) {
      try {
        await deleteHolding(id);
        await fetchHoldings();
        await fetchTransactions();
      } catch (error) {
        alert("Failed to delete holding");
      }
    }
  };

  const handleUpdatePrice = (id: number, newPrice: number) => {
    // Update local state
    setHoldings(prev => 
      prev.map(h => 
        h.id === id ? { ...h, current_price: newPrice } : h
      )
    );
    
    // Save to DB after delay
    setTimeout(async () => {
      try {
        await updatePrice(id, newPrice);
        await fetchHoldings();
      } catch (error) {
        console.error("Failed to update price:", error);
      }
    }, 1000);
  };

  const openSellModal = (holding: Holding) => {
    setSelectedHolding(holding);
    setSellData({ symbol: holding.symbol, quantity: 1, sellPrice: holding.current_price });
    setShowSellModal(true);
  };

  const openDetailModal = (holding: Holding) => {
    console.log("🔍 Opening detail for:", holding);
    setSelectedHolding(holding);
    setActiveTab('buy'); // ✅ Reset to buy tab when opening
    setShowDetailModal(true);
  };

  // Get all transactions for a specific symbol
  const getSymbolTransactions = (symbol: string, type?: 'BUY' | 'SELL') => {
    if (!transactions || !Array.isArray(transactions)) {
      return [];
    }
    let filtered = transactions.filter(t => t.symbol === symbol);
    if (type) {
      filtered = filtered.filter(t => t.type === type);
    }
    return filtered;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading-text">Loading portfolio...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="portfolio-container">
        {/* Header */}
        <div className="portfolio-header">
          <div>
            <h1 className="portfolio-title">Portfolio</h1>
            <p className="portfolio-subtitle">Track your stock holdings</p>
          </div>
          <button className="portfolio-add-btn" onClick={() => setShowAddModal(true)}>
            <Plus size={18} /> Add Holding
          </button>
        </div>

        {/* Summary Cards */}
        <div className="portfolio-summary">
          <div className="portfolio-summary-card">
            <span className="portfolio-summary-label">Total Investment</span>
            <span className="portfolio-summary-value">₹{summary.totalInvestment.toLocaleString()}</span>
          </div>
          <div className="portfolio-summary-card">
            <span className="portfolio-summary-label">Current Value</span>
            <span className="portfolio-summary-value">₹{summary.totalCurrentValue.toLocaleString()}</span>
          </div>
          <div className="portfolio-summary-card">
            <span className="portfolio-summary-label">Total P&L</span>
            <span className={`portfolio-summary-value ${summary.totalPnl >= 0 ? "positive" : "negative"}`}>
              {summary.totalPnl >= 0 ? "+" : ""}₹{summary.totalPnl.toLocaleString()}
            </span>
          </div>
          <div className="portfolio-summary-card">
            <span className="portfolio-summary-label">P&L %</span>
            <span className={`portfolio-summary-value ${summary.totalPnlPercent >= 0 ? "positive" : "negative"}`}>
              {summary.totalPnlPercent >= 0 ? "+" : ""}{summary.totalPnlPercent.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="portfolio-table-container">
          {holdings.length === 0 ? (
            <div className="portfolio-empty">
              <p>No holdings yet. Add your first stock!</p>
            </div>
          ) : (
            <table className="portfolio-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Company</th>
                  <th>Quantity</th>
                  <th>Avg Buy Price</th>
                  <th>Current Price</th>
                  <th>Total Value</th>
                  <th>P&L</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((h) => {
                  const totalValue = h.quantity * h.current_price;
                  const pnl = h.quantity * (h.current_price - h.buy_price);
                  const pnlPercent = ((h.current_price - h.buy_price) / h.buy_price) * 100;
                  
                  return (
                    <tr key={h.id}>
                      <td className="portfolio-symbol">{h.symbol}</td>
                      <td>{h.company_name}</td>
                      <td>{h.quantity}</td>
                      <td>₹{h.buy_price.toFixed(2)}</td>
                      <td>
                        <input
                          type="number"
                          className="portfolio-price-input"
                          value={h.current_price}
                          onChange={(e) => handleUpdatePrice(h.id, parseFloat(e.target.value) || 0)}
                          step="0.01"
                        />
                      </td>
                      <td>₹{totalValue.toFixed(2)}</td>
                      <td className={pnl >= 0 ? "positive" : "negative"}>
                        {pnl >= 0 ? "+" : ""}₹{pnl.toFixed(2)} ({pnlPercent.toFixed(2)}%)
                      </td>
                      <td>
                        <div className="portfolio-actions">
                          <button className="portfolio-action-btn detail" onClick={() => openDetailModal(h)} title="View Details">
                            <Eye size={16} />
                          </button>
                          <button className="portfolio-action-btn sell" onClick={() => openSellModal(h)} title="Sell">
                            <SellIcon size={16} />
                          </button>
                          <button className="portfolio-action-btn delete" onClick={() => handleDelete(h.id)} title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Sell Modal */}
      {showSellModal && selectedHolding && (
        <div className="portfolio-modal-overlay" onClick={() => setShowSellModal(false)}>
          <div className="portfolio-modal" onClick={(e) => e.stopPropagation()}>
            <div className="portfolio-modal-header">
              <h2 className="portfolio-modal-title">Sell {selectedHolding.symbol}</h2>
              <button className="portfolio-modal-close" onClick={() => setShowSellModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="portfolio-modal-body">
              <p className="portfolio-modal-info">
                You have <strong>{selectedHolding.quantity}</strong> shares of {selectedHolding.symbol}
              </p>
              <p className="portfolio-modal-info">
                Current Price: <strong>₹{selectedHolding.current_price.toFixed(2)}</strong>
              </p>
              <div className="portfolio-modal-group">
                <label className="portfolio-modal-label">Quantity to Sell</label>
                <input
                  type="number"
                  className="portfolio-modal-input"
                  value={sellData.quantity}
                  onChange={(e) => setSellData({ ...sellData, quantity: parseInt(e.target.value) || 0 })}
                  min="1"
                  max={selectedHolding.quantity}
                />
              </div>
              <div className="portfolio-modal-group">
                <label className="portfolio-modal-label">Sell Price (₹)</label>
                <input
                  type="number"
                  className="portfolio-modal-input"
                  value={sellData.sellPrice}
                  onChange={(e) => setSellData({ ...sellData, sellPrice: parseFloat(e.target.value) || 0 })}
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="portfolio-modal-total">
                <span>Total Amount</span>
                <span>₹{(sellData.quantity * sellData.sellPrice).toFixed(2)}</span>
              </div>
            </div>
            <div className="portfolio-modal-actions">
              <button className="portfolio-modal-cancel" onClick={() => setShowSellModal(false)}>
                Cancel
              </button>
              <button className="portfolio-modal-sell" onClick={handleSell}>
                Sell
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedHolding && (
        <div className="portfolio-modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="portfolio-modal detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="portfolio-modal-header">
              <h2 className="portfolio-modal-title">{selectedHolding.symbol} - Details</h2>
              <button className="portfolio-modal-close" onClick={() => setShowDetailModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="portfolio-modal-body">
              {/* Summary Cards */}
              <div className="detail-summary">
                <div className="detail-summary-item">
                  <span>Total Shares</span>
                  <strong>{selectedHolding.quantity}</strong>
                </div>
                <div className="detail-summary-item">
                  <span>Avg Buy Price</span>
                  <strong>₹{selectedHolding.buy_price.toFixed(2)}</strong>
                </div>
                <div className="detail-summary-item">
                  <span>Current Price</span>
                  <strong>₹{selectedHolding.current_price.toFixed(2)}</strong>
                </div>
                <div className="detail-summary-item">
                  <span>Total P&L</span>
                  <strong className={selectedHolding.quantity * (selectedHolding.current_price - selectedHolding.buy_price) >= 0 ? "positive" : "negative"}>
                    ₹{(selectedHolding.quantity * (selectedHolding.current_price - selectedHolding.buy_price)).toFixed(2)}
                  </strong>
                </div>
              </div>

              {/* Buy & Sell History Tabs */}
              <div className="detail-tabs">
                <button 
                  className={`detail-tab ${activeTab === 'buy' ? 'active' : ''}`}
                  onClick={() => setActiveTab('buy')}
                >
                  Buy History ({getSymbolTransactions(selectedHolding.symbol, 'BUY').length})
                </button>
                <button 
                  className={`detail-tab ${activeTab === 'sell' ? 'active' : ''}`}
                  onClick={() => setActiveTab('sell')}
                >
                  Sell History ({getSymbolTransactions(selectedHolding.symbol, 'SELL').length})
                </button>
              </div>

              {/* Buy History */}
              {activeTab === 'buy' && (
                <div className="detail-buy-history">
                  {getSymbolTransactions(selectedHolding.symbol, 'BUY').length === 0 ? (
                    <p className="detail-no-history">No buy history available</p>
                  ) : (
                    <table className="detail-history-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Quantity</th>
                          <th>Price</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getSymbolTransactions(selectedHolding.symbol, 'BUY').map((t: Transaction) => {
                          const price = typeof t.price === 'number' ? t.price : parseFloat(String(t.price)) || 0;
                          const totalAmount = typeof t.total_amount === 'number' ? t.total_amount : parseFloat(String(t.total_amount)) || 0;
                          const quantity = typeof t.quantity === 'number' ? t.quantity : parseInt(String(t.quantity)) || 0;
                          const date = t.created_at ? new Date(t.created_at).toLocaleDateString('en-IN') : 'N/A';
                          
                          return (
                            <tr key={t.id}>
                              <td>{date}</td>
                              <td>{quantity}</td>
                              <td>₹{price.toFixed(2)}</td>
                              <td>₹{totalAmount.toFixed(2)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Sell History */}
              {activeTab === 'sell' && (
                <div className="detail-buy-history">
                  {getSymbolTransactions(selectedHolding.symbol, 'SELL').length === 0 ? (
                    <p className="detail-no-history">No sell history available</p>
                  ) : (
                    <table className="detail-history-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Quantity</th>
                          <th>Price</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getSymbolTransactions(selectedHolding.symbol, 'SELL').map((t: Transaction) => {
                          const price = typeof t.price === 'number' ? t.price : parseFloat(String(t.price)) || 0;
                          const totalAmount = typeof t.total_amount === 'number' ? t.total_amount : parseFloat(String(t.total_amount)) || 0;
                          const quantity = typeof t.quantity === 'number' ? t.quantity : parseInt(String(t.quantity)) || 0;
                          const date = t.created_at ? new Date(t.created_at).toLocaleDateString('en-IN') : 'N/A';
                          
                          return (
                            <tr key={t.id}>
                              <td>{date}</td>
                              <td>{quantity}</td>
                              <td>₹{price.toFixed(2)}</td>
                              <td>₹{totalAmount.toFixed(2)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
            <div className="portfolio-modal-actions">
              <button className="portfolio-modal-close-btn" onClick={() => setShowDetailModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="portfolio-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="portfolio-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="portfolio-modal-title">Add New Holding</h2>
            <div className="portfolio-modal-form">
              <div className="portfolio-modal-group">
                <label className="portfolio-modal-label">Symbol</label>
                <input
                  type="text"
                  className="portfolio-modal-input"
                  placeholder="e.g., AAPL"
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="portfolio-modal-group">
                <label className="portfolio-modal-label">Company Name</label>
                <input
                  type="text"
                  className="portfolio-modal-input"
                  placeholder="e.g., Apple Inc."
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
              </div>
              <div className="portfolio-modal-group">
                <label className="portfolio-modal-label">Quantity</label>
                <input
                  type="number"
                  className="portfolio-modal-input"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                  min="1"
                />
              </div>
              <div className="portfolio-modal-group">
                <label className="portfolio-modal-label">Buy Price (₹)</label>
                <input
                  type="number"
                  className="portfolio-modal-input"
                  value={formData.buyPrice}
                  onChange={(e) => setFormData({ ...formData, buyPrice: parseFloat(e.target.value) || 0 })}
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="portfolio-modal-group">
                <label className="portfolio-modal-label">Current Price (₹)</label>
                <input
                  type="number"
                  className="portfolio-modal-input"
                  value={formData.currentPrice}
                  onChange={(e) => setFormData({ ...formData, currentPrice: parseFloat(e.target.value) || 0 })}
                  step="0.01"
                  min="0"
                  placeholder="Same as buy price if not updated"
                />
              </div>
            </div>
            <div className="portfolio-modal-actions">
              <button className="portfolio-modal-cancel" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="portfolio-modal-save" onClick={handleAddHolding}>
                Add Holding
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Portfolio;