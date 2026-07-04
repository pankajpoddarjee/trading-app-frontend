import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  Briefcase, 
  History, 
  Wallet, 
  Settings, 
  HelpCircle, 
  BarChart3, 
  Star, 
  Newspaper, 
  Gift,
  FileText
} from 'lucide-react';

const Sidebar = ({ isOpen }: any) => {
  const menu = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: BarChart3, label: 'Markets', path: '/markets' },
    { icon: TrendingUp, label: 'Buy', path: '/buy' },
    { icon: TrendingDown, label: 'Sell', path: '/sell' },
    { icon: Briefcase, label: 'Portfolio', path: '/portfolio' },
    { icon: History, label: 'Transactions', path: '/transactions' },
    { icon: Star, label: 'Watchlist', path: '/watchlist' },
    { icon: Newspaper, label: 'News', path: '/news' },
    { icon: FileText, label: 'Reports', path: '/reports' },
  ];
  const bottom = [
    { icon: Wallet, label: 'Wallet', path: '/wallet' },
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: HelpCircle, label: 'Help', path: '/help' },
  ];

  return (
    <div className={`dash-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-label">Main Menu</div>
      {menu.map((item) => (
        <NavLink 
          key={item.path} 
          to={item.path} 
          className="sidebar-link"
        >
          <item.icon size={20} className="sidebar-icon" /> {item.label}
        </NavLink>
      ))}
      
      <hr className="sidebar-divider" />
      
      <div className="sidebar-label">Account</div>
      {bottom.map((item) => (
        <NavLink 
          key={item.path} 
          to={item.path} 
          className="sidebar-link"
        >
          <item.icon size={20} className="sidebar-icon" /> {item.label}
        </NavLink>
      ))}
      
      {/* Upgrade Box */}
      <div className="sidebar-upgrade">
        <div className="sidebar-upgrade-inner">
          <div className="sidebar-upgrade-icon">
            <Gift size={18} />
          </div>
          <div>
            <div className="sidebar-upgrade-title">Upgrade to Pro</div>
            <div className="sidebar-upgrade-sub">Get advanced features</div>
            <button className="sidebar-upgrade-btn">Upgrade</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;