import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './index.css';
import { useState, useEffect } from 'react';

// Components
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

// Pages
import Dashboard from './pages/Dashboard';
import Showroom from './pages/Showroom';
import Bookings from './pages/Bookings';
import Rentals from './pages/Rentals';
import Customers from './pages/Customers';

function App() {
  const [theme, setTheme] = useState('dark');
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Check for completed rentals on load
  useEffect(() => {
    const checkCompletedRentals = async () => {
      try {
        const res = await fetch('/api/rentals');
        if (res.ok) {
          const rentals = await res.json();
          const today = new Date().toISOString().split('T')[0];
          rentals.forEach(r => {
            if (r.status === 'Active' && r.endDate < today) {
              addNotification({
                type: 'info',
                title: 'Booking Duration Completed',
                message: `Rental for ${r.carName} has ended.`,
                details: {
                  'Car': `${r.carName} (${r.carId})`,
                  'Customer': `${r.customerName} (${r.customerId})`,
                  'Rental ID': r.id
                }
              });
            }
          });
        }
      } catch (e) {
        console.error(e);
      }
    };
    checkCompletedRentals();
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const addNotification = (notif) => {
    const id = Date.now();
    setNotifications(prev => [{ ...notif, id, read: false, time: new Date().toLocaleTimeString() }, ...prev]);
  };

  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <TopBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            theme={theme}
            notifications={notifications}
            setNotifications={setNotifications}
          />
          <div className="content-area">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/showroom" element={<Showroom searchTerm={searchTerm} addNotification={addNotification} />} />
              <Route path="/bookings" element={<Bookings addNotification={addNotification} />} />
              <Route path="/rentals" element={<Rentals />} />
              <Route path="/customers" element={<Customers searchTerm={searchTerm} />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
