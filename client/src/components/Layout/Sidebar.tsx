import React from "react";
import { NavLink } from "react-router-dom";
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
  Landmark,
} from "lucide-react";
import "./Sidebar.css";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const [navItemName, setNavItemName] = React.useState("Dashboard");
  const isActive = (path: string) => {
    return window.location.pathname === path;
  };
  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "Transactions",
      path: "/transactions",
      icon: <ArrowRightLeft size={20} />,
    },
    { name: "Alerts", path: "/alerts", icon: <Bell size={20} /> },
    { name: "Cases", path: "/cases", icon: <Briefcase size={20} /> },
    { name: "Reports", path: "/reports", icon: <BarChart2 size={20} /> },
    { name: "Audit Logs", path: "/audit-logs", icon: <History size={20} /> },
  ];

  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
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
            <li key={index} className="nav-item text-red-500">
              <NavLink
                onClick={() => setNavItemName(item.name)}
                to={item.path}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <div
                  className={`nav-link flex justify-center gap-2 ${isActive(item.path) ? "text-blue-400 font-semibold" : ""}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {isOpen && <span className="nav-label">{item.name}</span>}
                </div>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <a href="#" className="nav-item settings-link">
          <span className="nav-icon">
            <Settings size={20} />
          </span>
          {isOpen && <span className="nav-label">Settings</span>}
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
