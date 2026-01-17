export interface UserData {
  id: number;
  username: string;
  email: string;
}

export interface RoomDto {
  id: number;
  name: string;
  description: string;
  pricePerNight: number;
  isAvailable: boolean;
}

export interface BookingDto {
  id: number;
  roomId: number;
  userId: number;
  checkInDate: string;
  checkOutDate: string;
  isCancelled: boolean;
}

export interface PaymentDto {
  id: number;
  bookingId: number;
  amount: number;
  paymentDate: string;
  status: string;
}

export interface Forecast {
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary: string;
}
