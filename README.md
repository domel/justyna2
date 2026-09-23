# Testy z ustaw

Statyczna aplikacja webowa do nauki przepisów prawnych poprzez testy jednokrotnego wyboru i infografiki.

Postęp nauki oraz niedokończone sesje są zapisywane lokalnie w przeglądarce. Po ponownym otwarciu test jest kontynuowany od ostatniego pytania. Pytanie, na które udzielono poprawnej odpowiedzi w dwóch kolejnych ukończonych sesjach, nie pojawia się w następnych testach. Każde pytanie można też ręcznie usunąć z puli po potwierdzeniu tej decyzji. Przycisk „Przywróć wszystkie pytania” na stronie głównej zeruje ten postęp, przywraca ręcznie usunięte pytania i usuwa niedokończone sesje.

Wersja opublikowana: [https://domel.github.io/justyna2/](https://domel.github.io/justyna2/)

## Instalacja na telefonie

Aplikacja działa jako PWA i po pierwszym pełnym wczytaniu może być używana bez połączenia z internetem.

Na Androidzie:

1. Otwórz opublikowaną stronę w Chrome na Androidzie.
2. Naciśnij „Zainstaluj aplikację” na stronie głównej i potwierdź instalację.

Przycisk pojawia się tylko na Androidzie, gdy Chrome udostępnia instalację, i znika po zainstalowaniu aplikacji. W Firefoksie należy wybrać z menu przeglądarki „Zainstaluj aplikację” albo „Dodaj do ekranu głównego”.

Zainstalowana aplikacja ma własną ikonę i uruchamia się w osobnym oknie. Chrome zapewnia pełny tryb instalacji PWA; Firefox obsługuje dodanie aplikacji do ekranu głównego i jej działanie offline.

## Materiały do nauki

Sekcja „Nauka” zawiera 14 infografik i 5 dokumentów PDF z katalogu `materialy-do-nauki`. Galeria i pełne wersje obrazów są dostosowane do ekranów telefonów. Dokumenty PDF otwierają się przez link „Otwórz dokument PDF”. Wszystkie materiały są zapisywane przez Service Workera i po pierwszym pełnym uruchomieniu aplikacji można je otwierać bez internetu.

## Uruchomienie lokalne

Aplikacja wczytuje pliki CSV przez `fetch()`, dlatego należy uruchomić ją przez lokalny serwer HTTP, np.:

```bash
python3 -m http.server 8000
```

Następnie otwórz:

```text
http://localhost:8000/
```

Możliwe jest również wejście bezpośrednio do testu, np.:

```text
http://localhost:8000/index.html?quiz=kpa
http://localhost:8000/index.html?quiz=zabytki
http://localhost:8000/index.html?quiz=przyroda
```

## Technologia

- HTML5
- CSS3
- vanilla JavaScript
- Web App Manifest
- Service Worker i Cache API
- brak backendu i procesu budowania

## Aktualizacja pytań i materiałów

Aplikacja korzysta z 7 zestawów CSV w katalogu `data`: KPA, ochrona przyrody, ochrona zabytków, Prawo budowlane, skrócony zestaw Prawa budowlanego dotyczący zabytków oraz rozporządzenia Dz.U. 2021 poz. 56 i poz. 81. Po dodaniu lub usunięciu plików zaktualizuj listy `QUIZZES` i `STUDY_MATERIALS` w `js/app.js` oraz `APP_FILES` w `sw.js`.

Zestaw Prawa budowlanego ma 490 pytań, a skrócony zestaw dotyczący zabytków 144 pytania. Oba pliki zachowują kodowanie UTF-8 z BOM oraz kolumny `pytanie`, `odpowiedz 1`–`odpowiedz 4`, `poprawna`, `opis` w tej kolejności. Kolumna `poprawna` zawiera numer odpowiedzi od 1 do 4. Pytania opracowano na podstawie tekstu jednolitego ogłoszonego w [Dz.U. z 2026 r. poz. 524](https://eli.gov.pl/eli/DU/2026/524/ogl), z uwzględnieniem obowiązujących późniejszych zmian dotyczących ochrony zabytków oraz książki obiektu budowlanego.

Zestawy dotyczące ochrony zabytków zawierają 92 pytania z ustawy, 45 pytań z rozporządzenia o rejestrze i ewidencjach oraz 59 pytań z rozporządzenia o pracach i badaniach. Zachowują ten sam format CSV. Podstawą są [ustawa o ochronie zabytków](https://eli.gov.pl/eli/DU/2024/1292/ogl) oraz teksty jednolite rozporządzeń [Dz.U. 2021 poz. 56](https://eli.gov.pl/eli/DU/2021/56/ogl) i [Dz.U. 2021 poz. 81](https://eli.gov.pl/eli/DU/2021/81/ogl). Uwzględniono również obowiązujące zmiany ustawy z [2025 r. poz. 1168](https://eli.gov.pl/eli/DU/2025/1168/ogl), [2025 r. poz. 1673](https://eli.gov.pl/eli/DU/2025/1673/ogl) i [2026 r. poz. 483](https://eli.gov.pl/eli/DU/2026/483/ogl), w tym nowe zasady zgłoszeń konserwatorskich obowiązujące od czerwca 2026 r. Stan prawny sprawdzono 23 września 2026 r.

## Aktualizowanie wersji offline

Plik `sw.js` zapisuje pliki aplikacji, zestawy pytań i infografiki w pamięci podręcznej. Po zmianie zasobów umieszczonych w tablicy `APP_FILES` należy zwiększyć wersję w stałej `CACHE_NAME`, np. z `testy-z-ustaw-v19` na `testy-z-ustaw-v20`. Dzięki temu zainstalowane aplikacje usuną poprzedni cache i pobiorą aktualną wersję.
