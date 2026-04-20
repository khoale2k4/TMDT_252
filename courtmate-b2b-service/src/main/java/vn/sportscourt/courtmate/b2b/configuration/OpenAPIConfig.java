package vn.sportscourt.courtmate.b2b.configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAPIConfig {
    @Bean
    public OpenAPI courtMateOpenAPI() {
        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()
                // 1. Cấu hình thông tin chung
                .info(new Info()
                        .title("CourtMate B2B API")
                        .description("Tài liệu API cho phân hệ quản lý sân thể thao CourtMate")
                        .version("1.0.0"));
//                // 2. Ép tất cả các endpoint đều phải kẹp Security theo mặc định
//                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
//                // 3. Khai báo kiểu Security là HTTP Bearer (JWT)
//                .components(new Components()
//                        .addSecuritySchemes(securitySchemeName, new SecurityScheme()
//                                .name(securitySchemeName)
//                                .type(SecurityScheme.Type.HTTP)
//                                .scheme("bearer")
//                                .bearerFormat("JWT")));
    }
}
