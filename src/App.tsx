import { useState } from 'react'
import axios from 'axios'
import { Server, Database, ShieldCheck, Cloud, LayoutGrid } from 'lucide-react'
import { authService, utilService, type BackendType } from './api'
import Navigation from './components/Navigation'
import Rooms from './components/Rooms'
import Bookings from './components/Bookings'
import PaymentList from './components/PaymentList'
import type { UserData, Forecast } from './types'
import './index.css'

function App() {
  const [backend, setBackend] = useState<BackendType>('microservices')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [user, setUser] = useState<UserData | null>(null)
  const [forecasts, setForecasts] = useState<Forecast[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  
  // Form state
  const [username, setUsername] = useState('johndoe')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('password123')

  const handleAuthResult = (data: { token: string; user: UserData }) => {
    localStorage.setItem('token', data.token)
    setUser(data.user)
    fetchForecasts()
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await authService.login(backend, { username, password })
      handleAuthResult(response.data)
    } catch (err: unknown) {
      const errorMsg = axios.isAxiosError(err) ? err.response?.data || err.message : 'Login failed';
      setError(errorMsg);
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await authService.register(backend, { username, email, password })
      handleAuthResult(response.data)
    } catch (err: unknown) {
      const errorMsg = axios.isAxiosError(err) ? err.response?.data || err.message : 'Registration failed';
      setError(errorMsg);
    } finally {
      setLoading(false)
    }
  }

  const fetchForecasts = async () => {
    setLoading(true)
    try {
      const response = await utilService.getWeather(backend, backend === 'microservices' ? 'booking' : 'user')
      setForecasts(response.data)
    } catch (err: unknown) {
      setError('Failed to fetch forecasts. Make sure backend is running.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setForecasts([])
    setActiveTab('dashboard')
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'rooms':
        return <Rooms backend={backend} onSuccess={() => setActiveTab('bookings')} />;
      case 'bookings':
        return <Bookings backend={backend} />;
      case 'payments':
        return <PaymentList backend={backend} />;
      default:
        return (
          <div className="animate-fade-in">
            <div className="glass-card" style={{ marginBottom: '2rem' }}>
              <h3>Weather Service Status</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Fetching live data from {backend} via authenticated endpoints.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                {forecasts.map((f, i) => (
                  <div key={i} className="glass-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <Cloud color="var(--text-muted)" />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.date}</span>
                    </div>
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{f.temperatureC}°C</h2>
                    <p style={{ fontWeight: 600 }}>{f.summary}</p>
                  </div>
                ))}
              </div>
              
              {forecasts.length === 0 && (
                <button onClick={fetchForecasts} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                   Refetch Weather
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div className="glass-card" onClick={() => setActiveTab('rooms')} style={{ cursor: 'pointer' }}>
                <h3>Browse Rooms</h3>
                <p style={{ color: 'var(--text-muted)' }}>Explore our premium selection of luxury suites.</p>
              </div>
              <div className="glass-card" onClick={() => setActiveTab('bookings')} style={{ cursor: 'pointer' }}>
                <h3>My Bookings</h3>
                <p style={{ color: 'var(--text-muted)' }}>Manage your existing reservations and status.</p>
              </div>
            </div>
          </div>
        );
    }
  }

  return (
    <div className="animate-fade-in">
      {!user ? (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '80vh', justifyContent: 'center' }}>
          <header style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 800, background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              BookingApp Demo
            </h1>
            <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '1rem auto' }}>
              A powerful demonstration of modernizing a monolithic .NET application into a scalable microservices architecture.
            </p>
            
            <div className="glass-card" style={{ display: 'inline-flex', padding: '0.5rem', gap: '0.5rem', marginTop: '1rem' }}>
              <button className={`btn ${backend === 'monolith' ? 'btn-primary' : ''}`} onClick={() => setBackend('monolith')}>
                <Database size={18} /> Monolith
              </button>
              <button className={`btn ${backend === 'microservices' ? 'btn-primary' : ''}`} onClick={() => setBackend('microservices')}>
                <LayoutGrid size={18} /> Microservices
              </button>
            </div>
          </header>

          <div style={{ maxWidth: '400px', margin: '0 auto', width: '100%' }} className="glass-card">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ background: 'var(--primary)', width: '64px', height: '64px', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <ShieldCheck size={32} color="white" />
              </div>
              <h2>{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
              <p style={{ color: 'var(--text-muted)' }}>{isRegistering ? 'Join our community today' : 'Sign in to access your dashboard'}</p>
            </div>

            <form onSubmit={isRegistering ? handleRegister : handleLogin}>
              <div className="input-group">
                <label>Username</label>
                <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username" />
              </div>
              {isRegistering && (
                <div className="input-group">
                  <label>Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" />
                </div>
              )}
              <div className="input-group">
                <label>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              {error && <p style={{ color: 'var(--error)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}
              <button disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? 'Processing...' : (isRegistering ? 'Create Account' : 'Sign In')}
              </button>
            </form>
            
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <button onClick={() => { setIsRegistering(!isRegistering); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.875rem' }}>
                {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in">
          <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                BookingApp
              </h1>
            </div>
            <div className="glass-card" style={{ padding: '0.25rem', display: 'flex', gap: '0.25rem', fontSize: '0.75rem' }}>
              <button className={`btn ${backend === 'monolith' ? 'btn-primary' : ''}`} style={{ padding: '0.25rem 0.75rem' }} onClick={() => setBackend('monolith')}>Mono</button>
              <button className={`btn ${backend === 'microservices' ? 'btn-primary' : ''}`} style={{ padding: '0.25rem 0.75rem' }} onClick={() => setBackend('microservices')}>Micro</button>
            </div>
          </header>

          <Navigation 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            onLogout={handleLogout} 
            username={user.username} 
          />
          
          <main>
            {renderContent()}
          </main>
        </div>
      )}

      <footer style={{ marginTop: '4rem', paddingBottom: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Server size={14} /> Backend: {backend}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShieldCheck size={14} /> JWT Secured</div>
        </div>
        &copy; 2026 BookingApp Migration Project
      </footer>
    </div>
  )
}

export default App
