package vn.sportscourt.courtmate.b2b.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class decode_password {
    public static void main(String[] args) {
    BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    System.out.println(encoder.encode("123456"));
    // Copy kết quả in ra màn hình và dán vào cột password_hash trong DB
}
}
