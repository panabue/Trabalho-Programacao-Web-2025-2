document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  if (!token) {
    alert("O link de redefinição de senha é inválido ou expirou.");
    window.location.href = "login.html";
    return;
  }

  const resetForm = document.getElementById("reset-password-form");
  resetForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const newPassword = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (newPassword !== confirmPassword) {
      alert("As senhas não correspondem.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8081/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: token, password: newPassword }),
        }
      );

      if (response.ok) {
        alert("Sua senha foi redefinida com sucesso!");
        window.location.href = "login.html";
      } else {
        alert(
          "Ocorreu um erro ao redefinir a senha. O link pode ter expirado."
        );
        window.location.href = "login.html";
      }
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      alert("Ocorreu um erro ao redefinir a senha.");
    }
  });
});
