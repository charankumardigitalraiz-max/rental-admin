import { Server as SocketIOServer } from "socket.io";

declare global {
  var io: SocketIOServer | undefined;
}

/**
 * Emit event to all drivers listening for available rides
 */
export function emitNewAvailableRide(rideData: any) {
  if (global.io) {
    console.log(`📡 [Socket.io Emitted] Event: 'ride:new_available' to room 'available_rides' | BookingId: ${rideData?.bookingId || rideData?._id}`);
    global.io.to("available_rides").emit("ride:new_available", rideData);
  } else {
    console.warn(`⚠️ [Socket.io] global.io is not initialized when emitting ride:new_available`);
  }
}

/**
 * Emit event to remove a ride that was accepted or cancelled
 */
export function emitRideTaken(bookingId: string, bookingMongoId?: string) {
  if (global.io) {
    console.log(`📡 [Socket.io Emitted] Event: 'ride:taken' to room 'available_rides' | BookingId: ${bookingId}`);
    global.io.to("available_rides").emit("ride:taken", {
      bookingId,
      bookingMongoId,
    });
  } else {
    console.warn(`⚠️ [Socket.io] global.io is not initialized when emitting ride:taken`);
  }
}

/**
 * Emit update for a specific booking (e.g. driver assigned, arriving, trip started)
 */
export function emitBookingUpdate(bookingId: string, eventName: string, data: any) {
  if (global.io) {
    console.log(`📡 [Socket.io Emitted] Event: '${eventName}' to room 'booking:${bookingId}'`);
    global.io.to(`booking:${bookingId}`).emit(eventName, data);
  } else {
    console.warn(`⚠️ [Socket.io] global.io is not initialized when emitting ${eventName}`);
  }
}

