# Knihovna Emi 📚

Osobní offline správce knihovny – mobilní aplikace pro **Android** a **web** (PC).

Napsáno v React Native + Expo. Data jsou uložena lokálně na zařízení (offline-first).

---

## Požadavky

- [Node.js](https://nodejs.org/) 18 nebo novější
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

---

## Instalace

```bash
# 1. Přejít do složky projektu
cd "Knihovna Emi"

# 2. Nainstalovat závislosti
npm install
```

---

## Spuštění

### 🌐 Web (testování na PC)

```bash
npm run web
# nebo
npx expo start --web
```

Aplikace se otevře v prohlížeči na adrese `http://localhost:8081`.

### 📱 Android (Expo Go)

1. Nainstalujte aplikaci **[Expo Go](https://expo.dev/go)** z Google Play na svůj telefon.
2. Spusťte vývojový server:

```bash
npx expo start
```

3. Naskenujte QR kód aplikací **Expo Go** (kamera nebo přímo v aplikaci).

> Telefon a PC musí být ve stejné Wi-Fi síti.

---

## Struktura projektu

```
Knihovna Emi/
├── App.js                        # Kořenová komponenta – navigace
├── app.json                      # Konfigurace Expo
├── babel.config.js
├── package.json
└── src/
    ├── components/
    │   ├── BookCard.js           # Karta knihy v seznamu
    │   ├── ConfirmModal.js       # Potvrzovací dialog
    │   └── RatingDisplay.js      # Zobrazení hodnocení (★ nebo DNF)
    ├── screens/
    │   ├── HomeScreen.js         # Seznam knih (hledání, filtr, řazení)
    │   ├── BookFormScreen.js     # Formulář přidat/upravit knihu
    │   └── BackupScreen.js       # Export a import zálohy
    ├── services/
    │   ├── storage.js            # CRUD operace přes AsyncStorage
    │   └── backup.js             # Export/import JSON (web + Android)
    └── utils/
        ├── uuid.js               # Generátor UUID v4
        └── validation.js         # Validace dat knihy
```

---

## Datový model

| Pole            | Typ                          | Popis                                    |
|-----------------|------------------------------|------------------------------------------|
| `id`            | string (UUID)                | Unikátní identifikátor                   |
| `umisteni`      | string                       | Fyzická pozice (`A1B2C` nebo `X`)        |
| `nazev_cz`      | string                       | Český název (povinný)                    |
| `nazev_original`| string                       | Originální název (nepovinný)             |
| `autor`         | string                       | Autor (povinný)                          |
| `nakladatelstvi`| string                       | Nakladatelství (nepovinné)               |
| `format`        | `fyzicka` / `audio` / `ekniha` | Formát knihy                           |
| `hodnoceni`     | number 0–5                   | 0 = DNF, 1–5 = hvězdičky                |
| `created_at`    | ISO 8601                     | Datum vytvoření                          |
| `updated_at`    | ISO 8601                     | Datum poslední změny                     |

---

## Pravidla validace

### Umístění (`umisteni`)
- Musí být přesně `"X"` (jedno velké X)
- **nebo** přesně 5 znaků z množiny `[A-Z0-9]` (např. `A1B2C`)
- Pro format `audio` nebo `ekniha` se automaticky nastaví na `"X"`

### Hodnocení (`hodnoceni`)
- `0` = DNF (Did Not Finish – nedočteno) → zobrazuje se červený text **DNF**
- `1–5` = hvězdičky → zobrazuje se např. `★★★☆☆`
- Výběr přes rozbalovací menu (ne klikatelné hvězdičky)

---

## Záloha dat

### Export
- Uloží všechna data do souboru `knihovna_emi_RRRR-MM-DD.json`
- **Web**: soubor se stáhne prohlížečem
- **Android**: zobrazí se dialog pro sdílení / uložení souboru

### Import
- Načte data ze souboru JSON
- ⚠️ **Přepíše všechna stávající data!**
- Formát: JSON array s objekty knih (stejný jako export)

---

## Technologie

| Technologie | Verze | Účel |
|-------------|-------|------|
| Expo SDK | ~51 | Vývojový framework |
| React Native | 0.74 | UI framework |
| React Navigation | 6 | Navigace mezi obrazovkami |
| AsyncStorage | 1.23 | Lokální datové úložiště |
| @react-native-picker/picker | 2.7 | Dropdown výběr (formát, hodnocení) |
| expo-file-system | 17 | Čtení/zápis souborů (Android) |
| expo-sharing | 12 | Sdílení souboru (Android) |
| expo-document-picker | 12 | Výběr souboru pro import |
| react-native-web | ~0.19 | Webový renderer |
