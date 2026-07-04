import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./Layout/AdminLayout";
import { 
  FileText, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Briefcase,
  Calendar,
  Filter,
  Printer,
  Eye
} from "lucide-react";
import { getPortfolio, getTransactions } from "../api/api";

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
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  total_amount: number;
  transaction_date: string; // ✅ Changed from created_at
}

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState<'summary' | 'transactions' | 'pnl'>('summary');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const portfolioRes = await getPortfolio();
      console.log("📥 Portfolio data:", portfolioRes.data);
      
      let transactionsData = [];
      try {
        const transactionsRes = await getTransactions();
        console.log("📥 Transactions data:", transactionsRes.data);
        transactionsData = transactionsRes.data || [];
      } catch (txError) {
        console.error("❌ Transactions error:", txError);
        transactionsData = [];
      }
      
      setHoldings(portfolioRes.data?.holdings || []);
      setTransactions(transactionsData);
    } catch (error) {
      console.error("❌ Error fetching data:", error);
      setHoldings([]);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate Summary
  const totalInvestment = holdings.reduce((sum, h) => sum + h.quantity * h.buy_price, 0);
  const totalCurrentValue = holdings.reduce((sum, h) => sum + h.quantity * h.current_price, 0);
  const totalPnl = totalCurrentValue - totalInvestment;
  const totalPnlPercent = totalInvestment > 0 ? (totalPnl / totalInvestment) * 100 : 0;

  // ✅ Filter transactions by transaction_date
  const filteredTransactions = transactions.filter(t => {
    if (dateRange.from && new Date(t.transaction_date) < new Date(dateRange.from)) return false;
    if (dateRange.to && new Date(t.transaction_date) > new Date(dateRange.to)) return false;
    return true;
  });

  // P&L per stock
  const pnlPerStock = holdings.map(h => ({
    symbol: h.symbol,
    company: h.company_name,
    quantity: h.quantity,
    buyPrice: h.buy_price,
    currentPrice: h.current_price,
    totalCost: h.quantity * h.buy_price,
    currentValue: h.quantity * h.current_price,
    pnl: h.quantity * (h.current_price - h.buy_price),
    pnlPercent: ((h.current_price - h.buy_price) / h.buy_price) * 100,
  }));

  // Download CSV
  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert("No data to download");
      return;
    }
    const headers = Object.keys(data[0] || {});
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => row[h] ?? '').join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading-text">Loading reports...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="reports-container">
        {/* Header */}
        <div className="reports-header">
          <div>
            <h1 className="reports-title">Reports</h1>
            <p className="reports-subtitle">View and download your portfolio reports</p>
          </div>
          <div className="reports-actions">
            <button className="reports-print-btn" onClick={() => window.print()}>
              <Printer size={18} /> Print
            </button>
          </div>
        </div>

        {/* Report Type Tabs */}
        <div className="reports-tabs">
          <button 
            className={`reports-tab ${reportType === 'summary' ? 'active' : ''}`}
            onClick={() => setReportType('summary')}
          >
            <Briefcase size={18} /> Summary
          </button>
          <button 
            className={`reports-tab ${reportType === 'transactions' ? 'active' : ''}`}
            onClick={() => setReportType('transactions')}
          >
            <FileText size={18} /> Transactions
          </button>
          <button 
            className={`reports-tab ${reportType === 'pnl' ? 'active' : ''}`}
            onClick={() => setReportType('pnl')}
          >
            <TrendingUp size={18} /> P&L Report
          </button>
        </div>

        {/* Summary Report */}
        {reportType === 'summary' && (
          <div className="reports-summary">
            <div className="reports-summary-grid">
              <div className="reports-summary-card">
                <span className="reports-summary-label">Total Investment</span>
                <span className="reports-summary-value">₹{totalInvestment.toLocaleString()}</span>
              </div>
              <div className="reports-summary-card">
                <span className="reports-summary-label">Current Value</span>
                <span className="reports-summary-value">₹{totalCurrentValue.toLocaleString()}</span>
              </div>
              <div className="reports-summary-card">
                <span className="reports-summary-label">Total P&L</span>
                <span className={`reports-summary-value ${totalPnl >= 0 ? 'positive' : 'negative'}`}>
                  {totalPnl >= 0 ? '+' : ''}₹{totalPnl.toLocaleString()}
                </span>
              </div>
              <div className="reports-summary-card">
                <span className="reports-summary-label">P&L %</span>
                <span className={`reports-summary-value ${totalPnlPercent >= 0 ? 'positive' : 'negative'}`}>
                  {totalPnlPercent >= 0 ? '+' : ''}{totalPnlPercent.toFixed(2)}%
                </span>
              </div>
            </div>

            <div className="reports-table-container">
              <div className="reports-table-header">
                <h3>Holdings Summary</h3>
                <button 
                  className="reports-download-btn"
                  onClick={() => downloadCSV(holdings, 'portfolio_summary')}
                >
                  <Download size={16} /> Download CSV
                </button>
              </div>
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Company</th>
                    <th>Quantity</th>
                    <th>Buy Price</th>
                    <th>Current Price</th>
                    <th>Total Value</th>
                    <th>P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((h) => {
                    const pnl = h.quantity * (h.current_price - h.buy_price);
                    return (
                      <tr key={h.id}>
                        <td>{h.symbol}</td>
                        <td>{h.company_name}</td>
                        <td>{h.quantity}</td>
                        <td>₹{h.buy_price.toFixed(2)}</td>
                        <td>₹{h.current_price.toFixed(2)}</td>
                        <td>₹{(h.quantity * h.current_price).toFixed(2)}</td>
                        <td className={pnl >= 0 ? 'positive' : 'negative'}>
                          {pnl >= 0 ? '+' : ''}₹{pnl.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Transactions Report */}
        {reportType === 'transactions' && (
          <div className="reports-transactions">
            <div className="reports-filter">
              <div className="reports-filter-group">
                <label>From</label>
                <input 
                  type="date" 
                  className="reports-filter-input"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                />
              </div>
              <div className="reports-filter-group">
                <label>To</label>
                <input 
                  type="date" 
                  className="reports-filter-input"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                />
              </div>
              <button 
                className="reports-filter-btn"
                onClick={() => setDateRange({ from: '', to: '' })}
              >
                Clear
              </button>
            </div>

            <div className="reports-table-container">
              <div className="reports-table-header">
                <h3>Transaction History</h3>
                <button 
                  className="reports-download-btn"
                  onClick={() => downloadCSV(filteredTransactions, 'transactions')}
                >
                  <Download size={16} /> Download CSV
                </button>
              </div>
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Transaction Date</th>
                    <th>Symbol</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {!transactions || transactions.length === 0 ? (
                    <tr><td colSpan={6} className="reports-empty">No transactions found</td></tr>
                  ) : filteredTransactions.length === 0 ? (
                    <tr><td colSpan={6} className="reports-empty">No transactions in selected date range</td></tr>
                  ) : (
                    filteredTransactions.map((t) => {
                      const price = typeof t.price === 'number' ? t.price : parseFloat(String(t.price)) || 0;
                      const totalAmount = typeof t.total_amount === 'number' ? t.total_amount : parseFloat(String(t.total_amount)) || 0;
                      const quantity = typeof t.quantity === 'number' ? t.quantity : parseInt(String(t.quantity)) || 0;
                      const date = t.transaction_date ? new Date(t.transaction_date).toLocaleDateString('en-IN') : 'N/A';
                      
                      return (
                        <tr key={t.id}>
                          <td>{date}</td>
                          <td>{t.symbol || 'N/A'}</td>
                          <td className={t.type === 'BUY' ? 'positive' : 'negative'}>
                            {t.type || 'N/A'}
                          </td>
                          <td>{quantity}</td>
                          <td>₹{price.toFixed(2)}</td>
                          <td>₹{totalAmount.toFixed(2)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* P&L Report */}
        {reportType === 'pnl' && (
          <div className="reports-pnl">
            <div className="reports-table-container">
              <div className="reports-table-header">
                <h3>Profit & Loss per Stock</h3>
                <button 
                  className="reports-download-btn"
                  onClick={() => downloadCSV(pnlPerStock, 'pnl_report')}
                >
                  <Download size={16} /> Download CSV
                </button>
              </div>
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Company</th>
                    <th>Quantity</th>
                    <th>Total Cost</th>
                    <th>Current Value</th>
                    <th>P&L</th>
                    <th>P&L %</th>
                  </tr>
                </thead>
                <tbody>
                  {pnlPerStock.length === 0 ? (
                    <tr><td colSpan={7} className="reports-empty">No holdings found</td></tr>
                  ) : (
                    pnlPerStock.map((item) => (
                      <tr key={item.symbol}>
                        <td>{item.symbol}</td>
                        <td>{item.company}</td>
                        <td>{item.quantity}</td>
                        <td>₹{item.totalCost.toFixed(2)}</td>
                        <td>₹{item.currentValue.toFixed(2)}</td>
                        <td className={item.pnl >= 0 ? 'positive' : 'negative'}>
                          {item.pnl >= 0 ? '+' : ''}₹{item.pnl.toFixed(2)}
                        </td>
                        <td className={item.pnlPercent >= 0 ? 'positive' : 'negative'}>
                          {item.pnlPercent >= 0 ? '+' : ''}{item.pnlPercent.toFixed(2)}%
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Reports;