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
  loadContent("home");
});
