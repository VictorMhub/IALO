// frontend/web/src/header.js
import { clearSession, getToken } from './auth.js';

const logoutBtn = document.getElementById('logoutBtn');
const isLogged = !!getToken();

// Se tiver token, mostra o botão Sair, senão esconde
if (logoutBtn) {
  if (!isLogged) {
    logoutBtn.style.display = 'none';
  }

  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    clearSession();
    window.location.href = 'login.html';
  });
}

// Opcional: esconder links de Login/Registrar quando já estiver logado
const loginLink = document.querySelector('a[href="login.html"]');
const registerLink = document.querySelector('a[href="register.html"]');

if (isLogged) {
  if (loginLink) loginLink.style.display = 'none';
  if (registerLink) registerLink.style.display = 'none';
}
