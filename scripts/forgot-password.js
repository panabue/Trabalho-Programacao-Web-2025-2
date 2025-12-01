document
  .getElementById("forgot-password-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    const email = document.getElementById("email").value;

    try {
      const response = await fetch(
        "http://localhost:8081/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ login: email }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const token = data.token;
        alert("Um link de redefinição de senha foi gerado. Redirecionando...");
        window.location.href = `reset-password.html?token=${token}`;
      } else {
        alert("Nenhum usuário encontrado com este email.");
      }
    } catch (error) {
      console.error("Erro ao solicitar redefinição de senha:", error);
      alert("Ocorreu um erro. Tente novamente.");
    }
  });
