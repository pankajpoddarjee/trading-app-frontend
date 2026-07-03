import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './Layout/AdminLayout';
import { Wallet, Briefcase, TrendingUp, Activity, ArrowUpRight, Sparkles } from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/login');
    }
  }, []);

  const stats = [
    { title: 'Total Balance', value: `₹${user?.balance?.toLocaleString() || '1,00,000'}`, icon: Wallet, color: 'blue' },
    { title: 'Portfolio Value', value: '₹0.00', icon: Briefcase, color: 'purple' },
    { title: "Today's P&L", value: '₹0.00', icon: TrendingUp, color: 'green' },
    { title: 'Holdings', value: '0', icon: Activity, color: 'orange' },
  ];

  return (
    <AdminLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="dash-welcome">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} style={{ color: '#fcd34d' }} />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Welcome back!</span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
            Good to see you, {user?.username || 'User'} 👋
          </h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
            You have <strong style={{ color: '#fff' }}>₹{user?.balance?.toLocaleString() || '1,00,000'}</strong> available to trade.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
            <button style={{ padding: '8px 20px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: '#fff', cursor: 'pointer' }}>Buy Stocks</button>
            <button style={{ padding: '8px 20px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: '#fff', cursor: 'pointer' }}>View Portfolio</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {stats.map((stat, index) => (
            <div key={index} className="dash-stat-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: '#6b7280' }}>{stat.title}</p>
                  <p style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginTop: '4px' }}>{stat.value}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 500, color: '#34d399', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <ArrowUpRight size={13} />+0%
                    </span>
                  </div>
                </div>
                <div className={`dash-stat-icon ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div className="dash-quick-action">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={20} style={{ color: '#60a5fa' }} />
              </div>
              <div><p style={{ fontSize: '14px', fontWeight: 500, color: '#fff' }}>Buy Stocks</p><p style={{ fontSize: '12px', color: '#6b7280' }}>Place a buy order</p></div>
            </div>
          </div>
          <div className="dash-quick-action">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(52,211,153,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={20} style={{ color: '#34d399' }} />
              </div>
              <div><p style={{ fontSize: '14px', fontWeight: 500, color: '#fff' }}>Sell Stocks</p><p style={{ fontSize: '12px', color: '#6b7280' }}>Place a sell order</p></div>
            </div>
          </div>
          <div className="dash-quick-action">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={20} style={{ color: '#a78bfa' }} />
              </div>
              <div><p style={{ fontSize: '14px', fontWeight: 500, color: '#fff' }}>Market Analysis</p><p style={{ fontSize: '12px', color: '#6b7280' }}>View market trends</p></div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;