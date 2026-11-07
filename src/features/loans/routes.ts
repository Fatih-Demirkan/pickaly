// Alacaklarım adresleri (Profil → Alacaklarım):
//   /profil/alacaklar · /profil/alacaklar/yeni · /profil/alacaklar/[id] · /profil/alacaklar/[id]/duzenle

export const LOANS_PATH = "/profil/alacaklar";

export function newLoanHref() {
  return `${LOANS_PATH}/yeni`;
}

export function loanHref(id: string) {
  return `${LOANS_PATH}/${encodeURIComponent(id)}`;
}

export function editLoanHref(id: string) {
  return `${loanHref(id)}/duzenle`;
}
