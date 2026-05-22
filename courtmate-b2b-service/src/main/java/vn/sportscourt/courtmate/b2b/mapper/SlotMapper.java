package vn.sportscourt.courtmate.b2b.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import vn.sportscourt.courtmate.b2b.dto.response.SlotResponse;
import vn.sportscourt.courtmate.b2b.entity.Slot;

@Mapper(componentModel = "spring")
public interface SlotMapper {

    SlotResponse toResponse(Slot slot);
}
