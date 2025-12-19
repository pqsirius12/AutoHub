import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Dashboard() {
    const [stats, setStats] = useState({ totalCars: 0, availableCars: 0, activeBookings: 0, revenue: 0 });
    const [recentCars, setRecentCars] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [carsRes, bookingsRes] = await Promise.all([
                    fetch('/api/cars'),
                    fetch('/api/bookings')
                ]);
                const cars = await carsRes.json();
                const bookings = await bookingsRes.json();

                const totalCars = cars.length;
                const availableCars = cars.filter(c => c.availability === 'Available').length;
                const activeBookings = bookings.length;

                const todayStr = new Date().toISOString().split('T')[0];
                const revenue = bookings.reduce((sum, b) => {
                    if (b.status === 'Active' && b.startDate <= todayStr && b.endDate >= todayStr) {
                        // Find car price. If not in booking (it should be in real app, but using logic from before)
                        // Actually in db.js booking has totalPrice, but daily revenue needs logic.
                        // The original log was:
                        // const car = cars.find(c => c.id == b.carId);
                        // return sum + (car ? (Number(car.pricePerDay) || 0) : 0);
                        // However, let's keep it simple for now or fetch detailed logic.
                        // We'll estimate daily revenue = total active bookings * average price?
                        // No let's stick to original logic:
                        const car = cars.find(c => c.id == b.carId);
                        return sum + (car ? (Number(car.pricePerDay) || 0) : 0);
                    }
                    return sum;
                }, 0);

                setStats({ totalCars, availableCars, activeBookings, revenue });
                setRecentCars(cars.slice(0, 3));
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="loading-spinner"></div>;

    return (
        <div className="fade-in">
            <h2 className="page-title">Dashboard</h2>
            <div className="stat-card-grid">
                <div className="stat-card">
                    <div className="stat-icon"><i className="fa-solid fa-car"></i></div>
                    <div className="stat-content">
                        <h4>Total Cars</h4>
                        <div className="value">{stats.totalCars}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><i className="fa-solid fa-circle-check"></i></div>
                    <div className="stat-content">
                        <h4>Available</h4>
                        <div className="value">{stats.availableCars}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><i className="fa-solid fa-calendar-check"></i></div>
                    <div className="stat-content">
                        <h4>Active Bookings</h4>
                        <div className="value">{stats.activeBookings}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><i className="fa-solid fa-coins"></i></div>
                    <div className="stat-content">
                        <h4>Daily Revenue</h4>
                        <div className="value">₹ {stats.revenue.toLocaleString('en-IN')}</div>
                    </div>
                </div>
            </div>

            <h3 style={{ marginBottom: '1.5rem' }}>Recent Arrivals</h3>
            <div className="card-grid">
                {recentCars.map(car => (
                    <div key={car.id} className="car-card">
                        <div className="car-image-container">
                            <img src={car.image} alt={car.model} />
                            {car.availability !== 'Available' && (
                                <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600 }}>Booked</div>
                            )}
                        </div>
                        <div className="car-info">
                            <span className="car-type">{car.type}</span>
                            <h3>{car.model}</h3>
                            <div className="car-specs">
                                {car.specs && Object.values(car.specs).slice(0, 2).map((spec, i) => (
                                    <span key={i} className="spec-badge">{spec}</span>
                                ))}
                            </div>
                            <div className="car-footer">
                                <div className="price">
                                    ₹ {car.pricePerDay.toLocaleString('en-IN')} <span>/ day</span>
                                </div>
                            </div>
                            <div className="actions" style={{ marginTop: '1rem' }}>
                                <Link to="/showroom" className="book-btn" style={{ width: '100%', textAlign: 'center', display: 'block', textDecoration: 'none' }}>View in Showroom</Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Dashboard;
