import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
    const location = useLocation();

    const isActive = (path) => {
        if (path === '/' && location.pathname === '/') return 'active';
        if (path !== '/' && location.pathname.startsWith(path)) return 'active';
        return '';
    };

    return (
        <nav className="sidebar">
            <div className="brand">
                <i className="fa-solid fa-car-burst"></i>
                <span>AutoHub</span>
            </div>
            <ul className="nav-links">
                <li className={isActive('/')}>
                    <Link to="/" style={{ display: 'flex', width: '100%', gap: '10px', alignItems: 'center' }}>
                        <i className="fa-solid fa-gauge-high"></i> Dashboard
                    </Link>
                </li>
                <li className={isActive('/showroom')}>
                    <Link to="/showroom" style={{ display: 'flex', width: '100%', gap: '10px', alignItems: 'center' }}>
                        <i className="fa-solid fa-car"></i> Showroom
                    </Link>
                </li>
                <li className={isActive('/bookings')}>
                    <Link to="/bookings" style={{ display: 'flex', width: '100%', gap: '10px', alignItems: 'center' }}>
                        <i className="fa-solid fa-calendar-check"></i> Bookings
                    </Link>
                </li>
                <li className={isActive('/rentals')}>
                    <Link to="/rentals" style={{ display: 'flex', width: '100%', gap: '10px', alignItems: 'center' }}>
                        <i className="fa-solid fa-file-contract"></i> Rentals
                    </Link>
                </li>
                <li className={isActive('/customers')}>
                    <Link to="/customers" style={{ display: 'flex', width: '100%', gap: '10px', alignItems: 'center' }}>
                        <i className="fa-solid fa-users"></i> Customers
                    </Link>
                </li>
            </ul>
            <div className="user-profile">
                <img src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=100&auto=format&fit=crop"
                    alt="User" />
                <div className="user-info">
                    <span className="name">Admin User</span>
                    <span className="role">Manager</span>
                </div>
            </div>
        </nav>
    );
}

export default Sidebar;
