import React from 'react';
import { Search, Bell, HelpCircle } from 'lucide-react';
import './Header.css';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
  return (
    <header className="header">
      <div className="header-left">
        {!isSidebarOpen && (
           <button className="mobile-toggle" onClick={toggleSidebar}>
             ☰
           </button>
        )}
        <div className="search-container">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            placeholder="Search by TXID or Customer ID..." 
            className="search-input"
          />
        </div>
      </div>
      
      <div className="header-right">
        <button className="icon-btn">
          <Bell size={20} />
          <span className="badge"></span>
        </button>
        <button className="icon-btn">
          <HelpCircle size={20} />
        </button>
        
        <div className="user-profile">
          <div className="avatar">
            <img src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff" alt="Admin" />
          </div>
          <span className="user-name">Admin</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
