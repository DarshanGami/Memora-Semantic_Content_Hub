package com.example.filebackend.service;

import com.example.filebackend.dto.AuthRequest;
import com.example.filebackend.dto.AuthResponse;
import com.example.filebackend.dto.SignUpRequest;
import com.example.filebackend.exception.UserAlreadyExistsException;
import com.example.filebackend.model.User;
import com.example.filebackend.repository.PasswordResetTokenRepository;
import com.example.filebackend.repository.UserRepository;
import com.example.filebackend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.filebackend.dto.ForgotPasswordRequest;
import com.example.filebackend.dto.ResetPasswordRequest;
import com.example.filebackend.model.PasswordResetToken;
import com.example.filebackend.repository.PasswordResetTokenRepository;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PasswordResetTokenRepository tokenRepository;
    private final JavaMailSender mailSender;

    public AuthResponse signUp(SignUpRequest request) {
        // 1. Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already in use");
        }

        // 2. Create new user
        var user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        // 3. Save user and generate token
        userRepository.save(user);
        var jwtToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        // 1. Authenticate credentials
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // 2. Load user and generate token
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        var jwtToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .build();
    }

    // ✅ Forgot Password: Generate + Email token
    public void sendPasswordResetToken(ForgotPasswordRequest request) {
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String token = UUID.randomUUID().toString();
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(15);

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .email(user.getEmail())
                .token(token)
                .expiryTime(expiry)
                .build();

        tokenRepository.save(resetToken);

        String resetLink = "http://localhost:5173/reset-password-form?token=" + token;


        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(user.getEmail());
        mail.setSubject("Password Reset Request");
        mail.setText("Click the link to reset your password:\n" + resetLink);

        mailSender.send(mail);
    }

    // ✅ Reset Password
    public void resetPassword(ResetPasswordRequest request) {
        var tokenData = tokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired token"));

        if (tokenData.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Token expired");
        }

        var user = userRepository.findByEmail(tokenData.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        tokenRepository.delete(tokenData); // Invalidate token
    }
}