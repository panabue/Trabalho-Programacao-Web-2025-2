async function loadContent(pageName) {
  try {
    const contentContainer = document.getElementById("page-content");

    const response = await fetch(`${pageName}.html`);

    if (!response.ok) {
      throw new Error("Página não encontrada");
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
  // If user is not logged in, redirect to login page
  if (!localStorage.getItem('loggedIn')) {
      // Check if we are not already on a page that is the login page
      if(!window.location.href.includes('login.html')) {
        window.location.href = 'login.html';
      }
  } else {
    // If we are on the main page, load the home content
    if(document.getElementById("page-content")){
        loadContent("home");
    }
  }
});
