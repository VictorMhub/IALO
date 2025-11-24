
export function getToken() {
  return localStorage.getItem('token');
}

export function getRole() {
  return localStorage.getItem('role');
}

export function saveSession({ token, role }) {
  if (token) localStorage.setItem('token', token);
  if (role) localStorage.setItem('role', role);
}

export function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
}

export function requireAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = 'login.html';
    throw new Error('Usuário não autenticado');
  }
  return token;
}
