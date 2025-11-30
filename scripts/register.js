document.getElementById('register-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        alert("As senhas não coincidem!");
        return;
    }

    try {
        const response = await fetch('http://localhost:8081/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ login: email, password: password, role: 'USER' }),
        });

        if (response.ok) {
            alert("Cadastro realizado com sucesso! Redirecionando para a página de login.");
            window.location.href = "login.html";
        } else {
            alert("Este email já está cadastrado!");
        }
    } catch (error) {
        console.error('Erro ao tentar cadastrar:', error);
        alert("Ocorreu um erro ao tentar cadastrar. Verifique o console para mais detalhes.");
    }
});
