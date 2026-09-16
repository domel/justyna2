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

Sekcja „Nauka” zawiera 8 infografik i 2 kompendia PDF z katalogu `materialy-do-nauki`. Galeria i pełne wersje obrazów są dostosowane do ekranów telefonów. Kompendia otwierają się przez link „Otwórz dokument PDF”. Wszystkie materiały są zapisywane przez Service Workera i po pierwszym pełnym uruchomieniu aplikacji można je otwierać bez internetu.

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

## Aktualizowanie wersji offline

Plik `sw.js` zapisuje pliki aplikacji, zestawy pytań i infografiki w pamięci podręcznej. Po zmianie zasobów umieszczonych w tablicy `APP_FILES` należy zwiększyć wersję w stałej `CACHE_NAME`, np. z `testy-z-ustaw-v8` na `testy-z-ustaw-v9`. Dzięki temu zainstalowane aplikacje usuną poprzedni cache i pobiorą aktualną wersję.
