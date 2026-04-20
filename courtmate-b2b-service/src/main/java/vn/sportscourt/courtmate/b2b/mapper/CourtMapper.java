package vn.sportscourt.courtmate.b2b.mapper;

import org.mapstruct.*;
import vn.sportscourt.courtmate.b2b.dto.request.CourtRequest;
import vn.sportscourt.courtmate.b2b.dto.request.CourtUpdateRequest;
import vn.sportscourt.courtmate.b2b.dto.response.CourtCreateResponse;
import vn.sportscourt.courtmate.b2b.dto.response.CourtResponse;
import vn.sportscourt.courtmate.b2b.entity.Court;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface CourtMapper {

    @Mapping(target = "courtId",   source = "id")
    @Mapping(target = "venueId",   source = "venue.id")
    @Mapping(target = "venueName", source = "venue.name")
    @Mapping(target = "courtName", source = "name")
    CourtResponse toResponse(Court court);

    @Mapping(target = "courtId",   source = "id")
    @Mapping(target = "venueId",   source = "venue.id")
    @Mapping(target = "status",    expression = "java(court.getStatus().name())")
    @Mapping(target = "courtName", source = "name")
    CourtCreateResponse toCreateResponse(Court court);

    @Mapping(target = "id",        ignore = true)
    @Mapping(target = "venue",     ignore = true)
    @Mapping(target = "slots",     ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "name",      source = "courtName")
    @Mapping(target = "status",    ignore = true)
    Court toEntity(CourtRequest request);

    @Mapping(target = "id",        ignore = true)
    @Mapping(target = "venue",     ignore = true)
    @Mapping(target = "slots",     ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "name",      source = "courtName")
    void updateEntity(CourtUpdateRequest request, @MappingTarget Court court);
}
