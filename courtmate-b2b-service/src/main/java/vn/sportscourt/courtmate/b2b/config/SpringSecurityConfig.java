package vn.sportscourt.courtmate.b2b.config;


import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@AllArgsConstructor
public class SpringSecurityConfig {

    private JwtAuthFilter jwtAuthFilter;

    private CorsConfig corsConfig;

    private AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception{

        http.csrf(AbstractHttpConfigurer::disable);

//        http.cors(cors -> cors.configurationSource(corsConfig.corsConfigurationSource()));

        http.authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/auth/logout").permitAll()
                                .requestMatchers("api/**").permitAll()
                                .requestMatchers("/auth/user").permitAll()
                                .requestMatchers("/api/v1/admin/**").permitAll()
                                .requestMatchers("/admin/**").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authenticationProvider(authenticationProvider);

//        http.exceptionHandling(e -> e
//                .authenticationEntryPoint((request, response, authException) -> {
//                    // Xử lý lỗi không xác thực (401)
//                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
//                    response.setContentType("application/json");
//                    response.setCharacterEncoding("UTF-8");
//                    response.getWriter().write("{\"error\": \"Unauthorized - Please log in\"}");
//                })
//                .accessDeniedHandler((request, response, accessDeniedException) -> {
//                    // Xử lý lỗi không có quyền (403)
//                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
//                    response.setContentType("application/json");
//                    response.setCharacterEncoding("UTF-8");
//                    response.getWriter().write("{\"error\": \"Forbidden - You don't have permission to access this resource\"}");
//                })
//        );

        return http.build();
    }


}
