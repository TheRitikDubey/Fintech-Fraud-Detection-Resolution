import React from 'react';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  Bell, 
  Briefcase, 
  BarChart2, 
  History, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Landmark
} from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Transactions', icon: <ArrowRightLeft size={20} />, active: true },
    { name: 'Alerts', icon: <Bell size={20} /> },
    { name: 'Cases', icon: <Briefcase size={20} /> },
    { name: 'Reports', icon: <BarChart2 size={20} /> },
    { name: 'Audit Logs', icon: <History size={20} /> },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="brand">
          <div className="brand-icon">
            <Landmark size={24} color="#004DFF" />
          </div>
          {isOpen && (
            <div className="brand-text">
              <h2>Fintech Support</h2>
              <span>ADMIN TERMINAL</span>
            </div>
          )}
        </div>
        <button className="toggle-btn" onClick={toggleSidebar}>
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item, index) => (
            <li key={index} className={`nav-item ${item.active ? 'active' : ''}`}>
              <a href="#">
                <span className="nav-icon">{item.icon}</span>
                {isOpen && <span className="nav-label">{item.name}</span>}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <a href="#" className="nav-item settings-link">
          <span className="nav-icon"><Settings size={20} /></span>
          {isOpen && <span className="nav-label">Settings</span>}
        </a>
        {isOpen && (
          <div className="system-status-container">
             {/* Note: In the design, status is at the bottom of the main content area, but putting a compact one here is fine, or we can leave it to the main content. The image shows the system status at the bottom of the entire page or sidebar. It spans across the bottom. */}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
