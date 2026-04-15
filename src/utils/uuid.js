/**
 * Generátor UUID v4 bez externích závislostí.
 * Používá Math.random – vhodné pro lokální ID bez potřeby kryptografické bezpečnosti.
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
