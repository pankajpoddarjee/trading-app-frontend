import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="dash-footer">
      <span className="dash-footer-text">© 2026 Suryashakti. All rights reserved.</span>
      <div className="dash-footer-links">
        <button>Privacy</button>
        <span style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.08)' }} />
        <button>Terms</button>
        <span style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.08)' }} />
        <button>Support</button>
        <span style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.08)' }} />
        <span className="dash-footer-heart">Made with <Heart size={14} style={{ color: '#ef4444' }} /> in India</span>
      </div>
    </footer>
  );
};

export default Footer;