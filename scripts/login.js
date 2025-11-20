document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        // TODO: Implement actual login logic here.
        // For now, we'll just simulate a successful login and redirect.
        localStorage.setItem('loggedIn', 'true');
        alert("Login bem-sucedido! Redirecionando para a página principal.");
        window.location.href = "../html/index.html";
    });
});
