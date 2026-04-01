# AERO-FRU

System webowy do ewidencji planowanych operacji lotniczych oraz przygotowania zlecen na lot helikopterem.

Aplikacja umozliwia planowanie operacji lotniczych, zarzadzanie flota helikopterow, czlonkami zalog, ladowiskami oraz obsluge pelnego cyklu zlecen na lot z walidacja regul biznesowych i wizualizacja tras na mapie.

## Stack technologiczny

### Backend
- **Java 21** + **Spring Boot 3.4.4**
- Spring Data JPA + Hibernate
- Spring Security + JWT (jjwt 0.12.6)
- MapStruct 1.6.3
- Flyway (migracje bazy danych)
- Lombok
- Maven

### Frontend
- **Angular** (najnowsza wersja)
- TypeScript
- SCSS
- Leaflet (mapy)
- Vite

### Baza danych
- **Oracle Database** (23 Free)

### Testy
- Robot Framework (testy API e2e)

## Struktura projektu

```
aero-fru/
├── backend/                    # Aplikacja Spring Boot
│   ├── src/main/java/pl/aero/fru/
│   │   ├── config/             # Konfiguracja (Security, CORS, JPA)
│   │   ├── controller/         # Kontrolery REST API
│   │   ├── dto/                # Obiekty transferu danych
│   │   ├── entity/             # Encje JPA
│   │   ├── exception/          # Obsluga bledow
│   │   ├── mapper/             # Mappery MapStruct
│   │   ├── repository/         # Repozytoria Spring Data
│   │   ├── security/           # JWT, filtry uwierzytelniania
│   │   ├── service/            # Logika biznesowa
│   │   └── validator/          # Walidatory regul biznesowych
│   └── src/main/resources/
│       ├── application.yml     # Konfiguracja aplikacji
│       └── db/migration/       # Migracje Flyway
├── frontend/                   # Aplikacja Angular
│   └── src/app/
│       ├── core/               # Serwisy, modele, guardy, interceptory
│       ├── features/           # Moduly funkcjonalne
│       │   ├── admin/          # Helikoptery, czlonkowie zalog, ladowiska, uzytkownicy
│       │   ├── flight-orders/  # Zlecenia na lot
│       │   └── operations/     # Planowane operacje lotnicze
│       ├── layout/             # Header, sidebar, main layout
│       └── shared/             # Komponenty wspoldzielone (mapa, KML upload, statusy)
├── migrations/                 # Skrypty SQL migracji
├── tests/                      # Testy Robot Framework
├── docker-compose.yml          # Docker Compose (Oracle + backend)
└── AERO PRD.md                 # Dokument wymagan produktowych
```

## Wymagania

- Java 21+
- Maven 3.9+
- Node.js 18+ i npm
- Oracle Database 23 (lub Docker)

## Uruchomienie

### Przez Docker Compose (zalecane)

```bash
docker-compose up -d
```

Uruchamia:
- **Oracle DB** na porcie `1522` (uzytkownik: `aero_fru` / haslo: `aero_fru`)
- **Backend** na porcie `8080`

Nastepnie uruchom frontend:

```bash
cd frontend
npm install
npm start
```

Frontend dostepny pod `http://localhost:4200`.

### Reczne uruchomienie

#### Backend

Ustaw zmienne srodowiskowe:

| Zmienna | Opis | Domyslna wartosc |
|---------|------|------------------|
| `DB_HOST` | Host bazy danych | `localhost` |
| `DB_PORT` | Port bazy danych | `1521` |
| `DB_SERVICE` | Nazwa serwisu Oracle | `FREEPDB1` |
| `DB_USERNAME` | Uzytkownik bazy danych | `aero_fru` |
| `DB_PASSWORD` | Haslo do bazy danych | `aero_fru` |
| `JWT_SECRET` | Klucz szyfrowania JWT | (klucz deweloperski) |
| `SERVER_PORT` | Port serwera | `8080` |
| `CORS_ORIGINS` | Dozwolone originy CORS | `http://localhost:4200` |

```bash
cd backend
mvn spring-boot:run
```

#### Frontend

```bash
cd frontend
npm install
npm start
```

## Endpointy API

| Endpoint | Opis |
|----------|------|
| `POST /api/auth/login` | Logowanie (JWT) |
| `GET /api/auth/current-user` | Aktualnie zalogowany uzytkownik |
| `GET/POST/PUT /api/helicopters` | Zarzadzanie helikopterami |
| `GET/POST/PUT /api/crew-members` | Zarzadzanie czlonkami zalog |
| `GET/POST/PUT /api/landing-sites` | Zarzadzanie ladowiskami |
| `GET/POST/PUT /api/users` | Zarzadzanie uzytkownikami |
| `GET/POST/PUT /api/operations` | Planowane operacje lotnicze |
| `GET/POST/PUT /api/flight-orders` | Zlecenia na lot |
| `GET /api/dictionary/*` | Slowniki (role, statusy, rodzaje czynnosci) |

## Role uzytkownikow

| Rola | Administracja | Planowanie operacji | Zlecenia na lot |
|------|:-------------:|:-------------------:|:---------------:|
| Administrator systemu | tworzenie / edycja / podglad | podglad | podglad |
| Osoba planujaca (DE/CJI) | brak | tworzenie / edycja / podglad | brak |
| Osoba nadzorujaca (DB) | podglad | tworzenie / edycja / podglad | edycja / podglad |
| Pilot | podglad | podglad | tworzenie / edycja / podglad |

## Glowne funkcje

- **Helikoptery** — rejestr floty z danymi technicznymi (zasieg, udzwig, przeglady)
- **Czlonkowie zalog** — piloci i obserwatorzy z licencjami i szkoleniami
- **Ladowiska** — lotniska i ladowiska ze wspolrzednymi geograficznymi
- **Planowane operacje lotnicze** — pelny cykl zycia operacji z plikami KML, mapa i historia zmian
- **Zlecenia na lot** — tworzenie zlecen z walidacja (waznosc przegladow, licencji, szkolen, udzwig, zasieg), wizualizacja trasy na mapie
- **Przetwarzanie KML** — import zbiorow punktow i sladu tras lotniczych

## Migracje bazy danych

Migracje Flyway uruchamiaja sie automatycznie przy starcie backendu. Pliki migracji znajduja sie w:
- `backend/src/main/resources/db/migration/` — migracje w aplikacji
- `migrations/` — dodatkowe skrypty SQL

## Testy

Testy API (Robot Framework):

```bash
cd tests
pip install -r requirements.txt
bash run_tests.sh
```

Szczegoly w `tests/README.md`.
