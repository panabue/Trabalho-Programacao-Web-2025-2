package com.example.trabalhoweb;

import com.example.trabalhoweb.models.RegisterDTO;
import com.example.trabalhoweb.models.UserRole;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class TrabalhoWebApplicationTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Test
	void contextLoads() {
	}

	@Test
	void registrationAndLoginShouldSucceed() throws Exception {
		// Gera um login único para garantir que o teste seja repetível
		String login = "user_" + UUID.randomUUID().toString();
		String password = "password123";

		// Cria o objeto de registro
		RegisterDTO registerDto = new RegisterDTO(login, password, UserRole.USER);

		// Testa o endpoint de registro
		mockMvc.perform(post("/auth/register")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(registerDto)))
				.andExpect(status().isOk());

		// Testa o endpoint de login com as mesmas credenciais
		mockMvc.perform(post("/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(registerDto))) // Reutiliza o DTO para o corpo do login
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.token").exists()); // Verifica se o token foi retornado
	}
}
