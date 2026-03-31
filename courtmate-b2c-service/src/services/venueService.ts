import * as venueRepository from '../repositories/venueRepository';

export const findNearbyVenues = async (lat: number, lng: number, radiusKm: number) => {
  // Business Logic: Any additional calculations or filtering can go here
  return venueRepository.getNearbyVenues(lat, lng, radiusKm);
};
