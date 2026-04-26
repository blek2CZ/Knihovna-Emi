/**
 * Validační funkce pro datový model knihy.
 */

/**
 * Validuje pole umisteni podle pravidel:
 * - pokud je formát audio/ekniha → automaticky "X", validace se přeskakuje
 * - pokud je formát fyzicka → nesmí začínat písmenem X (ani být jen "X")
 *   musí být přesně 5 znaků [A-Z0-9] nezačínajících X
 * - jinak → "X" nebo přesně 5 znaků [A-Z0-9]
 */
export function validateUmisteni(umisteni, format) {
  // Audio a e-knihy mají umístění automaticky "X" – validace se přeskakuje
  if (format === 'audio' || format === 'ekniha') {
    return { valid: true };
  }

  if (!umisteni || umisteni.trim() === '') {
    return { valid: false, error: 'Umístění je povinné.' };
  }

  // Fyzická kniha nesmí mít umístění začínající na X
  if (format === 'fyzicka') {
    if (umisteni.toUpperCase().startsWith('X')) {
      return {
        valid: false,
        error: 'Fyzická kniha nemůže mít umístění začínající písmenem X.',
      };
    }
    if (/^[A-Z0-9]{5}$/.test(umisteni)) {
      return { valid: true };
    }
    return {
      valid: false,
      error: 'Umístění musí být přesně 5 velkých znaků [A-Z0-9] nezačínajících X (např. "A1B2C").',
    };
  }

  if (umisteni === 'X') {
    return { valid: true };
  }

  if (/^[A-Z0-9]{5}$/.test(umisteni)) {
    return { valid: true };
  }

  return {
    valid: false,
    error: 'Umístění musí být "X" nebo přesně 5 velkých znaků [A-Z0-9] (např. "A1B2C").',
  };
}

/**
 * Kompletní validace celého formuláře knihy.
 * Vrátí objekt { pole: 'chybová zpráva' }. Prázdný objekt = bez chyb.
 */
export function validateBook(book) {
  const errors = {};

  // Umístění
  const umisteniResult = validateUmisteni(book.umisteni, book.format);
  if (!umisteniResult.valid) {
    errors.umisteni = umisteniResult.error;
  }

  // Český název – povinný
  if (!book.nazev_cz || book.nazev_cz.trim() === '') {
    errors.nazev_cz = 'Český název je povinný.';
  }

  // Autor – povinný
  if (!book.autor || book.autor.trim() === '') {
    errors.autor = 'Autor je povinný.';
  }

  // Formát – povinný
  if (!book.format) {
    errors.format = 'Formát je povinný.';
  }

  // Hodnocení – nepovinné; pokud je vyplněno, musí být číslo 0–5
  if (book.hodnoceni !== null && book.hodnoceni !== undefined && book.hodnoceni !== '' && book.hodnoceni !== 'none') {
    const h = Number(book.hodnoceni);
    if (isNaN(h) || h < 0 || h > 5) {
      errors.hodnoceni = 'Hodnocení musí být 0–5.';
    }
  }

  return errors;
}
