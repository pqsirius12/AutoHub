import { useState, useEffect } from 'react';

function Rentals() {
    const [rentals, setRentals] = useState([]);
    const [cars, setCars] = useState({});

    useEffect(() => {
        const load = async () => {
            const [rentRes, carsRes] = await Promise.all([
                fetch('/api/rentals'),
                fetch('/api/cars')
            ]);
            const rentalsData = await rentRes.json();
            const carsData = await carsRes.json();

            // Create cars map
            const carMap = {};
            carsData.forEach(c => carMap[c.id] = c);

            setRentals(rentalsData);
            setCars(carMap);
        };
        load();
    }, []);

    return (
        <div className="fade-in">
            <h2 className="page-title">Rentals History</h2>
            {rentals.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '4rem' }}>
                    <i className="fa-solid fa-file-contract" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
                    <p>No rental history available.</p>
                </div>
            ) : (
                <div className="card-grid">
                    {rentals.map(r => {
                        const car = cars[r.carId];
                        const carName = r.carName || (car ? car.model : 'Unknown Car');
                        return (
                            <div key={r.id} className="car-card" style={{ padding: '1.5rem' }}>
                                <h3 style={{ marginBottom: '0.5rem' }}>Rental #{r.id}</h3>
                                <p style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.3rem' }}>{carName}</p>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Car ID: {r.carId}</p>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Customer: <b>{r.customerName} (ID: {r.customerId || 'N/A'})</b></p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                    <span>{r.startDate} to {r.endDate}</span>
                                    <span className={`status-badge status-${(r.status || 'active').toLowerCase()}`}>{r.status || 'Active'}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default Rentals;
