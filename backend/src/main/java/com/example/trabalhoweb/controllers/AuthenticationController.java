package com.example.trabalhoweb.controllers;

import com.example.trabalhoweb.models.User;
import com.example.trabalhoweb.models.AuthenticationDTO;
import com.example.trabalhoweb.models.RegisterDTO;
import com.example.trabalhoweb.models.LoginResponseDTO;
import com.example.trabalhoweb.models.ResetPasswordDTO;
import com.example.trabalhoweb.services.TokenService;
import com.example.trabalhoweb.repositories.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("auth")
public class AuthenticationController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TokenService tokenService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody @Valid AuthenticationDTO data){
        var usernamePassword = new UsernamePasswordAuthenticationToken(data.login(), data.password());
        var auth = this.authenticationManager.authenticate(usernamePassword);

        var token = tokenService.generateToken((User) auth.getPrincipal());
        var user = (User) auth.getPrincipal();

        return ResponseEntity.ok(new LoginResponseDTO(token, user.getLogin()));
    }

    @PostMapping("/register")
    public ResponseEntity<Void> register(@RequestBody @Valid RegisterDTO data){
        if(this.userRepository.findByLogin(data.login()) != null) return ResponseEntity.badRequest().build();

        String encryptedPassword = new BCryptPasswordEncoder().encode(data.password());
        User newUser = new User(data.login(), encryptedPassword, data.role());

        this.userRepository.save(newUser);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> body) {
        String login = body.get("login");
        User user = (User) this.userRepository.findByLogin(login);

        if (user != null) {
            String token = UUID.randomUUID().toString();
            user.setResetPasswordToken(token);
            user.setResetPasswordTokenExpiry(LocalDateTime.now().plusHours(1)); // Token expires in 1 hour
            this.userRepository.save(user);
            // In a real application, you would send an email with the token.
            // Here, we return the token for simulation purposes.
            return ResponseEntity.ok(Map.of("token", token));
        }

        return ResponseEntity.notFound().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@RequestBody @Valid ResetPasswordDTO data) {
        User user = this.userRepository.findByResetPasswordToken(data.token());

        if (user != null && user.getResetPasswordTokenExpiry().isAfter(LocalDateTime.now())) {
            String encryptedPassword = new BCryptPasswordEncoder().encode(data.password());
            user.setPassword(encryptedPassword);
            user.setResetPasswordToken(null);
            user.setResetPasswordTokenExpiry(null);
            this.userRepository.save(user);
            return ResponseEntity.ok().build();
        }

        return ResponseEntity.badRequest().build();
    }
}
