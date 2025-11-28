export function cleanSpaces(text: string = "") {
  return text.replace(/\s+/g, " ").trim();
}

export function getDeviceDateTime() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function formatTime(dateStr: string): string {
  const d = new Date(dateStr);

  // Día / Mes / Año (2 dígitos)
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear().toString().slice(-2); // 2025 → 25

  // Hora
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";

  hours = hours % 12;
  if (hours === 0) hours = 12;

  return `Inicio ruta ${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
}




export function formatNumber(num: number) {
  return num.toLocaleString("es-CO");
}