
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    const resetData = JSON.parse(localStorage.getItem('resetToken'));

    if (!resetData || resetData.token !== token || Date.now() > resetData.expiry) {
        alert('O link de redefinição de senha é inválido ou expirou.');
        window.location.href = 'login.html';
        return;
    }

    const resetForm = document.getElementById('reset-password-form');
    resetForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const newPassword = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword !== confirmPassword) {
            alert('As senhas não correspondem.');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(user => user.email === resetData.email);

        if (userIndex !== -1) {
            users[userIndex].password = newPassword; // In a real app, you would hash this password
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.removeItem('resetToken'); 

            alert('Sua senha foi redefinida com sucesso!');
            window.location.href = 'login.html';
        } else {
            alert('Ocorreu um erro ao redefinir a senha.');
        }
    });
});
