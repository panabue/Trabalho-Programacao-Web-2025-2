document.getElementById('forgot-password-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(user => user.email === email);

    if (user) {
        // Generate a pseudo-random token for the reset link
        const token = Math.random().toString(36).substr(2);
        localStorage.setItem('resetToken', JSON.stringify({email: email, token: token, expiry: Date.now() + 3600000})); // Token valid for 1 hour

        // Simulate sending an email by redirecting to a reset page with the token
        alert('Um link de redefinição de senha foi gerado. Redirecionando...');
        window.location.href = `reset-password.html?token=${token}`;
    } else {
        alert('Nenhum usuário encontrado com este email.');
    }
});
