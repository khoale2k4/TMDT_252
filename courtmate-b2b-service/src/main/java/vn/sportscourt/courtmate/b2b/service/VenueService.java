package vn.sportscourt.courtmate.b2b.service;

import vn.sportscourt.courtmate.b2b.entity.Venue;
import java.util.List;

public interface VenueService {
    List<Venue> getAllVenues();
    Venue createVenue(Venue venue);
}
