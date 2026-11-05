// Hesaplarım adresleri (Profil → Hesaplarım):
//   /profil/hesaplar · /profil/hesaplar/yeni · /profil/hesaplar/[id]/duzenle · /profil/hesaplar/aktarim

export const ACCOUNTS_PATH = "/profil/hesaplar";

export function newAccountHref() {
  return `${ACCOUNTS_PATH}/yeni`;
}

export function editAccountHref(id: string) {
  return `${ACCOUNTS_PATH}/${encodeURIComponent(id)}/duzenle`;
}

export function transferHref() {
  return `${ACCOUNTS_PATH}/aktarim`;
}
