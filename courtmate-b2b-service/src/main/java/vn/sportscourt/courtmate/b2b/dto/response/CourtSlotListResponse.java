package vn.sportscourt.courtmate.b2b.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class CourtSlotListResponse {

    @JsonProperty("court_id")
    private UUID courtId;

    private List<SlotResponse> slots;

    private PaginationMeta pagination;

    @Data
    @Builder
    public static class PaginationMeta {
        private int page;
        private long total;

        @JsonProperty("total_pages")
        private int totalPages;
    }
}
