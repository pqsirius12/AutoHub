import { useState, useEffect } from 'react';

const Customers = ({ searchTerm }) => {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        fetch('/api/customers')
            .then(res => res.json())
            .then(data => setCustomers(data))
            .catch(err => console.error(err));
    }, []);

    // Filter customers
    const filteredCustomers = customers.filter(c => {
        const lowerSearch = (searchTerm || '').toLowerCase();
        return c.name.toLowerCase().includes(lowerSearch) || c.id.toLowerCase().includes(lowerSearch);
    });

    const viewHistory = async (customer) => {
        setSelectedCustomer(customer);
        const res = await fetch('/api/rentals');
        const rentals = await res.json();
        const userRentals = rentals.filter(r => r.customerId === customer.id);

        // Calculate detailed bills
        const historyWithBills = userRentals.map(r => {
            let amountPaid = 0;
            let durationDetails = '';
            // Better way: totalPrice is stored. 
            // Logic:
            // 1. If Completed (implied if not Active/Cancelled? No status is Active/Cancelled). 
            //    Actually in our DB status is Active or Cancelled. We assume Active + past endDate = Completed?
            //    Let's stick to status.

            const start = new Date(r.startDate);
            const end = new Date(r.endDate);
            const today = new Date();

            // If we don't have pricePerDay stored in rental, we can re-calc from totalPrice / days
            const daysTotal = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
            const p_per_day = r.totalPrice ? (r.totalPrice / daysTotal) : 0;

            if (r.status === 'Cancelled' && r.cancelledAt) {
                const cancelDate = new Date(r.cancelledAt);
                // Days active before cancellation
                const daysActive = Math.max(0, Math.floor((cancelDate - start) / (1000 * 60 * 60 * 24)));
                amountPaid = Math.floor(daysActive * p_per_day);
                durationDetails = `Cancelled on ${cancelDate.toISOString().split('T')[0]}. Paid for ${daysActive} days.`;
            } else if (r.status === 'Active') {
                // Check if it's actually completed (date passed)
                if (today > end) {
                    amountPaid = r.totalPrice;
                    durationDetails = `Completed. Full amount paid.`;
                } else {
                    // Still active, pay so far
                    const daysSoFar = Math.max(0, Math.floor((today - start) / (1000 * 60 * 60 * 24)));
                    amountPaid = Math.floor(daysSoFar * p_per_day);
                    durationDetails = `Active. Paid for ${daysSoFar} days so far.`;
                }
            } else {
                amountPaid = r.totalPrice;
                durationDetails = 'Completed';
            }

            return { ...r, amountPaid, durationDetails };
        });

        setHistory(historyWithBills);
    };

    const closeHistory = () => {
        setSelectedCustomer(null);
        setHistory([]);
    };

    return (
        <div className="fade-in">
            <h2 className="page-title">Customer Profiles</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Click on a customer to view their purchase history.</p>

            {filteredCustomers.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '4rem' }}>
                    <i className="fa-solid fa-users" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
                    <p>No customers found matching your search.</p>
                </div>
            ) : (
                <div className="card-grid">
                    {filteredCustomers.map(c => (
                        <div key={c.id} className="car-card customer-card" onClick={() => viewHistory(c)} style={{ padding: '1.5rem', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}>
                            <div className="stat-icon" style={{ margin: '0 auto 1rem', width: '60px', height: '60px', fontSize: '1.5rem' }}><i className="fa-solid fa-user"></i></div>
                            <h3>{c.name}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>ID: {c.id}</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Joined: {c.joinedDate || 'Unknown'}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal code remains same, handled by multi_replace logic if needed but mostly same */}


            {selectedCustomer && (
                <div className="modal-overlay" onClick={(e) => { if (e.target.className === 'modal-overlay') closeHistory() }}>
                    <div className="modal-content" style={{ maxWidth: '700px' }}>
                        <span className="close-modal" onClick={closeHistory}>&times;</span>
                        <h2>{selectedCustomer.name}'s History</h2>

                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '2rem', marginTop: '1.5rem' }}>
                            <div>
                                <small style={{ color: 'var(--text-muted)' }}>Member Since</small>
                                <div>{selectedCustomer.joinedDate || 'Unknown'}</div>
                            </div>
                            <div>
                                <small style={{ color: 'var(--text-muted)' }}>Total Bookings</small>
                                <div>{history.length}</div>
                            </div>
                            <div>
                                <small style={{ color: 'var(--text-muted)' }}>Customer ID</small>
                                <div>{selectedCustomer.id}</div>
                            </div>
                        </div>

                        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Billing & Rental Records</h3>
                        {history.length === 0 ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No purchase history found.</p>
                        ) : (
                            <div className="card-grid" style={{ gridTemplateColumns: '1fr' }}>
                                {history.map(r => (
                                    <div key={r.id} className="car-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ marginBottom: '0.2rem' }}>Rental #{r.id}</h4>
                                            <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{r.carName}</p>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{r.startDate} to {r.endDate}</p>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.2rem' }}>{r.durationDetails}</p>
                                        </div>
                                        <div style={{ textAlign: 'right', minWidth: '100px' }}>
                                            <span className={`status-badge status-${(r.status || 'active').toLowerCase()}`} style={{ fontSize: '0.8rem' }}>{r.status || 'Active'}</span>
                                            <div style={{ fontWeight: 'bold', marginTop: '0.5rem' }}>
                                                Total: ₹ {r.totalPrice ? r.totalPrice.toLocaleString() : 0}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: '#10b981' }}>
                                                Paid: ₹ {r.amountPaid ? r.amountPaid.toLocaleString() : 0}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Customers;
