import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./Layout/AdminLayout";
import { Plus, Edit2, Trash2, Search, X } from "lucide-react";
import { getAllMasterStocks, updateMasterStock, deleteMasterStock, addMasterStock } from "../api/api";

interface MasterStock {
  id: number;
  symbol: string;
  company_name: string;
  sector: string;
  exchange: string;
  is_active: number;
  created_at: string;
}

const MasterStocks: React.FC = () => {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState<MasterStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStock, setEditingStock] = useState<MasterStock | null>(null);
  const [formData, setFormData] = useState({
    symbol: "",
    companyName: "",
    sector: "",
    exchange: "NSE",
  });
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStocks, setFilteredStocks] = useState<MasterStock[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(userData));
    fetchStocks();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredStocks(stocks);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredStocks(
        stocks.filter(
          (s) =>
            s.symbol.toLowerCase().includes(q) ||
            s.company_name.toLowerCase().includes(q)
        )
      );
    }
  }, [searchQuery, stocks]);

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const response = await getAllMasterStocks();
      setStocks(response.data || []);
    } catch (error) {
      console.error("Error fetching stocks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.symbol || !formData.companyName) {
      alert("Symbol and Company Name are required");
      return;
    }
    try {
      await addMasterStock(formData);
      await fetchStocks();
      setShowAddModal(false);
      setFormData({ symbol: "", companyName: "", sector: "", exchange: "NSE" });
      alert("Stock added successfully!");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to add stock");
    }
  };

  const handleEdit = (stock: MasterStock) => {
    setEditingStock(stock);
    setFormData({
      symbol: stock.symbol,
      companyName: stock.company_name,
      sector: stock.sector || "",
      exchange: stock.exchange || "NSE",
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStock) return;
    if (!formData.symbol || !formData.companyName) {
      alert("Symbol and Company Name are required");
      return;
    }
    try {
      await updateMasterStock(editingStock.id, formData);
      await fetchStocks();
      setShowEditModal(false);
      setEditingStock(null);
      setFormData({ symbol: "", companyName: "", sector: "", exchange: "NSE" });
      alert("Stock updated successfully!");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update stock");
    }
  };

  const handleDelete = async (id: number, symbol: string) => {
    if (!window.confirm(`Are you sure you want to delete "${symbol}"?`)) return;
    try {
      await deleteMasterStock(id);
      await fetchStocks();
      alert("Stock deleted successfully!");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete stock");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading-text">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="master-stocks-container">
        <div className="master-stocks-header">
          <div>
            <h1 className="master-stocks-title">Master Stocks</h1>
            <p className="master-stocks-subtitle">Manage all available stocks</p>
          </div>
          <button className="master-stocks-add-btn" onClick={() => setShowAddModal(true)}>
            <Plus size={18} /> Add Stock
          </button>
        </div>

        {/* Search */}
        <div className="master-stocks-search">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by symbol or company name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => setSearchQuery("")}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="master-stocks-table-container">
          <table className="master-stocks-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Company Name</th>
                <th>Sector</th>
                <th>Exchange</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStocks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-row">No stocks found</td>
                </tr>
              ) : (
                filteredStocks.map((stock) => (
                  <tr key={stock.id}>
                    <td className="symbol-cell">{stock.symbol}</td>
                    <td>{stock.company_name}</td>
                    <td>{stock.sector || "-"}</td>
                    <td>{stock.exchange || "NSE"}</td>
                    <td>
                      <span className={`status-badge ${stock.is_active ? "active" : "inactive"}`}>
                        {stock.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button className="action-btn edit" onClick={() => handleEdit(stock)}>
                        <Edit2 size={16} />
                      </button>
                      <button className="action-btn delete" onClick={() => handleDelete(stock.id, stock.symbol)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="portfolio-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="portfolio-modal" onClick={(e) => e.stopPropagation()}>
            <div className="portfolio-modal-header">
              <h2 className="portfolio-modal-title">Add New Stock</h2>
              <button className="portfolio-modal-close" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="portfolio-modal-body">
                <div className="portfolio-modal-group">
                  <label className="portfolio-modal-label">Symbol</label>
                  <input
                    type="text"
                    className="portfolio-modal-input"
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                    placeholder="e.g., AAPL"
                    required
                  />
                </div>
                <div className="portfolio-modal-group">
                  <label className="portfolio-modal-label">Company Name</label>
                  <input
                    type="text"
                    className="portfolio-modal-input"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g., Apple Inc."
                    required
                  />
                </div>
                <div className="portfolio-modal-group">
                  <label className="portfolio-modal-label">Sector</label>
                  <input
                    type="text"
                    className="portfolio-modal-input"
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    placeholder="e.g., Technology"
                  />
                </div>
                <div className="portfolio-modal-group">
                  <label className="portfolio-modal-label">Exchange</label>
                  <select
                    className="portfolio-modal-input"
                    value={formData.exchange}
                    onChange={(e) => setFormData({ ...formData, exchange: e.target.value })}
                  >
                    <option value="NSE">NSE</option>
                    <option value="BSE">BSE</option>
                    <option value="NASDAQ">NASDAQ</option>
                    <option value="NYSE">NYSE</option>
                  </select>
                </div>
              </div>
              <div className="portfolio-modal-actions">
                <button type="button" className="portfolio-modal-cancel" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="portfolio-modal-save">
                  Add Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingStock && (
        <div className="portfolio-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="portfolio-modal" onClick={(e) => e.stopPropagation()}>
            <div className="portfolio-modal-header">
              <h2 className="portfolio-modal-title">Edit Stock</h2>
              <button className="portfolio-modal-close" onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="portfolio-modal-body">
                <div className="portfolio-modal-group">
                  <label className="portfolio-modal-label">Symbol</label>
                  <input
                    type="text"
                    className="portfolio-modal-input"
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                    placeholder="e.g., AAPL"
                    required
                  />
                </div>
                <div className="portfolio-modal-group">
                  <label className="portfolio-modal-label">Company Name</label>
                  <input
                    type="text"
                    className="portfolio-modal-input"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g., Apple Inc."
                    required
                  />
                </div>
                <div className="portfolio-modal-group">
                  <label className="portfolio-modal-label">Sector</label>
                  <input
                    type="text"
                    className="portfolio-modal-input"
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    placeholder="e.g., Technology"
                  />
                </div>
                <div className="portfolio-modal-group">
                  <label className="portfolio-modal-label">Exchange</label>
                  <select
                    className="portfolio-modal-input"
                    value={formData.exchange}
                    onChange={(e) => setFormData({ ...formData, exchange: e.target.value })}
                  >
                    <option value="NSE">NSE</option>
                    <option value="BSE">BSE</option>
                    <option value="NASDAQ">NASDAQ</option>
                    <option value="NYSE">NYSE</option>
                  </select>
                </div>
              </div>
              <div className="portfolio-modal-actions">
                <button type="button" className="portfolio-modal-cancel" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="portfolio-modal-save">
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default MasterStocks;