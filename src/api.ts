import axios from 'axios';

export type BackendType = 'monolith' | 'microservices';

const CONFIG = {
  monolith: "http://localhost:5277",
  userService: "http://localhost:5070",
  bookingService: "http://localhost:5221",
  notificationService: "http://localhost:5222", 
  paymentService: "http://localhost:5223", 
};

export const getApiBase = (type: BackendType, service: 'user' | 'booking' | 'notification' | 'payment' = 'user') => {
  if (type === 'monolith') return CONFIG.monolith;
  
  switch (service) {
    case 'booking': return CONFIG.bookingService;
    case 'notification': return CONFIG.notificationService;
    case 'payment': return CONFIG.paymentService;
    default: return CONFIG.userService;
  }
};

export const createClient = (backend: BackendType, service: 'user' | 'booking' | 'notification' | 'payment' = 'user') => {
  const token = localStorage.getItem('token');
  const client = axios.create({
    baseURL: getApiBase(backend, service),
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  });

  return client;
};

export const authService = {
  login: (backend: BackendType, data: any) => createClient(backend, 'user').post('/api/auth/login', data),
  register: (backend: BackendType, data: any) => createClient(backend, 'user').post('/api/auth/register', data),
};

export const roomService = {
  getAll: (backend: BackendType) => createClient(backend, 'booking').get('/api/rooms'),
  getById: (backend: BackendType, id: number) => createClient(backend, 'booking').get(`/api/rooms/${id}`),
  create: (backend: BackendType, data: any) => createClient(backend, 'booking').post('/api/rooms', data),
};

export const bookingService = {
  getAll: (backend: BackendType) => createClient(backend, 'booking').get('/api/bookings'),
  create: (backend: BackendType, data: any) => createClient(backend, 'booking').post('/api/bookings', data),
  cancel: (backend: BackendType, id: number) => createClient(backend, 'booking').post(`/api/bookings/${id}/cancel`),
};

export const paymentService = {
  getAll: (backend: BackendType) => createClient(backend, 'payment').get('/api/payments'),
  add: (backend: BackendType, data: any) => createClient(backend, 'payment').post('/api/payments', data),
};

export const utilService = {
  getWeather: (backend: BackendType, service: 'user' | 'booking' = 'user') => 
    createClient(backend, service).get('/weatherforecast'),
};
