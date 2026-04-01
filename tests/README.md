# Testy API - Robot Framework

## Wymagania

- Python 3.10+
- Docker + Docker Compose (backend + Oracle DB)

## Instalacja

```bash
cd tests
pip install -r requirements.txt
```

## Przygotowanie bazy testowej

1. Uruchom kontenery:
   ```bash
   docker-compose up -d
   ```

2. Poczekaj na healthcheck backendu (~2 min).

3. Załaduj dane testowe do bazy Oracle:
   ```bash
   docker exec -i aero-fru-oracle sqlplus aero_fru/aero_fru@//localhost:1521/FREEPDB1 < testdata/seed_test_data.sql
   ```

## Uruchamianie testów

```bash
# Wszystkie testy
python -m robot --outputdir results .

# Pojedynczy suite
python -m robot --outputdir results 01_auth.robot

# Lub użyj skryptu
bash run_tests.sh
bash run_tests.sh 01_auth
```

## Struktura testów

| Plik | Opis | Liczba testów |
|------|------|---------------|
| `01_auth.robot` | Autentykacja (login, /me, JWT) | 10 |
| `02_users.robot` | CRUD użytkowników + autoryzacja | 9 |
| `03_helicopters.robot` | CRUD helikopterów + autoryzacja | 8 |
| `04_crew_members.robot` | CRUD członków załogi + walidacja | 7 |
| `05_landing_sites.robot` | CRUD lądowisk + walidacja GPS | 7 |
| `06_dictionaries.robot` | Słowniki (role, statusy, typy) | 6 |
| `07_operations.robot` | Operacje (CRUD, KML, komentarze, historia) | 10 |
| `08_flight_orders.robot` | Zlecenia lotów (CRUD, statusy, autoryzacja) | 12 |

## Dane testowe

Plik `testdata/seed_test_data.sql` tworzy:

- 4 użytkowników (po jednym na rolę), hasło: `Test1234`
- 2 helikoptery (SP-TST1 active, SP-TST2 inactive)
- 2 członków załogi (pilot + obserwator)
- 2 lądowiska (Warszawa, Kraków)

## Wyniki

Po uruchomieniu testów, raporty dostępne w `results/`:
- `report.html` - raport zbiorczy
- `log.html` - szczegółowy log
- `output.xml` - wyniki w XML
