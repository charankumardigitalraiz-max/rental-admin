'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseAvailableRidesSocketProps {
  initialRides?: any[];
  onNewRide?: (ride: any) => void;
  onRideTaken?: (data: { bookingId: string; bookingMongoId?: string }) => void;
}

/**
 * Reusable React Hook for Drivers to listen for live available rides
 */
export function useAvailableRidesSocket({
  initialRides = [],
  onNewRide,
  onRideTaken,
}: UseAvailableRidesSocketProps = {}) {
  const [rides, setRides] = useState<any[]>(initialRides);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const socketRef = useRef<Socket | null>(null);

  // Sync initial rides if they change
  useEffect(() => {
    if (initialRides && initialRides.length > 0) {
      setRides(initialRides);
    }
  }, [initialRides]);

  useEffect(() => {
    // Connect to the Socket.io server
    const socket = io({
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      // Join the available_rides room
      socket.emit('join:available_rides');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // ⚡ 1. New available ride broadcasted
    socket.on('ride:new_available', (newRide: any) => {
      setRides((prev) => {
        // Prevent duplicate ride entries
        const exists = prev.some((r) => r.bookingId === newRide.bookingId);
        if (exists) return prev;
        return [newRide, ...prev];
      });

      if (onNewRide) {
        onNewRide(newRide);
      }
    });

    // ⚡ 2. A driver accepted this ride -> remove it immediately
    socket.on('ride:taken', (data: { bookingId: string; bookingMongoId?: string }) => {
      setRides((prev) =>
        prev.filter(
          (r) =>
            r.bookingId !== data.bookingId &&
            r._id !== data.bookingMongoId
        )
      );

      if (onRideTaken) {
        onRideTaken(data);
      }
    });

    return () => {
      socket.emit('leave:available_rides');
      socket.disconnect();
    };
  }, [onNewRide, onRideTaken]);

  return {
    rides,
    setRides,
    isConnected,
    socket: socketRef.current,
  };
}
