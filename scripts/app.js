async function loadContent(pageName) {
  try {
    const contentContainer = document.getElementById("page-content");

    // We are in the html folder, so we need to fetch from the same folder
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
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    const userContainer = document.querySelector('.user-container-header');

    if (user && user.username) {
        // User is logged in
        if (userContainer) {
            userContainer.innerHTML = `
                <div class="user-profile">
                    <i class="fa-solid fa-user"></i>
                </div>
                <span>${user.username}</span>
            `;
            userContainer.removeAttribute('href'); // Remove the link to login.html
            userContainer.style.cursor = 'pointer'; // Make it look clickable

            userContainer.addEventListener('click', (event) => {
                event.preventDefault(); // Prevent any default <a> tag behavior
                if (confirm('Deseja sair da sua conta?')) {
                    localStorage.removeItem('loggedIn');
                    localStorage.removeItem('loggedInUser');
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

        // If not on login or register page, redirect to login
        if (!onLoginPage && !onRegisterPage) {
            window.location.href = 'login.html';
        }
    }
});
