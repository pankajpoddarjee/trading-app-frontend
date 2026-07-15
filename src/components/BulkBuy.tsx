import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./Layout/AdminLayout";
import { Plus, Trash2, X } from "lucide-react";
import { addBulkHoldings, searchMasterStocks, addMasterStock } from "../api/api";

interface RowData {
  id: number;
  symbol: string;
  companyName: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
}

const BulkBuy: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<RowData[]>([
    { id: 1, symbol: "", companyName: "", quantity: 1, buyPrice: 0, currentPrice: 0 }
  ]);
  const [nextId, setNextId] = useState(2);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchResults, setSearchResults] = useState<{ [key: number]: any[] }>({});
  const [showSearch, setShowSearch] = useState<{ [key: number]: boolean }>({});
  
  const [showAddMasterModal, setShowAddMasterModal] = useState(false);
  const [newMasterStock, setNewMasterStock] = useState({ 
    symbol: '', 
    companyName: '', 
    sector: '', 
    exchange: 'NSE' 
  });
  const [activeRowId, setActiveRowId] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate("/login");
    }
  }, []);

  const addRow = () => {
    setRows([...rows, { id: nextId, symbol: "", companyName: "", quantity: 1, buyPrice: 0, currentPrice: 0 }]);
    setNextId(nextId + 1);
  };

  const removeRow = (id: number) => {
    if (rows.length > 1) {
      setRows(rows.filter(row => row.id !== id));
    }
  };

  const updateRow = (id: number, field: keyof RowData, value: any) => {
    setRows(rows.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const handleSearch = async (id: number, query: string) => {
    if (query.length < 1) {
      setSearchResults({ ...searchResults, [id]: [] });
      setShowSearch({ ...showSearch, [id]: false });
      return;
    }
    
    try {
      const response = await searchMasterStocks(query);
      setSearchResults({ ...searchResults, [id]: response.data || [] });
      setShowSearch({ ...showSearch, [id]: true });
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const selectStock = (id: number, stock: any) => {
    console.log("✅ Selected:", stock.symbol);
    setRows(prevRows => 
      prevRows.map(row => 
        row.id === id 
          ? { ...row, symbol: stock.symbol, companyName: stock.company_name }
          : row
      )
    );
    setShowSearch(prev => ({ ...prev, [id]: false }));
  };

  const handleAddMasterStock = async () => {
    if (!newMasterStock.symbol || !newMasterStock.companyName) {
      alert("Please enter symbol and company name");
      return;
    }

    try {
      await addMasterStock({
        symbol: newMasterStock.symbol.toUpperCase(),
        companyName: newMasterStock.companyName,
        sector: newMasterStock.sector || 'Others',
        exchange: newMasterStock.exchange || 'NSE',
      });
      
      if (activeRowId !== null) {
        const searchResp = await searchMasterStocks(newMasterStock.symbol);
        const foundStock = searchResp.data?.find((s: any) => s.symbol === newMasterStock.symbol.toUpperCase());
        if (foundStock) {
          selectStock(activeRowId, foundStock);
        }
      }
      
      setShowAddMasterModal(false);
      setNewMasterStock({ symbol: '', companyName: '', sector: '', exchange: 'NSE' });
      setActiveRowId(null);
      
      alert("Stock added to master successfully!");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to add stock");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    for (const row of rows) {
      if (!row.symbol || !row.companyName || row.quantity <= 0 || row.buyPrice <= 0) {
        setMessage({ type: 'error', text: 'Please fill all fields for all rows' });
        return;
      }
    }
    
    setLoading(true);
    setMessage(null);
    
    try {
      const entries = rows.map(row => ({
        symbol: row.symbol,
        companyName: row.companyName,
        quantity: row.quantity,
        buyPrice: row.buyPrice,
        currentPrice: row.currentPrice || row.buyPrice,
      }));
      
      await addBulkHoldings({ entries, transactionDate });
      
      setMessage({ type: 'success', text: `${rows.length} holdings added successfully!` });
      setRows([{ id: nextId, symbol: "", companyName: "", quantity: 1, buyPrice: 0, currentPrice: 0 }]);
      setNextId(nextId + 1);
      setSearchResults({});
      setShowSearch({});
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to add holdings' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="bulk-buy-container">
        <div className="bulk-buy-header">
          <h1 className="bulk-buy-title">Bulk Buy</h1>
          <p className="bulk-buy-subtitle">Add multiple stocks at once</p>
        </div>

        {message && (
          <div className={`bulk-buy-message ${message.type}`}>{message.text}</div>
        )}

        <div className="bulk-buy-card">
          <form onSubmit={handleSubmit}>
            <div className="bulk-buy-date">
              <label className="bulk-buy-label">Transaction Date</label>
              <input
                type="date"
                className="bulk-buy-input"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
              />
            </div>

            <div className="bulk-buy-rows">
              {rows.map((row, index) => (
                <div key={row.id} className="bulk-buy-row">
                  <div className="bulk-buy-row-number">{index + 1}</div>
                  
                  <div className="bulk-buy-row-fields">
                    <div className="bulk-buy-field search-field">
                      <label className="bulk-buy-label">Symbol / Company</label>
                      <div className="search-wrapper">
                        <input
                          type="text"
                          className="bulk-buy-input"
                          placeholder="Search stock..."
                          value={row.symbol}
                          onChange={(e) => {
                            const val = e.target.value.toUpperCase();
                            updateRow(row.id, 'symbol', val);
                            handleSearch(row.id, val);
                          }}
                        />
                        {showSearch[row.id] && (
                          <div className="search-results">
                            {searchResults[row.id]?.length > 0 ? (
                              searchResults[row.id].map((stock) => (
                                <div
                                  key={stock.id}
                                  className="search-result-item"
                                  onClick={() => selectStock(row.id, stock)}
                                >
                                  <span className="search-result-symbol">{stock.symbol}</span>
                                  <span className="search-result-name">{stock.company_name}</span>
                                  <span className="search-result-exchange">{stock.exchange || 'NSE'}</span>
                                </div>
                              ))
                            ) : (
                              <div className="search-no-result">
                                <span>No stock found</span>
                                <button
                                  className="search-add-btn"
                                  onClick={() => {
                                    setActiveRowId(row.id);
                                    setNewMasterStock({
                                      symbol: row.symbol,
                                      companyName: '',
                                      sector: '',
                                      exchange: 'NSE'
                                    });
                                    setShowAddMasterModal(true);
                                  }}
                                >
                                  + Add "{row.symbol}" to Master
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bulk-buy-field">
                      <label className="bulk-buy-label">Qty</label>
                      <input
                        type="number"
                        className="bulk-buy-input"
                        value={row.quantity}
                        onChange={(e) => updateRow(row.id, 'quantity', parseInt(e.target.value) || 0)}
                        min="1"
                      />
                    </div>

                    <div className="bulk-buy-field">
                      <label className="bulk-buy-label">Buy Price</label>
                      <input
                        type="number"
                        className="bulk-buy-input"
                        value={row.buyPrice}
                        onChange={(e) => updateRow(row.id, 'buyPrice', parseFloat(e.target.value) || 0)}
                        step="0.01"
                        min="0"
                      />
                    </div>

                    <div className="bulk-buy-field">
                      <label className="bulk-buy-label">Current Price</label>
                      <input
                        type="number"
                        className="bulk-buy-input"
                        value={row.currentPrice}
                        onChange={(e) => updateRow(row.id, 'currentPrice', parseFloat(e.target.value) || 0)}
                        step="0.01"
                        min="0"
                        placeholder="Same as buy"
                      />
                    </div>

                    <div className="bulk-buy-field total-field">
                      <label className="bulk-buy-label">Total</label>
                      <span className="bulk-buy-total">₹{(row.quantity * row.buyPrice).toFixed(2)}</span>
                    </div>

                    {rows.length > 1 && (
                      <button type="button" className="bulk-buy-remove" onClick={() => removeRow(row.id)}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button type="button" className="bulk-buy-add-row" onClick={addRow}>
              <Plus size={18} /> Add Row
            </button>

            <button type="submit" className="bulk-buy-submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add All Holdings'}
            </button>
          </form>
        </div>
      </div>

      {/* Add Master Stock Modal */}
      {showAddMasterModal && (
        <div className="portfolio-modal-overlay" onClick={() => setShowAddMasterModal(false)}>
          <div className="portfolio-modal" onClick={(e) => e.stopPropagation()}>
            <div className="portfolio-modal-header">
              <h2 className="portfolio-modal-title">Add Stock to Master</h2>
              <button className="portfolio-modal-close" onClick={() => setShowAddMasterModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="portfolio-modal-body">
              <div className="portfolio-modal-group">
                <label className="portfolio-modal-label">Symbol</label>
                <input
                  type="text"
                  className="portfolio-modal-input"
                  value={newMasterStock.symbol}
                  onChange={(e) => setNewMasterStock({ ...newMasterStock, symbol: e.target.value.toUpperCase() })}
                  placeholder="e.g., AAPL"
                />
              </div>
              <div className="portfolio-modal-group">
                <label className="portfolio-modal-label">Company Name</label>
                <input
                  type="text"
                  className="portfolio-modal-input"
                  value={newMasterStock.companyName}
                  onChange={(e) => setNewMasterStock({ ...newMasterStock, companyName: e.target.value })}
                  placeholder="e.g., Apple Inc."
                />
              </div>
              <div className="portfolio-modal-group">
                <label className="portfolio-modal-label">Sector</label>
                <input
                  type="text"
                  className="portfolio-modal-input"
                  value={newMasterStock.sector}
                  onChange={(e) => setNewMasterStock({ ...newMasterStock, sector: e.target.value })}
                  placeholder="e.g., Technology"
                />
              </div>
              <div className="portfolio-modal-group">
                <label className="portfolio-modal-label">Exchange</label>
                <select
                  className="portfolio-modal-input"
                  value={newMasterStock.exchange}
                  onChange={(e) => setNewMasterStock({ ...newMasterStock, exchange: e.target.value })}
                >
                  <option value="NSE">NSE</option>
                  <option value="BSE">BSE</option>
                  <option value="NASDAQ">NASDAQ</option>
                  <option value="NYSE">NYSE</option>
                </select>
              </div>
            </div>
            <div className="portfolio-modal-actions">
              <button className="portfolio-modal-cancel" onClick={() => setShowAddMasterModal(false)}>
                Cancel
              </button>
              <button className="portfolio-modal-save" onClick={handleAddMasterStock}>
                Add to Master
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default BulkBuy;