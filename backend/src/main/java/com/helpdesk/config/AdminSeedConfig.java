package com.helpdesk.config;

import com.helpdesk.entity.User;
import com.helpdesk.enums.Role;
import com.helpdesk.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

@Configuration
@RequiredArgsConstructor
public class AdminSeedConfig implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String email = "kaushal@kathiawarstores.com";

        if (userRepository.findByEmailIgnoreCase(email).isEmpty()) {
            User admin = User.builder()
                    .name("Kaushal")
                    .email(email)
                    .password(passwordEncoder.encode("kishor9644"))
                    .role(Role.ADMIN)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            userRepository.save(admin);
            System.out.println("Temporary admin user created");
        }
    }
}