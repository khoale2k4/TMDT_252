package vn.sportscourt.courtmate.b2b.service;

import vn.sportscourt.courtmate.b2b.dto.request.AuthRequest;
import vn.sportscourt.courtmate.b2b.dto.response.AuthResponse;
import vn.sportscourt.courtmate.b2b.entity.RefreshToken;

import java.util.UUID;

public interface AuthService {
    AuthResponse auth(AuthRequest request);
    RefreshToken saveOrUpdateRefreshToken(UUID user, String rfToken);
    AuthResponse refreshToken(String tokenRequest);
}
