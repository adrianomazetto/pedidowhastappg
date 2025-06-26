document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('form-login');
    const errorMessage = document.getElementById('error-message');

    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Credenciais (não use este método em produção)
        const validUser = 'admin';
        const validPass = '123456';

        if (username === validUser && password === validPass) {
            // Salva um token de sessão simples no sessionStorage
            sessionStorage.setItem('loggedIn', 'true');
            // Redireciona para a página de administração
            window.location.href = 'admin.html';
        } else {
            errorMessage.textContent = 'Usuário ou senha inválidos.';
        }
    });
});
