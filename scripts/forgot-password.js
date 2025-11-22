document.getElementById('forgot-password-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    // Aqui você adicionaria a lógica para enviar um email de redefinição de senha
    alert(`Um email de redefinição de senha foi enviado para ${email}`);
});