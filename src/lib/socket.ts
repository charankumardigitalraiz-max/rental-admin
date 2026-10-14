import { Server as SocketIOServer } from "socket.io";

declare global {
  var io: SocketIOServer | undefined;
}

/**
 * Emit event to all drivers listening for available rides
 */
export function emitNewAvailableRide(rideData: any) {
  if (global.io) {
    global.io.to("available_rides").emit("ride:new_available", rideData);
  }
}

/**
 * Emit event to remove a ride that was accepted or cancelled
 */
export function emitRideTaken(bookingId: string, bookingMongoId?: string) {
  if (global.io) {
    global.io.to("available_rides").emit("ride:taken", {
      bookingId,
      bookingMongoId,
    });
  }
}

/**
 * Emit update for a specific booking (e.g. driver assigned, arriving, trip started)
 */
export function emitBookingUpdate(bookingId: string, eventName: string, data: any) {
  if (global.io) {
    global.io.to(`booking:${bookingId}`).emit(eventName, data);
  }
}
