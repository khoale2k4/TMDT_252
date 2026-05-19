package vn.sportscourt.courtmate.b2b.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.sportscourt.courtmate.b2b.entity.Users;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    @JsonProperty("access_token")
    private String access_token;
    @JsonProperty("refresh_name")
    private String refresh_token;
    @JsonProperty("token_type")
    private String token_type ="Bearer";
    @JsonProperty("expired_in")
    private Integer expriredIn =3600;
    @JsonProperty("user")
    private Optional<Users> user;
    @JsonProperty("venue_ids")
    private List<String> venueId;
}
