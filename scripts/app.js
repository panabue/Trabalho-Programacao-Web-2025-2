async function loadContent(pageName) {
  try {
    const contentContainer = document.getElementById("page-content");

    const response = await fetch(`${pageName}.html`);

    if (!response.ok) {
      throw new Error(`Página não encontrada: ${pageName}.html`);
    }

    const htmlContent = await response.text();

    contentContainer.innerHTML = htmlContent;

    // Load playlists if biblioteca page is loaded
    if (pageName === 'biblioteca' && typeof loadUserPlaylists === 'function') {
      loadUserPlaylists();
    }

    // Load liked songs if liked-songs page is loaded
    if (pageName === 'liked-songs' && typeof loadLikedSongs === 'function') {
      loadLikedSongs();
    }
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

async function createPlaylist() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Você precisa estar logado para criar uma playlist.");
        return;
    }

    const name = prompt("Nome da nova playlist:");
    if (!name) return;

    try {
        const response = await fetch('http://localhost:8081/playlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: name,
                description: "Minha playlist personalizada"
            })
        });

        if (response.ok) {
            alert("Playlist criada com sucesso!");
            // Reload biblioteca page if it's currently loaded
            const currentPage = document.getElementById("page-content");
            if (currentPage && currentPage.querySelector('.minhas-playlists')) {
                loadContent('biblioteca');
            }
        } else {
            if (response.status === 403 || response.status === 401) {
                alert("Sessão expirada. Por favor, faça login novamente.");
                localStorage.removeItem('token');
                window.location.href = 'login.html';
                return;
            }

            let errorMessage = "Erro ao criar playlist.";
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                console.warn("Could not parse error JSON", e);
            }
            alert(errorMessage);
        }
    } catch (error) {
        console.error("Erro ao criar playlist:", error);
        alert("Erro de conexão ao criar playlist.");
    }
}
window.createPlaylist = createPlaylist;
