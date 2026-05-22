package vn.sportscourt.courtmate.b2b.mapper;

import org.mapstruct.*;
import vn.sportscourt.courtmate.b2b.dto.request.VenueRequest;
import vn.sportscourt.courtmate.b2b.dto.request.VenueUpdateRequest;
import vn.sportscourt.courtmate.b2b.dto.response.VenueCreateResponse;
import vn.sportscourt.courtmate.b2b.dto.response.VenueResponse;
import vn.sportscourt.courtmate.b2b.entity.Venue;

import java.util.Map;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        uses = {})
public interface VenueMapper {
    @Mapping(target = "venueId",   source = "id")
    @Mapping(target = "ownerId",   source = "owner.id")
    @Mapping(target = "ownerName", source = "owner.fullName")
    VenueResponse toResponse(Venue venue);

    @Mapping(target = "venueId", source = "id")
    @Mapping(target = "status",  expression = "java(venue.getStatus().name())")
    VenueCreateResponse toCreateResponse(Venue venue);

    @Mapping(target = "id",          ignore = true)
    @Mapping(target = "owner",       ignore = true)
    @Mapping(target = "slug",        ignore = true)   // DB trigger generates it
    @Mapping(target = "courts",      ignore = true)
    @Mapping(target = "ratingAvg",   ignore = true)
    @Mapping(target = "totalReviews",ignore = true)
    @Mapping(target = "createdAt",   ignore = true)
    @Mapping(target = "updatedAt",   ignore = true)
    @Mapping(target = "status",      ignore = true)
    @Mapping(target = "workingHours", expression = "java(toMap(request.getWorkingHours()))")
    @Mapping(target = "bankAccount",  expression = "java(toMap(request.getBankAccount()))")
    Venue toEntity(VenueRequest request);

    @Mapping(target = "id",          ignore = true)
    @Mapping(target = "owner",       ignore = true)
    @Mapping(target = "slug",        ignore = true)
    @Mapping(target = "courts",      ignore = true)
    @Mapping(target = "ratingAvg",   ignore = true)
    @Mapping(target = "totalReviews",ignore = true)
    @Mapping(target = "createdAt",   ignore = true)
    @Mapping(target = "updatedAt",   ignore = true)
    @Mapping(target = "status",      ignore = true)
    @Mapping(target = "workingHours", expression = "java(toMap(request.getWorkingHours()))")
    @Mapping(target = "bankAccount",  expression = "java(toMap(request.getBankAccount()))")
    void updateEntity(VenueUpdateRequest request, @MappingTarget Venue venue);

    default Map<String, Object> toMap(Object obj) {
        if (obj == null) return null;
        return new com.fasterxml.jackson.databind.ObjectMapper()
                .convertValue(obj, new com.fasterxml.jackson.core.type.TypeReference<Map<String,Object>>(){});
    }
}
