import React from 'react';
import { LayoutGrid,  Bed, CalendarCheck, CreditCard, LogOut } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  username: string;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab, onLogout, username }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'rooms', label: 'Rooms', icon: Bed },
    { id: 'bookings', label: 'My Bookings', icon: CalendarCheck },
    { id: 'payments', label: 'Payments', icon: CreditCard },
  ];

  return (
    <nav className="glass-card" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem' }}>
      <div style={{ display: 'flex', gap: '1rem' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`btn ${activeTab === tab.id ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              style={{ background: activeTab === tab.id ? undefined : 'transparent', color: activeTab === tab.id ? undefined : 'var(--text-muted)' }}
            >
              <Icon size={18} /> {tab.label}
            </button>
          );
        })}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{username}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Online</p>
        </div>
        <button onClick={onLogout} className="btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '0.5rem' }}>
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
