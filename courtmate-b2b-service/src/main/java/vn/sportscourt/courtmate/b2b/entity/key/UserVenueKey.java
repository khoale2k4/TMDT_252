package vn.sportscourt.courtmate.b2b.entity.key;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

@Data
@Embeddable
@AllArgsConstructor
@NoArgsConstructor
public class UserVenueKey implements Serializable {
    @Column(name = "user_id")
    private UUID userId;
    @Column(name = "venue_id")
    private UUID venueId;
}
