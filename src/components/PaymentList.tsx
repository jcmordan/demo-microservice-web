import React, { useEffect, useState } from 'react';
import { CreditCard, CheckCircle2 } from 'lucide-react';
import { paymentService, type BackendType } from '../api';
import type { PaymentDto } from '../types';

interface PaymentsProps {
  backend: BackendType;
}

const PaymentList: React.FC<PaymentsProps> = ({ backend }) => {
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPayments();
  }, [backend]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await paymentService.getAll(backend);
      setPayments(response.data);
    } catch (err: any) {
      setError('Failed to fetch payments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading payments...</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Payment History</h2>
        <button className="btn btn-primary" onClick={fetchPayments}>Refresh</button>
      </div>

      {error && <p style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {payments.map((payment) => (
          <div key={payment.id} className="glass-card" style={{ borderLeft: '4px solid var(--success)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                <CreditCard color="var(--success)" size={20} />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {new Date(payment.paymentDate).toLocaleString()}
              </span>
            </div>
            
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Booking #{payment.bookingId}</p>
            <h3 style={{ fontSize: '1.5rem', margin: '0.25rem 0' }}>${payment.amount}</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
              <CheckCircle2 size={16} color="var(--success)" />
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{payment.status}</span>
            </div>
          </div>
        ))}
      </div>

      {payments.length === 0 && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          No payments recorded yet.
        </div>
      )}
    </div>
  );
};

export default PaymentList;
