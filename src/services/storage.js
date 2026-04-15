/**
 * Vrstva pro práci s lokálním úložištěm (AsyncStorage).
 * Na Androidu jde o nativní async storage, na webu o localStorage.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'knihovna_emi_books';

/**
 * Načte všechny knihy z úložiště.
 * Při chybě vrátí prázdné pole – aplikace zůstane funkční.
 */
export async function getBooks() {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) return [];
    return JSON.parse(json);
  } catch (error) {
    console.error('Chyba při načítání knih:', error);
    return [];
  }
}

/**
 * Přepíše celé úložiště zadaným polem knih.
 */
export async function saveBooks(books) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  } catch (error) {
    console.error('Chyba při ukládání knih:', error);
    throw error;
  }
}

/**
 * Přidá novou knihu do úložiště.
 */
export async function addBook(book) {
  const books = await getBooks();
  books.push(book);
  await saveBooks(books);
}

/**
 * Aktualizuje existující knihu podle id.
 */
export async function updateBook(updatedBook) {
  const books = await getBooks();
  const index = books.findIndex((b) => b.id === updatedBook.id);
  if (index !== -1) {
    books[index] = updatedBook;
    await saveBooks(books);
  }
}

/**
 * Smaže knihu s daným id.
 */
export async function deleteBook(id) {
  const books = await getBooks();
  const filtered = books.filter((b) => b.id !== id);
  await saveBooks(filtered);
}

/**
 * Nahradí všechna data importovaným polem knih.
 * Používá se při importu zálohy.
 */
export async function importBooks(books) {
  await saveBooks(books);
}
