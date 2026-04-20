package vn.sportscourt.courtmate.b2b.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import vn.sportscourt.courtmate.b2b.dto.response.BookingResponse;
import vn.sportscourt.courtmate.b2b.entity.Booking;
import vn.sportscourt.courtmate.b2b.entity.BookingItem;

@Mapper(componentModel = "spring")
public interface BookingMapper {

    @Mapping(target = "userId",    source = "user.id")
    @Mapping(target = "userName",  source = "user.fullName")
    @Mapping(target = "venueId",   source = "venue.id")
    @Mapping(target = "venueName", source = "venue.name")
    BookingResponse toResponse(Booking booking);

    @Mapping(target = "slotId",    source = "slot.id")
    @Mapping(target = "courtName", source = "slot.court.name")
    @Mapping(target = "date",      source = "slot.date")
    @Mapping(target = "startTime", source = "slot.startTime")
    @Mapping(target = "endTime",   source = "slot.endTime")
    BookingResponse.BookingItemResponse toItemResponse(BookingItem item);
}
