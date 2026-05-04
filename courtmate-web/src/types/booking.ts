export type BookingDraft = {
  venueId: string;
  venueName: string;
  venueAddress: string;
  venueImage: string;
  sportType: string;
  courtId: string;
  courtName: string;
  bookingDate: string;
  slotIds: string[];
  slotTimes: string[];
  totalPrice: number;
  durationHours: number;
};
