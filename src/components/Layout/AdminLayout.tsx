import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

const AdminLayout = ({ children }: any) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="dash-layout">
      <Header toggleSidebar={() => setIsOpen(!isOpen)} />
      <div className="dash-main">
        <Sidebar isOpen={isOpen} />
        <main className="dash-content">{children}</main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminLayout;