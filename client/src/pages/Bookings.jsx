import { useState, useEffect } from 'react';

function Bookings({ addNotification }) {
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        const res = await fetch('/api/bookings');
        const data = await res.json();
        setBookings(data);
    };

    const cancelBooking = async (id) => {
        // if (confirm('Cancel this booking?')) {
        const booking = bookings.find(b => b.id === id); // Get details for notification
        try {
            const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (res.ok) {
                if (addNotification && booking) {
                    addNotification({
                        type: 'info',
                        title: 'Booking Cancelled',
                        message: `Booking for ${booking.carName} cancelled.`,
                        details: {
                            'Car': `${booking.carName}`,
                            'Customer': booking.customerName,
                            'Customer ID': booking.customerId,
                            'Rental ID': data.rentalId || 'N/A'
                        }
                    });
                }
                fetchBookings();
            }
            else alert('Failed to cancel');
        } catch (err) {
            console.error(err);
        }
        // }
    };

    return (
        <div className="fade-in">
            <h2 className="page-title">Bookings</h2>
            {bookings.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '4rem' }}>
                    <i className="fa-solid fa-clipboard-list" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
                    <p>No active bookings found.</p>
                </div>
            ) : (
                <div className="card-grid">
                    {bookings.map(booking => (
                        <div key={booking.id} className="car-card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ marginBottom: '0.5rem' }}>{booking.carName || 'Unknown Car'}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Booked by <b>{booking.customerName}</b></p>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <span className="spec-badge"><i className="fa-regular fa-calendar"></i> {booking.date}</span>
                                <span className="spec-badge"><i className="fa-solid fa-clock"></i> {booking.days} Days</span>
                            </div>
                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className={`status-badge status-${(booking.status || 'active').toLowerCase()}`}>{booking.status || 'Active'}</span>
                                <button className="icon-btn" onClick={() => cancelBooking(booking.id)} style={{ color: '#ef4444', borderColor: '#ef4444' }}>
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Bookings;
