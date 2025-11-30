document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const response = await fetch('http://localhost:8081/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ login: email, password: password }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                alert("Login bem-sucedido! Redirecionando para a página principal.");
                window.location.href = "index.html"; // Assuming index.html is at the same level
            } else {
                alert("Email ou senha incorretos. Tente novamente.");
            }
        } catch (error) {
            console.error('Erro ao tentar fazer login:', error);
            alert("Ocorreu um erro ao tentar fazer login. Verifique o console para mais detalhes.");
        }
    });
});
