import { useState, useEffect } from 'react';

const Showroom = ({ searchTerm, addNotification }) => {
    const [cars, setCars] = useState([]);
    const [filter, setFilter] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false); // History Modal State
    const [selectedCar, setSelectedCar] = useState(null);
    const [carHistory, setCarHistory] = useState([]); // Store history for selected car

    // Add Car Form State
    const [newCar, setNewCar] = useState({ model: '', type: 'Sports Car', pricePerDay: '', image: '', specs: '' });

    // Booking Form State
    const [bookingData, setBookingData] = useState({
        customerType: 'new', customerName: '', customerId: '', date: '', days: 1
    });

    useEffect(() => {
        fetchCars();
    }, []);

    const fetchCars = async () => {
        try {
            const res = await fetch('/api/cars');
            const data = await res.json();
            setCars(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`/api/cars/${id}`, { method: 'DELETE' });
            if (res.ok) fetchCars();
            else alert('Failed to delete');
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddCar = async (e) => {
        e.preventDefault();
        try {
            // Map comma separated string to features array for schema compatibility
            const featuresArray = newCar.specs.split(',').map(s => s.trim()).filter(s => s);

            const res = await fetch('/api/cars', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newCar,
                    pricePerDay: Number(newCar.pricePerDay),
                    specs: { features: featuresArray } // Use features array
                })
            });

            if (res.ok) {
                setShowAddModal(false);
                setNewCar({ model: '', type: 'Sports Car', pricePerDay: '', image: '', specs: '' });
                fetchCars();
            } else {
                alert('Failed to add car');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const openBooking = (car) => {
        setSelectedCar(car);
        setShowBookingModal(true);
    };

    const openHistory = async (car) => {
        setSelectedCar(car);
        try {
            const res = await fetch('/api/rentals');
            const rentals = await res.json();
            // Filter rentals for this car
            const history = rentals.filter(r => r.carId === car.id);
            setCarHistory(history);
            setShowHistoryModal(true);
        } catch (err) {
            console.error("Failed to fetch history", err);
        }
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            carId: selectedCar.id,
            carName: selectedCar.model,
            ...bookingData,
            days: Number(bookingData.days)
        };

        if (payload.customerType === 'new') delete payload.customerId;
        if (payload.customerType === 'existing') delete payload.customerName;

        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (res.ok) {
                if (data.newCustomerId) alert(`Booking Success! Customer ID: ${data.newCustomerId}`);
                else alert('Booking Success!');

                // Trigger Notification
                /* 
                  It should show:
                  Cancelled/Booking Successful
                  Car: name and id if exists
                  Customer name: 
                  Cuastomer ID:
                  Rental ID:
                */
                if (addNotification) { // check if function exists
                    addNotification({
                        type: 'success',
                        title: 'Booking Successful',
                        message: `Booking created for ${data.carName}`,
                        details: {
                            'Car': `${data.carName} (ID: ${data.carId})`,
                            'Customer Name': data.customerName,
                            'Customer ID': data.customerId,
                            'Rental ID': data.rentalId || 'N/A'
                        }
                    });
                }

                setShowBookingModal(false);
                fetchCars(); // Refresh availability
            } else {
                alert(data.error || 'Booking Failed');
            }
        } catch (err) {
            console.error(err);
            alert('Booking Error');
        }
    };

    // Filter by availability AND search term
    const filteredCars = cars.filter(c => {
        const matchesFilter = filter === 'all' || c.availability === filter;
        const lowerSearch = (searchTerm || '').toLowerCase();
        const matchesSearch = c.model.toLowerCase().includes(lowerSearch) || c.type.toLowerCase().includes(lowerSearch);
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 className="page-title" style={{ marginBottom: 0 }}>Showroom Listings</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <select value={filter} onChange={(e) => setFilter(e.target.value)} className="custom-select">
                        <option value="all">All Cars</option>
                        <option value="Available">Available Only</option>
                        <option value="Booked">Booked Only</option>
                    </select>
                    <button onClick={() => setShowAddModal(true)} className="book-btn" style={{ background: '#10b981' }}><i className="fa-solid fa-plus"></i> Add Car</button>
                </div>
            </div>

            <div className="card-grid">
                {filteredCars.map(car => (
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
                                    ₹ {car.pricePerDay ? car.pricePerDay.toLocaleString('en-IN') : 'N/A'} <span>/ day</span>
                                </div>
                            </div>
                            <div className="actions" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                <button
                                    className="book-btn"
                                    disabled={car.availability !== 'Available'}
                                    onClick={() => openBooking(car)}
                                    style={{ flex: 1 }}
                                >
                                    {car.availability === 'Available' ? 'Book Now' : 'Booked'}
                                </button>
                                <button
                                    onClick={() => openHistory(car)}
                                    style={{
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--primary)',
                                        color: 'var(--primary)',
                                        borderRadius: '10px',
                                        padding: '0 1rem',
                                        cursor: 'pointer'
                                    }}
                                    title="View History"
                                >
                                    <i className="fa-solid fa-clock-rotate-left"></i>
                                </button>
                                <button className="delete-car-btn" onClick={() => handleDelete(car.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0 0.5rem' }}>
                                    <i className="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Car Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={(e) => { if (e.target.className === 'modal-overlay') setShowAddModal(false) }}>
                    <div className="modal-content">
                        <span className="close-modal" onClick={() => setShowAddModal(false)}>&times;</span>
                        <h2>Add New Car</h2>
                        <form onSubmit={handleAddCar}>
                            <div className="form-group">
                                <label>Model Name</label>
                                <input type="text" value={newCar.model} onChange={e => setNewCar({ ...newCar, model: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Type</label>
                                <select value={newCar.type} onChange={e => setNewCar({ ...newCar, type: e.target.value })}>
                                    <option value="Sports Car">Sports Car</option>
                                    <option value="Luxury Sedan">Luxury Sedan</option>
                                    <option value="SUV">SUV</option>
                                    <option value="Electric">Electric</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Price Per Day</label>
                                <input type="number" value={newCar.pricePerDay} onChange={e => setNewCar({ ...newCar, pricePerDay: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Image URL</label>
                                <input type="url" value={newCar.image} onChange={e => setNewCar({ ...newCar, image: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Specs (comma separated)</label>
                                <input type="text" value={newCar.specs} onChange={e => setNewCar({ ...newCar, specs: e.target.value })} placeholder="V8, 200mph..." />
                            </div>
                            <button type="submit" className="submit-btn" style={{ background: '#10b981' }}>Add Vehicle</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Booking Modal */}
            {showBookingModal && (
                <div className="modal-overlay" onClick={(e) => { if (e.target.className === 'modal-overlay') setShowBookingModal(false) }}>
                    <div className="modal-content">
                        <span className="close-modal" onClick={() => setShowBookingModal(false)}>&times;</span>
                        <h2>Book {selectedCar?.model}</h2>
                        <form onSubmit={handleBookingSubmit}>
                            <div className="form-group">
                                <label>Customer Type</label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <label><input type="radio" name="ctype" checked={bookingData.customerType === 'new'} onChange={() => setBookingData({ ...bookingData, customerType: 'new' })} /> New Customer</label>
                                    <label><input type="radio" name="ctype" checked={bookingData.customerType === 'existing'} onChange={() => setBookingData({ ...bookingData, customerType: 'existing' })} /> Existing</label>
                                </div>
                            </div>
                            {bookingData.customerType === 'new' ? (
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input type="text" value={bookingData.customerName} onChange={e => setBookingData({ ...bookingData, customerName: e.target.value })} required />
                                </div>
                            ) : (
                                <div className="form-group">
                                    <label>Customer ID</label>
                                    <input type="text" value={bookingData.customerId} onChange={e => setBookingData({ ...bookingData, customerId: e.target.value })} required />
                                </div>
                            )}
                            <div className="form-group">
                                <label>Date</label>
                                <input type="date" value={bookingData.date} onChange={e => setBookingData({ ...bookingData, date: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Days</label>
                                <input type="number" min="1" value={bookingData.days} onChange={e => setBookingData({ ...bookingData, days: e.target.value })} required />
                            </div>
                            <button type="submit" className="submit-btn">Confirm Booking</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Car History Modal */}
            {showHistoryModal && (
                <div className="modal-overlay" onClick={(e) => { if (e.target.className === 'modal-overlay') setShowHistoryModal(false) }}>
                    <div className="modal-content" style={{ maxWidth: '600px' }}>
                        <span className="close-modal" onClick={() => setShowHistoryModal(false)}>&times;</span>
                        <h2>History: {selectedCar?.model}</h2>
                        {carHistory.length === 0 ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '2rem 0' }}>No booking history found for this vehicle.</p>
                        ) : (
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {carHistory.map(rent => {
                                    const start = new Date(rent.startDate);
                                    const end = new Date(rent.endDate);
                                    const cancelDate = rent.cancelledAt ? new Date(rent.cancelledAt) : null;
                                    const days = Math.round((end - start) / (1000 * 60 * 60 * 24));

                                    let activeDuration = null;
                                    if (rent.status === 'Cancelled' && cancelDate) {
                                        const activeDays = Math.max(0, Math.floor((cancelDate - start) / (1000 * 60 * 60 * 24)));
                                        activeDuration = `Cancelled after ${activeDays} days`;
                                    }

                                    return (
                                        <div key={rent.id} style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            padding: '1rem',
                                            borderRadius: '8px',
                                            marginBottom: '0.8rem',
                                            borderLeft: rent.status === 'Cancelled' ? '3px solid #ef4444' : '3px solid #10b981'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span style={{ fontWeight: 600 }}>{rent.customerName || 'Unknown'} <span style={{ fontSize: '0.8em', color: 'var(--text-muted)', fontWeight: 400 }}>(ID: {rent.customerId})</span></span>
                                                <span className={`status-badge status-${(rent.status || 'active').toLowerCase()}`}>{rent.status}</span>
                                            </div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                                <i className="fa-regular fa-calendar"></i> {rent.startDate} to {rent.endDate} ({days} days)
                                            </div>
                                            {activeDuration && (
                                                <div style={{ fontSize: '0.85rem', color: '#ef4444', marginTop: '0.3rem' }}>
                                                    <i className="fa-solid fa-ban"></i> {activeDuration}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Showroom;
