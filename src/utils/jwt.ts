export function decodeJWT(token: string) {
  try {
    const payload = token.split('.')[1];
    // atob ya existe en JS/Expo
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error al decodificar token:', error);
    return null;
  }
}
