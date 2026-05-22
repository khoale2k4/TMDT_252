package vn.sportscourt.courtmate.b2b.controller;

import io.jsonwebtoken.Claims;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.sportscourt.courtmate.b2b.dto.request.AuthRequest;
import vn.sportscourt.courtmate.b2b.dto.request.RefreshRequest;
import vn.sportscourt.courtmate.b2b.dto.response.APIResponse;
import vn.sportscourt.courtmate.b2b.dto.response.AuthResponse;
import vn.sportscourt.courtmate.b2b.repository.UserRepository;
import vn.sportscourt.courtmate.b2b.service.AuthService;
import vn.sportscourt.courtmate.b2b.service.JwtService;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/auth")
@AllArgsConstructor
public class AuthController {

    private AuthService authService;

    private JwtService jwtService;
    private UserRepository repository;

//    @PostMapping("/register")
//    public ResponseEntity<?> register(
//            @Valid @RequestBody RegisterRequest request
//    ){
//        return ResponseEntity.ok(authService.register(request));
//    }
    @GetMapping("/a")
    public String a(){
        return "a";
    }
    @PostMapping("/login")
    public ResponseEntity<?> auth(
            @RequestBody AuthRequest request
    ){
        return ResponseEntity.ok(authService.auth(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(){
        return ResponseEntity.ok("Logout successfully");
    }

    @GetMapping("/userId")
    public ResponseEntity<?> getUserId(@RequestHeader("Authorization") String authorizationHeader) {
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7);
            Claims claims = jwtService.newExtractAllClaims(token);
            return new ResponseEntity<>(claims.get("user_id",String.class), HttpStatus.OK);
        }
        throw new RuntimeException("Authorization header is missing or invalid");
    }
    @PostMapping("/refresh")
    public ResponseEntity<APIResponse<AuthResponse>> refresh(@RequestBody RefreshRequest request) {
        return ResponseEntity.ok(APIResponse.ok(authService.refreshToken(request.getRefresh_token())));
    }
    @GetMapping("/user")
    public ResponseEntity<?> getUser() {
        return new ResponseEntity<>(repository.findAll(), HttpStatus.OK);
    }
}