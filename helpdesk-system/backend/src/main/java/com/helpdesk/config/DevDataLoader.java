package com.helpdesk.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.helpdesk.entity.Branch;
import com.helpdesk.entity.User;
import com.helpdesk.enums.Role;
import com.helpdesk.repository.BranchRepository;
import com.helpdesk.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.dev.seed-enabled", havingValue = "true", matchIfMissing = false)
public class DevDataLoader implements CommandLineRunner {

    private final BranchRepository branchRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        branchRepository.findByBranchNameIgnoreCase("Head Office")
                .orElseGet(() -> branchRepository.save(Branch.builder()
                        .branchName("Head Office")
                        .city("Mumbai")
                        .build()));

        seedUser("admin@helpdesk.com", "System Admin", "admin123", Role.ADMIN);
        seedUser("employee@helpdesk.com", "John Employee", "employee123", Role.EMPLOYEE);

        log.info("Dev seed users ready (admin@helpdesk.com / employee@helpdesk.com)");
    }

    private void seedUser(String email, String name, String rawPassword, Role role) {
        if (userRepository.existsByEmailIgnoreCase(email)) {
            return;
        }
        userRepository.save(User.builder()
                .email(email.toLowerCase())
                .name(name)
                .password(passwordEncoder.encode(rawPassword))
                .role(role)
                .build());
        log.info("Created dev user: {}", email);
    }
}
