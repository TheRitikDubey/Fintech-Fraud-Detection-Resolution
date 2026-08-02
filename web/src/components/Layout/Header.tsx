import React from 'react';
import { Search, Bell, HelpCircle, LogOut } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import './Header.css';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const displayName = user?.email ?? 'Admin';
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
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff`}
              alt={displayName}
            />
          </div>
          <span className="user-name">{displayName}</span>
        </div>
        <button className="icon-btn" onClick={logout} aria-label="Log out" title="Log out">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Header;
