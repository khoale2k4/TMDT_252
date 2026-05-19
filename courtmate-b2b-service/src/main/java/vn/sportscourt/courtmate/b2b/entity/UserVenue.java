package vn.sportscourt.courtmate.b2b.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.sportscourt.courtmate.b2b.entity.key.UserVenueKey;

import java.util.UUID;

@Data
@Table(name = "user_venue")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class UserVenue {
    @EmbeddedId
    private UserVenueKey userVenueKey;
}
