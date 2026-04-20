package vn.sportscourt.courtmate.b2b;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class B2BServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(B2BServiceApplication.class, args);
    }
}
