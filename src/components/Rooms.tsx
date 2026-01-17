import React, { useCallback, useEffect, useState } from "react";
import { Bed, CheckCircle2, XCircle, Plus, X } from "lucide-react";
import { roomService, bookingService, type BackendType } from "../api";
import type { RoomDto } from "../types";

interface RoomsProps {
  backend: BackendType;
  onSuccess?: () => void;
}

const Rooms: React.FC<RoomsProps> = ({ backend, onSuccess }) => {
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create Room state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: "",
    description: "",
    pricePerNight: 0,
  });

  // Booking Modal state
  const [bookingRoom, setBookingRoom] = useState<RoomDto | null>(null);
  const [checkIn, setCheckIn] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [checkOut, setCheckOut] = useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0],
  );

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const response = await roomService.getAll(backend);
      setRooms(response.data);
    } catch (err: any) {
      setError("Failed to fetch rooms");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [backend]);

  useEffect(() => {
    fetchRooms();
  }, [backend, fetchRooms]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await roomService.create(backend, newRoom);
      setShowCreateForm(false);
      setNewRoom({ name: "", description: "", pricePerNight: 0 });
      fetchRooms();
    } catch (err: any) {
      alert(err.response?.data || "Failed to create room");
    }
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingRoom) return;
    try {
      await bookingService.create(backend, {
        roomId: bookingRoom.id,
        checkInDate: new Date(checkIn).toISOString(),
        checkOutDate: new Date(checkOut).toISOString(),
      });
      //   alert("Room booked successfully!");
      setBookingRoom(null);
      fetchRooms();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      alert(err.response?.data || "Booking failed");
    }
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        Loading rooms...
      </div>
    );

  return (
    <div className="animate-fade-in" style={{ position: "relative" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h2>Available Rooms</h2>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            className="btn"
            style={{ background: "rgba(255,255,255,0.05)" }}
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? "Cancel" : "Add New Room"}
          </button>
          <button className="btn btn-primary" onClick={fetchRooms}>
            Refresh
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div
          className="glass-card animate-fade-in"
          style={{ marginBottom: "2rem" }}
        >
          <h3>Create New Room</h3>
          <form
            onSubmit={handleCreateRoom}
            style={{
              marginTop: "1.5rem",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1.5rem",
            }}
          >
            <div className="input-group">
              <label>Room Name</label>
              <input
                required
                value={newRoom.name}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, name: e.target.value })
                }
                placeholder="e.g. Deluxe Suite"
              />
            </div>
            <div className="input-group">
              <label>Price Per Night ($)</label>
              <input
                required
                type="number"
                value={newRoom.pricePerNight}
                onChange={(e) =>
                  setNewRoom({
                    ...newRoom,
                    pricePerNight: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="input-group" style={{ gridColumn: "span 2" }}>
              <label>Description</label>
              <input
                required
                value={newRoom.description}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, description: e.target.value })
                }
                placeholder="Brief description of the room..."
              />
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <button className="btn btn-primary">Create Room</button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <p style={{ color: "var(--error)", marginBottom: "1rem" }}>{error}</p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "2rem",
        }}
      >
        {rooms.map((room) => (
          <div
            key={room.id}
            className="glass-card"
            style={{ display: "flex", flexDirection: "column" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  background: "rgba(99, 102, 241, 0.1)",
                  padding: "0.75rem",
                  borderRadius: "0.75rem",
                }}
              >
                <Bed color="var(--primary)" />
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                  ${room.pricePerNight}
                </p>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  per night
                </p>
              </div>
            </div>

            <h3 style={{ marginBottom: "0.5rem" }}>{room.name}</h3>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.875rem",
                marginBottom: "1.5rem",
                flex: 1,
              }}
            >
              {room.description}
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.875rem",
                }}
              >
                {room.isAvailable ? (
                  <>
                    <CheckCircle2 size={16} color="var(--success)" /> Available
                  </>
                ) : (
                  <>
                    <XCircle size={16} color="var(--error)" /> Occupied
                  </>
                )}
              </div>
              <button
                disabled={!room.isAvailable}
                className="btn btn-primary"
                onClick={() => setBookingRoom(room)}
                style={{
                  padding: "0.5rem 1rem",
                  opacity: room.isAvailable ? 1 : 0.5,
                }}
              >
                <Plus size={18} /> Book Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {bookingRoom && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="glass-card animate-fade-in"
            style={{ width: "100%", maxWidth: "400px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "1.5rem",
              }}
            >
              <h3>Book {bookingRoom.name}</h3>
              <button
                onClick={() => setBookingRoom(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                <X />
              </button>
            </div>

            <form onSubmit={handleBookSubmit}>
              <div className="input-group">
                <label>Check-in Date</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label>Check-out Date</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  required
                />
              </div>
              <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
                <button
                  type="button"
                  className="btn"
                  style={{ flex: 1, background: "rgba(255,255,255,0.05)" }}
                  onClick={() => setBookingRoom(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
