// ÜRETİLEN DOSYA – ELLE DÜZENLEMEYİN. Kaynak: tokens/*.json · Üretici: scripts/build-tokens.mjs
// Yalnızca CSS kullanılamayan yerler için (manifest, viewport themeColor, e-posta vb.).
// Bileşenlerde renkler Tailwind sınıflarıyla (ör. bg-surface-card) kullanılır.

export const semanticColors = {
  "brand-primary": "#0F766E",
  "brand-primary-hover": "#115E59",
  "brand-primary-subtle": "#CCFBF1",
  "brand-accent": "#14B8A6",
  "text-primary": "#0F172A",
  "text-secondary": "#64748B",
  "text-tertiary": "#94A3B8",
  "text-inverse": "#FFFFFF",
  "text-inverse-secondary": "#CBD5E1",
  "text-brand": "#0F766E",
  "text-success": "#15803D",
  "text-danger": "#DC2626",
  "text-warning": "#B45309",
  "text-info": "#2563EB",
  "text-on-task": "#4338CA",
  "text-on-payment": "#BE123C",
  "text-on-warning": "#92400E",
  "surface-page": "#F8FAFC",
  "surface-card": "#FFFFFF",
  "surface-muted": "#F1F5F9",
  "surface-selected": "#CCFBF1",
  "border-default": "#E2E8F0",
  "border-subtle": "#F1F5F9",
  "border-strong": "#CBD5E1",
  "border-focus": "#0F766E",
  "border-error": "#DC2626",
  "border-success": "#15803D",
  "status-success": "#15803D",
  "status-danger": "#DC2626",
  "status-warning": "#D97706",
  "status-info": "#2563EB",
  "status-success-subtle": "#DCFCE7",
  "status-danger-subtle": "#FEE2E2",
  "status-warning-subtle": "#FFEDD5",
  "status-info-subtle": "#DBEAFE",
  "action-primary-pressed": "#134E4A",
  "action-secondary-hover": "#99F6E4",
  "action-tertiary-hover": "#F8FAFC",
  "action-danger-hover": "#B91C1C",
  "category-teal": "#CCFBF1",
  "category-blue": "#DBEAFE",
  "category-violet": "#EDE9FE",
  "category-pink": "#FCE7F3",
  "category-orange": "#FFEDD5",
  "category-amber": "#FEF3C7",
  "category-green": "#DCFCE7",
  "category-red": "#FEE2E2",
  "category-slate": "#E2E8F0",
  "chart-income": "#16A34A",
  "chart-expense": "#E11D48",
  "chart-savings": "#0D9488",
  "chart-balance": "#6366F1",
  "chart-neutral": "#CBD5E1"
} as const;

export const breakpoints = {
  "tablet": 768,
  "laptop": 1024,
  "detail": 1280,
  "desktop": 1440
} as const;

export type SemanticColor = keyof typeof semanticColors;
export type Breakpoint = keyof typeof breakpoints;
