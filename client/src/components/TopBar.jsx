import { useState } from 'react';

function TopBar({ searchTerm, setSearchTerm, notifications, setNotifications }) { // Removed toggleTheme, theme
    const [showNotifications, setShowNotifications] = useState(false);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleBellClick = () => {
        setShowNotifications(!showNotifications);
        if (!showNotifications && unreadCount > 0) {
            // Mark all as read when opening? Or maybe just leave them.
            // Let's mark them as read for UI simplicity after a slight delay or just keep logic simple for now.
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }
    };

    return (
        <header className="top-bar">
            <div className="search-bar">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input
                    type="text"
                    placeholder="Search cars, customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="actions" style={{ display: 'flex', position: 'relative' }}>
                <button className="icon-btn" onClick={handleBellClick} style={{ position: 'relative' }}>
                    <i className="fa-solid fa-bell"></i>
                    {unreadCount > 0 && (
                        <span style={{
                            position: 'absolute',
                            top: '-5px',
                            right: '-5px',
                            background: '#ef4444',
                            color: 'white',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            fontSize: '0.7rem',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>{unreadCount}</span>
                    )}
                </button>
                {/* Removed Settings Button */}

                {showNotifications && (
                    <div style={{
                        position: 'absolute',
                        top: '60px',
                        right: '0',
                        background: '#1e1e1e', // Hardcoded dark theme bg or var(--bg-card)
                        backgroundColor: 'var(--bg-card)',
                        border: 'var(--glass-border)',
                        padding: '1rem',
                        borderRadius: '12px',
                        width: '350px',
                        zIndex: 100,
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                        maxHeight: '400px',
                        overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h4 style={{ margin: 0 }}>Notifications</h4>
                            {notifications.length > 0 && (
                                <button
                                    onClick={() => setNotifications([])}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}
                                >
                                    Clear All
                                </button>
                            )}
                        </div>

                        {notifications.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem' }}>No notifications</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {notifications.map(notif => (
                                    <div key={notif.id} style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        padding: '0.8rem',
                                        borderRadius: '8px',
                                        borderLeft: `3px solid ${notif.title.includes('Cancelled') ? '#ef4444' : '#10b981'}`
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                            <strong style={{ fontSize: '0.9rem' }}>{notif.title}</strong>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{notif.time}</span>
                                        </div>
                                        <p style={{ fontSize: '0.85rem', margin: '0 0 0.5rem 0', color: '#ccc' }}>{notif.message}</p>

                                        {notif.details && (
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.2rem 0.5rem' }}>
                                                {Object.entries(notif.details).map(([key, value]) => (
                                                    <div key={key} style={{ display: 'contents' }}>
                                                        <span>{key}:</span>
                                                        <span style={{ color: '#eee' }}>{value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}

export default TopBar;
