document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        // Retrieve user data from localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(user => user.email === email && user.password === password);

        if (user) {
            // Simulate a successful login and redirect
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('loggedInUser', JSON.stringify(user));
            alert("Login bem-sucedido! Redirecionando para a página principal.");
            window.location.href = "../html/index.html";
        } else {
            alert("Email ou senha incorretos. Tente novamente.");
        }
    });
});
