package vn.sportscourt.courtmate.b2b.service.impl;

import lombok.AllArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import vn.sportscourt.courtmate.b2b.dto.request.AuthRequest;
import vn.sportscourt.courtmate.b2b.dto.response.AuthResponse;
import vn.sportscourt.courtmate.b2b.entity.RefreshToken;
import vn.sportscourt.courtmate.b2b.entity.UserVenue;
import vn.sportscourt.courtmate.b2b.entity.Users;
import vn.sportscourt.courtmate.b2b.exception.UserNotFound;
import vn.sportscourt.courtmate.b2b.repository.RefreshTokenRepository;
import vn.sportscourt.courtmate.b2b.repository.UserRepository;
import vn.sportscourt.courtmate.b2b.repository.UserVenueRepository;
import vn.sportscourt.courtmate.b2b.service.AuthService;
import vn.sportscourt.courtmate.b2b.service.JwtService;

import java.time.Instant;
import java.util.*;

@Service
@AllArgsConstructor
public class AuthServiceImpl implements AuthService {
    private UserRepository userRepository;


//    private PasswordEncoder passwordEncoder;

    private JwtService jwtService;

    private AuthenticationManager authenticationManager;

    private RefreshTokenRepository RfRepo;
    private UserVenueRepository userVenueRepository;



    public AuthResponse auth(AuthRequest request){

        if (userRepository.findByEmail(request.getEmail()).isEmpty())
        {System.out.println("0");
            return new AuthResponse(null,null,null,null,null,null);}

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (AuthenticationException e) {
            System.out.println("1");
            return new AuthResponse(null,null,null,null,null,null);

        }

        Users user = userRepository.findByEmail(request.getEmail()).orElseThrow(
                () -> new UserNotFound("Cant find user")
        );

        UUID userId = user.getId();
//        if (user.getRole().equals(Role.ADMIN)){
//            userId = adminRepository.findByAccount(account).getId();
//        }else if (account.getWeb_role().equals(Role.USER)){
//            userId = studentRepository.findByAccount(account).getId();
//        }

        Map<String, Object> extraClaims = new HashMap<>();
        System.out.println(user.getRole());
        extraClaims.put("role", user.getRole().name());// Ví dụ thêm role của user
        extraClaims.put("user_id", userId);
        extraClaims.put("name",user.getFullName());
        Optional<Users> users = userRepository.findById(userId);
        String jwtToken = jwtService.generateToken(extraClaims,user);
        String rfToken = jwtService.generateRefreshToken(user);

        saveOrUpdateRefreshToken(userId,rfToken);
        List<String> venueId = new ArrayList<>();
        for (UserVenue i:userVenueRepository.findByUserVenueKey_UserId(userId))
            venueId.add(i.getUserVenueKey().getVenueId().toString());

        System.out.println("token: " + jwtToken);
        return AuthResponse.builder()
                .access_token(jwtToken)
                .refresh_token(rfToken)
                .token_type("Bearer")
                .expriredIn(3600)
                .user(users)
                .venueId(venueId)
                .build();
    }
    public RefreshToken saveOrUpdateRefreshToken(UUID user, String rfToken) {
        // 1. Tìm token cũ của user trong DB
        return RfRepo.findByUser_id(user)
                .map(existingToken -> {
                    // Trường hợp ĐÃ CÓ: Cập nhật lại token và ngày hết hạn
                    existingToken.setToken(rfToken);
                    existingToken.setExpiryDate(jwtService.extractExpiration(rfToken).toInstant());
                    return RfRepo.save(existingToken);
                })
                .orElseGet(() -> {
                    Users users = userRepository.findById(user).orElse(null);
                    // Trường hợp CHƯA CÓ (null): Tạo mới hoàn toàn
                    RefreshToken newToken = RefreshToken.builder()
                            .token(rfToken)
                            .expiryDate(jwtService.extractExpiration(rfToken).toInstant())
                            .user(users)
                            .build();
                    return RfRepo.save(newToken);
                });
    }
    public AuthResponse refreshToken(String tokenRequest) {
        System.out.println(RfRepo.findByToken(tokenRequest));
        return RfRepo.findByToken(tokenRequest)
                .map(this::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    // Tạo Access Token mới từ JWT Service của bạn
                    //String accessToken = jwtService.generateToken(user);
                    Map<String, Object> extraClaims = new HashMap<>();
                    System.out.println(user.getRole());
                    extraClaims.put("role", user.getRole().name());// Ví dụ thêm role của user
                    extraClaims.put("user_id", user.getId());
                    extraClaims.put("name",user.getFullName());
                    //Optional<Users> users = userRepository.findById(userId);
                    List<String> venueId = new ArrayList<>();
                    for (UserVenue i:userVenueRepository.findByUserVenueKey_UserId(user.getId()))
                        venueId.add(i.getUserVenueKey().getVenueId().toString());
                    String accessToken = jwtService.generateToken(extraClaims,user);
                    return AuthResponse.builder()
                            .access_token(accessToken)
                            .refresh_token(tokenRequest)
                            .user(Optional.of(user)) // Map sang DTO nếu cần
                            .token_type("Bearer")
                            .expriredIn(3600)
                            .venueId(venueId)
                            .build();
                })
                .orElseThrow(() -> new RuntimeException("Refresh token không tồn tại trong DB!"));
    }
    private RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().isBefore(Instant.now())) {

            throw new RuntimeException("Refresh token đã hết hạn. Vui lòng đăng nhập lại!");
        }
        return token;
    }

}
