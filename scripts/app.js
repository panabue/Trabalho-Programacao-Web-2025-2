async function loadContent(pageName) {
  try {
    const contentContainer = document.getElementById("page-content");

    const response = await fetch(`${pageName}.html`);

    if (!response.ok) {
      throw new Error(`Página não encontrada: ${pageName}.html`);
    }

    const htmlContent = await response.text();

    contentContainer.innerHTML = htmlContent;
  } catch (error) {
    console.error("Erro ao carregar página:", error);
    document.getElementById("page-content").innerHTML =
      "<h2>Erro ao carregar.</h2>";
  }
}

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem('token');
    const userContainer = document.querySelector('.user-container-header');

    if (token) {
        // User is logged in
        if (userContainer) {
             // Keep the default user icon and name, but make it a logout button
            userContainer.removeAttribute('href'); // Remove the link to login.html
            userContainer.style.cursor = 'pointer'; // Make it look clickable

            userContainer.addEventListener('click', (event) => {
                event.preventDefault(); // Prevent any default <a> tag behavior
                if (confirm('Deseja sair da sua conta?')) {
                    localStorage.removeItem('token');
                    window.location.href = 'login.html'; // Redirect to login
                }
            });
        }

        // Load home content if on the main page
        if (document.getElementById('page-content')) {
            loadContent('home');
        }

    } else {
        // User is not logged in
        const onLoginPage = window.location.href.includes('login.html');
        const onRegisterPage = window.location.href.includes('register.html');
        const onForgotPasswordPage = window.location.href.includes('forgot-password.html');
        const onResetPasswordPage = window.location.href.includes('reset-password.html');

        // If not on a public page, redirect to login
        if (!onLoginPage && !onRegisterPage && !onForgotPasswordPage && !onResetPasswordPage) {
            window.location.href = 'login.html';
        }
    }
});
