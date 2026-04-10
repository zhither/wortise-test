/** Etiquetas tipo mock: hora hoy, "Ayer", mes corto. */

export function formatChatListTime(iso: string | Date | null | undefined): string {
  if (iso == null || iso === "") return "";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "";

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMsg = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startOfToday.getTime() - startOfMsg.getTime()) / 86400000);

  if (diffDays === 0) {
    return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) {
    return d.toLocaleDateString("es-AR", { weekday: "short" });
  }
  return d.toLocaleDateString("es-AR", { month: "short" });
}
