import React, { useCallback, useEffect, useState } from 'react';
import { XCircle, CreditCard, X } from 'lucide-react';
import { bookingService, paymentService, type BackendType } from '../api';
import type { BookingDto } from '../types';

interface BookingsProps {
  backend: BackendType;
}

const Bookings: React.FC<BookingsProps> = ({ backend }) => {
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Payment Modal state
  const [payingBooking, setPayingBooking] = useState<BookingDto | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(100);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await bookingService.getAll(backend);
      setBookings(response.data);
    } catch (err: any) {
      setError("Failed to fetch bookings");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [backend]);

  useEffect(() => {
    fetchBookings();
  }, [backend, fetchBookings]);

  const handleCancel = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingService.cancel(backend, id);
      alert('Booking cancelled');
      fetchBookings();
    } catch (err: any) {
      alert(err.response?.data || 'Cancellation failed');
    }
  };

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingBooking) return;
    try {
      await paymentService.add(backend, { bookingId: payingBooking.id, amount: paymentAmount });
      alert('Payment successful!');
      setPayingBooking(null);
      fetchBookings();
    } catch (err: any) {
      alert(err.response?.data || 'Payment failed');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading bookings...</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>My Bookings</h2>
        <button className="btn btn-primary" onClick={fetchBookings}>Refresh</button>
      </div>

      {error && <p style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</p>}

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
              <th style={{ padding: '1.25rem' }}>ID</th>
              <th style={{ padding: '1.25rem' }}>Room ID</th>
              <th style={{ padding: '1.25rem' }}>Check In</th>
              <th style={{ padding: '1.25rem' }}>Check Out</th>
              <th style={{ padding: '1.25rem' }}>Status</th>
              <th style={{ padding: '1.25rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '1.25rem' }}>#{booking.id}</td>
                <td style={{ padding: '1.25rem' }}>Room {booking.roomId}</td>
                <td style={{ padding: '1.25rem' }}>{new Date(booking.checkInDate).toLocaleDateString()}</td>
                <td style={{ padding: '1.25rem' }}>{new Date(booking.checkOutDate).toLocaleDateString()}</td>
                <td style={{ padding: '1.25rem' }}>
                  <span className={`badge`} style={{ background: booking.isCancelled ? 'var(--error)' : 'var(--success)' }}>
                    {booking.isCancelled ? 'Cancelled' : 'Active'}
                  </span>
                </td>
                <td style={{ padding: '1.25rem', display: 'flex', gap: '0.5rem' }}>
                  {!booking.isCancelled && (
                    <>
                      <button className="btn" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '0.4rem 0.8rem' }} onClick={() => setPayingBooking(booking)}>
                        <CreditCard size={14} /> Pay
                      </button>
                      <button className="btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '0.4rem 0.8rem' }} onClick={() => handleCancel(booking.id)}>
                        <XCircle size={14} /> Cancel
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No bookings found.
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {payingBooking && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3>Make Payment for #{payingBooking.id}</h3>
              <button onClick={() => setPayingBooking(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                <X />
              </button>
            </div>

            <form onSubmit={handlePaySubmit}>
              <div className="input-group">
                <label>Amount to Pay ($)</label>
                <input type="number" value={paymentAmount} onChange={e => setPaymentAmount(Number(e.target.value))} required />
              </div>
              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                <button type="button" className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.05)' }} onClick={() => setPayingBooking(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>Confirm Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
