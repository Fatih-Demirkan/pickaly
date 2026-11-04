// Birikimler adresleri: liste /birikimler · detay /birikimler/[id] (tam sayfa, RESPONSIVE §3.4.3) ·
// formlar /birikimler/yeni, /birikimler/[id]/duzenle, /birikimler/[id]/hareket?yon=ekle|cek (drawer).

export type MovementDirection = "in" | "out";

export function savingsHref(id: string) {
  return `/birikimler/${encodeURIComponent(id)}`;
}

export function movementHref(id: string, direction: MovementDirection = "in") {
  return `/birikimler/${encodeURIComponent(id)}/hareket${direction === "out" ? "?yon=cek" : ""}`;
}

export function parseDirectionParam(value: unknown): MovementDirection {
  return value === "cek" ? "out" : "in";
}
