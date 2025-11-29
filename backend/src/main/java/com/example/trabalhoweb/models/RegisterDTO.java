package com.example.trabalhoweb.models;

import com.example.trabalhoweb.models.UserRole;

public record RegisterDTO(String login, String password, UserRole role) {
}
