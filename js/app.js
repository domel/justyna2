(function () {
  "use strict";

  const QUIZZES = Object.freeze({
    "kpa": {
      "title": "Kodeks postępowania administracyjnego",
      "shortTitle": "KPA",
      "file": "data/pytania_Kodeks_postepowania_administracyjnego_KPA.csv"
    },
    "przyroda": {
      "title": "Ustawa o ochronie przyrody",
      "shortTitle": "O ochronie przyrody",
      "file": "data/pytania_ustawa_o_ochronie_przyrody.csv"
    },
    "zabytki": {
      "title": "Ustawa o ochronie zabytków i opiece nad zabytkami",
      "shortTitle": "O ochronie zabytków",
      "file": "data/pytania_ustawa_o_ochronie_zabytkow_i_opiece_nad_zabytkami.csv"
    },
    "prawo-budowlane": {
      "title": "Prawo budowlane",
      "shortTitle": "Prawo budowlane",
      "file": "data/pytania_Prawo_budowlane.csv"
    },
    "prawo-budowlane-zabytki": {
      "title": "Prawo budowlane: skrócony zestaw dotyczący zabytków",
      "shortTitle": "Prawo budowlane: zabytki",
      "file": "data/pytania_Prawo_budowlane_skrocone_zabytki.csv"
    },
    "rozporzadzenie-56": {
      "title": "Rozporządzenie: rejestr i ewidencja zabytków (Dz.U. 2021 poz. 56)",
      "shortTitle": "Rejestr i ewidencja zabytków",
      "file": "data/pytania_rozporzadzenie_DzU_2021_poz_56.csv"
    },
    "rozporzadzenie-81": {
      "title": "Rozporządzenie: pozwolenia na prace przy zabytkach (Dz.U. 2021 poz. 81)",
      "shortTitle": "Pozwolenia na prace przy zabytkach",
      "file": "data/pytania_rozporzadzenie_DzU_2021_poz_81.csv"
    }
  });

  const STUDY_MATERIALS = Object.freeze([
    { id: "kodeks-postepowania", title: "Kodeks postępowania administracyjnego", file: "materialy-do-nauki/Kodeks postępowania.png" },
    { id: "kodeks-postepowania-plansza", title: "Kodeks postępowania administracyjnego – plansza", file: "materialy-do-nauki/Kodeks-postępowania.png" },
    { id: "kpa-definicje", title: "KPA – definicje i pojęcia", file: "materialy-do-nauki/KPA-definicje.png" },
    { id: "kpa-terminy", title: "KPA – terminy i środki", file: "materialy-do-nauki/KPA-terminy.png" },
    { id: "kpa-praktyka", title: "KPA w praktyce", file: "materialy-do-nauki/kpo-praktyka.png" },
    { id: "ochrona-przyrody", title: "Ustawa o ochronie przyrody", file: "materialy-do-nauki/Ustawa o ochronie przyrody.png" },
    { id: "prawo-budowlane", title: "Prawo budowlane", file: "materialy-do-nauki/Prawo budowlane.png" },
    { id: "ochrona-zabytkow", title: "Ustawa o ochronie zabytków", file: "materialy-do-nauki/Ustawa o ochronie zabytków.png" },
    { id: "ochrona-zabytkow-podlaskie", title: "Ochrona zabytków (Podlaskie)", file: "materialy-do-nauki/Ochrona zabytków Podlaskie.png" },
    { id: "prawo-budowlane-podlaskie", title: "Prawo budowlane (Podlaskie)", file: "materialy-do-nauki/Prawo budowlane Podlaskie.png" },
    { id: "kpa-podlaskie", title: "KPA (Podlaskie)", file: "materialy-do-nauki/KPA Podlaskie.png" },
    { id: "ochrona-przyrody-podlaskie", title: "Ochrona przyrody (Podlaskie)", file: "materialy-do-nauki/Ochrona przyrody Podlaskie.png" },
    { id: "kazusy", title: "Kazusy rekrutacyjne (WUOZ Białystok)", type: "pdf", preview: "materialy-do-nauki/miniatury/kazusy.png", file: "materialy-do-nauki/Kazusy.pdf" },
    { id: "kompendium-zabytki-zielen", title: "Kompendium: ochrona zabytków i zieleń (Podlaskie)", type: "pdf", preview: "materialy-do-nauki/miniatury/kompendium-normalne.png", file: "materialy-do-nauki/Kompendium_zabytki_zielen_Podlaskie_normalne-1.pdf" },
    { id: "kompendium-zabytki-zielen-adhd", title: "Kompendium: ochrona zabytków i zieleń (wersja ADHD)", type: "pdf", preview: "materialy-do-nauki/miniatury/kompendium-adhd.png", file: "materialy-do-nauki/Kompendium_zabytki_zielen_Podlaskie_ADHD-1.pdf" }
  ]);

  const LETTERS = ["A", "B", "C", "D"];
  const LEARNING_PROGRESS_KEY = "ustawy-learning-progress-v1";
  const SAVED_SESSIONS_KEY = "ustawy-saved-sessions-v1";
  const cache = new Map();
  const app = document.getElementById("app");
  let learningProgress = loadLearningProgress();
  let savedSessions = loadSavedSessions();

  const state = {
    quizId: null,
    sourceQuestions: [],
    questions: [],
    currentQuestionIndex: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    answered: false,
    selectedAnswerIndex: null,
    answers: [],
    sessionCompleted: false,
    newlyMastered: 0
  };

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function clearApp() {
    app.replaceChildren();
  }

  function shuffleArray(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function prepareQuizSession(sourceQuestions) {
    return shuffleArray(sourceQuestions).map(question => ({
      ...question,
      answers: shuffleArray(question.answers.map(answer => ({ ...answer })))
    }));
  }

  function resetSessionCounters() {
    state.currentQuestionIndex = 0;
    state.correctAnswers = 0;
    state.incorrectAnswers = 0;
    state.answered = false;
    state.selectedAnswerIndex = null;
    state.answers = [];
    state.sessionCompleted = false;
    state.newlyMastered = 0;
  }

  function loadLearningProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(LEARNING_PROGRESS_KEY) || "{}");
      return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
    } catch (_) {
      return {};
    }
  }

  function saveLearningProgress() {
    try {
      localStorage.setItem(LEARNING_PROGRESS_KEY, JSON.stringify(learningProgress));
    } catch (_) {
      // Progress still works until the page is closed when storage is unavailable.
    }
  }

  function loadSavedSessions() {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVED_SESSIONS_KEY) || "{}");
      return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
    } catch (_) {
      return {};
    }
  }

  function persistSavedSessions() {
    try {
      localStorage.setItem(SAVED_SESSIONS_KEY, JSON.stringify(savedSessions));
    } catch (_) {
      // The current page still keeps the session when storage is unavailable.
    }
  }

  function hasSavedSession(quizId) {
    const session = savedSessions[quizId];
    return Boolean(session && Array.isArray(session.questions) && session.questions.length > 0);
  }

  function saveCurrentSession() {
    if (!state.quizId || state.questions.length === 0 || state.sessionCompleted) return;

    savedSessions[state.quizId] = {
      questions: state.questions,
      currentQuestionIndex: state.currentQuestionIndex,
      answered: state.answered,
      selectedAnswerIndex: state.selectedAnswerIndex,
      answers: state.answers,
      savedAt: Date.now()
    };
    persistSavedSessions();
  }

  function clearSavedSession(quizId) {
    if (!quizId || !Object.prototype.hasOwnProperty.call(savedSessions, quizId)) return;
    delete savedSessions[quizId];
    persistSavedSessions();
  }

  function restoreSavedSession(quizId, sourceQuestions) {
    const saved = savedSessions[quizId];
    if (!saved || !Array.isArray(saved.questions) || saved.questions.length === 0) return false;

    const sourceQuestionIds = new Set(sourceQuestions.map(getQuestionId));
    const questionsAreValid = saved.questions.every(question => (
      question
      && typeof question.question === "string"
      && Array.isArray(question.answers)
      && question.answers.length === LETTERS.length
      && question.answers.filter(answer => answer && answer.isCorrect === true).length === 1
      && sourceQuestionIds.has(getQuestionId(question))
    ));
    const indexIsValid = Number.isInteger(saved.currentQuestionIndex)
      && saved.currentQuestionIndex >= 0
      && saved.currentQuestionIndex < saved.questions.length;
    const answersAreValid = Array.isArray(saved.answers)
      && saved.answers.every(answer => (
        answer
        && Number.isInteger(answer.questionIndex)
        && answer.questionIndex >= 0
        && answer.questionIndex <= saved.currentQuestionIndex
        && Number.isInteger(answer.selectedIndex)
        && answer.selectedIndex >= 0
        && answer.selectedIndex < LETTERS.length
        && typeof answer.isCorrect === "boolean"
      ));
    const answeredIsValid = typeof saved.answered === "boolean"
      && (!saved.answered || (
        Number.isInteger(saved.selectedAnswerIndex)
        && saved.selectedAnswerIndex >= 0
        && saved.selectedAnswerIndex < LETTERS.length
      ));

    if (!questionsAreValid || !indexIsValid || !answersAreValid || !answeredIsValid) {
      clearSavedSession(quizId);
      return false;
    }

    const currentAnswer = saved.answers.find(answer => answer.questionIndex === saved.currentQuestionIndex);
    if (saved.answered !== Boolean(currentAnswer)) {
      clearSavedSession(quizId);
      return false;
    }

    state.questions = saved.questions;
    state.currentQuestionIndex = saved.currentQuestionIndex;
    state.answers = saved.answers;
    state.correctAnswers = saved.answers.filter(answer => answer.isCorrect).length;
    state.incorrectAnswers = saved.answers.length - state.correctAnswers;
    state.answered = saved.answered;
    state.selectedAnswerIndex = saved.answered ? saved.selectedAnswerIndex : null;
    state.sessionCompleted = false;
    state.newlyMastered = 0;
    return true;
  }

  function getQuestionId(question) {
    const correctAnswer = question.answers.find(answer => answer.isCorrect);
    return JSON.stringify([question.question, correctAnswer ? correctAnswer.text : ""]);
  }

  function getQuizProgress(quizId) {
    const progress = learningProgress[quizId];
    return progress && typeof progress === "object" && !Array.isArray(progress) ? progress : {};
  }

  function isQuestionMastered(quizId, question) {
    return getQuizProgress(quizId)[getQuestionId(question)] >= 2;
  }

  function getAvailableQuestions(quizId, questions) {
    return questions.filter(question => !isQuestionMastered(quizId, question));
  }

  function commitSessionProgress() {
    if (state.sessionCompleted || !state.quizId) return;

    const quizProgress = { ...getQuizProgress(state.quizId) };
    let newlyMastered = 0;

    state.answers.forEach(answer => {
      const question = state.questions[answer.questionIndex];
      if (!question) return;

      const questionId = getQuestionId(question);
      const previousStreak = Number(quizProgress[questionId]) || 0;
      const nextStreak = answer.isCorrect ? Math.min(previousStreak + 1, 2) : 0;

      if (nextStreak === 0) {
        delete quizProgress[questionId];
      } else {
        quizProgress[questionId] = nextStreak;
      }

      if (previousStreak < 2 && nextStreak === 2) newlyMastered += 1;
    });

    learningProgress[state.quizId] = quizProgress;
    saveLearningProgress();
    state.sessionCompleted = true;
    state.newlyMastered = newlyMastered;
  }

  function resetAllLearningProgress() {
    const confirmed = window.confirm(
      "Przywrócić wszystkie pytania, wyzerować serie poprawnych odpowiedzi i usunąć niedokończone sesje?"
    );
    if (!confirmed) return;

    learningProgress = {};
    savedSessions = {};
    try {
      localStorage.removeItem(LEARNING_PROGRESS_KEY);
      localStorage.removeItem(SAVED_SESSIONS_KEY);
    } catch (_) {
      // The in-memory progress has already been cleared.
    }
    showHome({ updateHistory: false });
  }

  function resetQuizLearningProgress(quizId) {
    delete learningProgress[quizId];
    saveLearningProgress();
    clearSavedSession(quizId);
    startQuiz(quizId, { updateHistory: false });
  }

  function removeCurrentQuestion() {
    const question = state.questions[state.currentQuestionIndex];
    if (!state.quizId || !question) return;

    const confirmed = window.confirm(
      "Czy na pewno usunąć to pytanie z puli? Można je później przywrócić przyciskiem „Przywróć wszystkie pytania”."
    );
    if (!confirmed) return;

    const quizProgress = { ...getQuizProgress(state.quizId) };
    quizProgress[getQuestionId(question)] = 2;
    learningProgress[state.quizId] = quizProgress;
    saveLearningProgress();

    const removedIndex = state.currentQuestionIndex;
    const removedAnswer = state.answers.find(answer => answer.questionIndex === removedIndex);
    if (removedAnswer) {
      if (removedAnswer.isCorrect) state.correctAnswers -= 1;
      else state.incorrectAnswers -= 1;
    }
    state.answers = state.answers
      .filter(answer => answer.questionIndex !== removedIndex)
      .map(answer => ({
        ...answer,
        questionIndex: answer.questionIndex > removedIndex
          ? answer.questionIndex - 1
          : answer.questionIndex
      }));
    state.questions.splice(removedIndex, 1);
    state.answered = false;
    state.selectedAnswerIndex = null;

    if (state.questions.length === 0) {
      clearSavedSession(state.quizId);
      showMastered(QUIZZES[state.quizId]);
    } else if (state.currentQuestionIndex >= state.questions.length) {
      showResults();
    } else {
      saveCurrentSession();
      renderQuestion();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function setDocumentTitle(suffix) {
    document.title = suffix ? `${suffix} — Testy z ustaw` : "Testy z ustaw";
  }

  function updateURL(quizId, { replace = false, view = null, materialId = null } = {}) {
    const url = new URL(window.location.href);
    url.searchParams.delete("quiz");
    url.searchParams.delete("view");
    url.searchParams.delete("material");
    if (quizId) {
      url.searchParams.set("quiz", quizId);
    } else if (view) {
      url.searchParams.set("view", view);
      if (materialId) url.searchParams.set("material", materialId);
    }
    const method = replace ? "replaceState" : "pushState";
    window.history[method]({}, "", url);
  }

  function getBestScore(quizId) {
    try {
      const value = localStorage.getItem(`ustawy-best-${quizId}`);
      if (value === null) return null;
      const score = Number(value);
      return Number.isFinite(score) ? score : null;
    } catch (_) {
      return null;
    }
  }

  function saveBestScore(quizId, score) {
    try {
      const previous = getBestScore(quizId);
      if (previous === null || score > previous) {
        localStorage.setItem(`ustawy-best-${quizId}`, String(score));
      }
    } catch (_) {
      // localStorage is an optional enhancement only.
    }
  }

  function updateInstallControl() {
    const area = document.getElementById("install-app-area");
    const button = document.getElementById("install-app-button");
    if (!area || !button) return;

    const installAPI = window.PWAInstall;
    const canShow = Boolean(
      installAPI
      && installAPI.isAndroidDevice()
      && !installAPI.isStandalone()
      && installAPI.canInstall()
    );
    area.hidden = !canShow;
    button.dataset.installReady = String(canShow);
  }

  async function handleInstallApp() {
    const button = document.getElementById("install-app-button");
    const status = document.getElementById("install-app-status");
    if (!button || !status) return;

    const installAPI = window.PWAInstall;
    if (!installAPI) {
      status.textContent = "W menu przeglądarki wybierz „Dodaj do ekranu głównego”.";
      return;
    }

    button.disabled = true;
    const result = await installAPI.install();
    button.disabled = false;

    if (result.outcome === "accepted") {
      status.textContent = "Instalowanie aplikacji…";
    } else if (result.outcome === "dismissed") {
      status.textContent = "Instalacja została anulowana. Możesz spróbować ponownie później.";
    } else {
      status.textContent = "W menu przeglądarki wybierz „Zainstaluj aplikację” lub „Dodaj do ekranu głównego”.";
    }

    updateInstallControl();
  }

  function showHome({ updateHistory = true } = {}) {
    state.quizId = null;
    state.sourceQuestions = [];
    state.questions = [];
    resetSessionCounters();
    setDocumentTitle("");
    if (updateHistory) updateURL(null);

    clearApp();
    app.className = "app-shell home-shell";

    const hero = createElement("header", "home-header");
    hero.append(
      createElement("p", "eyebrow", "NAUKA PRZEPISÓW"),
      createElement("h1", "home-title", "Testy z ustaw"),
      createElement("p", "home-subtitle", "Wybierz ustawę, z której chcesz rozwiązać test.")
    );

    const installArea = createElement("div", "home-install-area");
    installArea.id = "install-app-area";
    const installButton = createElement("button", "install-app-button", "Zainstaluj aplikację");
    installButton.id = "install-app-button";
    installButton.type = "button";
    installButton.addEventListener("click", handleInstallApp);
    const installStatus = createElement("p", "install-app-status");
    installStatus.id = "install-app-status";
    installStatus.setAttribute("aria-live", "polite");
    installArea.append(installButton, installStatus);
    hero.append(installArea);

    const grid = createElement("section", "quiz-grid");
    grid.setAttribute("aria-label", "Dostępne testy");

    const studyEntry = createElement("section", "study-entry");
    const studyButton = createElement("button", "study-entry-card");
    studyButton.type = "button";
    studyButton.setAttribute("aria-label", `Otwórz sekcję Nauka: ${STUDY_MATERIALS.length} materiałów`);
    const studyIcon = createElement("span", "study-entry-icon", "▤");
    studyIcon.setAttribute("aria-hidden", "true");
    const studyCopy = createElement("span", "study-entry-copy");
    studyCopy.append(
      createElement("span", "study-entry-label", "NAUKA"),
      createElement("span", "study-entry-title", "Materiały do nauki"),
      createElement("span", "study-entry-meta", `${STUDY_MATERIALS.length} materiałów dostępnych również offline`)
    );
    const studyArrow = createElement("span", "study-entry-arrow", "→");
    studyArrow.setAttribute("aria-hidden", "true");
    studyButton.append(studyIcon, studyCopy, studyArrow);
    studyButton.addEventListener("click", () => showStudyMaterials());
    studyEntry.append(studyButton);

    Object.entries(QUIZZES).forEach(([quizId, quiz], index) => {
      const button = createElement("button", "quiz-card");
      button.type = "button";
      button.dataset.quizId = quizId;
      const canContinue = hasSavedSession(quizId);
      button.setAttribute("aria-label", `${canContinue ? "Kontynuuj" : "Rozpocznij"} test: ${quiz.title}`);

      const ordinal = createElement("span", "quiz-card-number", String(index + 1).padStart(2, "0"));
      const title = createElement("span", "quiz-card-title", quiz.shortTitle);
      const meta = createElement("span", "quiz-card-meta");
      const best = getBestScore(quizId);
      meta.textContent = canContinue
        ? "Kontynuuj niedokończony test"
        : (best === null ? "Rozpocznij test" : `Najlepszy wynik: ${best}%`);
      const arrow = createElement("span", "quiz-card-arrow", "→");
      arrow.setAttribute("aria-hidden", "true");

      button.append(ordinal, title, meta, arrow);
      button.addEventListener("click", () => startQuiz(quizId));
      grid.append(button);
    });

    const footer = createElement("footer", "home-footer");
    const footerText = createElement(
      "p",
      "home-footer-text",
      "Pytania są losowane w każdej sesji. Po dwóch poprawnych odpowiedziach w kolejnych sesjach pytanie wypada z puli."
    );
    const resetProgress = createElement("button", "reset-progress-button", "Przywróć wszystkie pytania");
    resetProgress.type = "button";
    resetProgress.addEventListener("click", resetAllLearningProgress);
    footer.append(footerText, resetProgress);
    app.append(hero, studyEntry, grid, footer);
    updateInstallControl();
  }

  function showStudyMaterials({ updateHistory = true } = {}) {
    state.quizId = null;
    state.sourceQuestions = [];
    state.questions = [];
    resetSessionCounters();
    setDocumentTitle("Nauka");
    if (updateHistory) updateURL(null, { view: "nauka" });

    clearApp();
    app.className = "app-shell study-shell";

    const topBar = createElement("div", "topbar");
    const back = createElement("button", "back-link", "← Wróć do strony głównej");
    back.type = "button";
    back.addEventListener("click", () => showHome());
    topBar.append(back);

    const header = createElement("header", "study-header");
    header.append(
      createElement("p", "eyebrow", "MATERIAŁY DO NAUKI"),
      createElement("h1", "study-title", "Nauka"),
      createElement("p", "study-subtitle", "Wybierz infografikę lub dokument PDF.")
    );

    const gallery = createElement("section", "study-grid");
    gallery.setAttribute("aria-label", "Materiały do nauki");
    STUDY_MATERIALS.forEach((material, index) => {
      const card = createElement("button", "study-card");
      card.type = "button";
      card.dataset.materialId = material.id;
      card.setAttribute("aria-label", `Otwórz materiał: ${material.title}`);

      const preview = createElement("span", "study-card-preview");
      const image = document.createElement("img");
      image.src = material.preview || material.file;
      image.alt = "";
      image.loading = "lazy";
      image.decoding = "async";
      preview.append(image);

      const copy = createElement("span", "study-card-copy");
      copy.append(
        createElement("span", "study-card-number", String(index + 1).padStart(2, "0")),
        createElement("span", "study-card-title", material.title),
        createElement("span", "study-card-action", "Otwórz materiał →")
      );
      card.append(preview, copy);
      card.addEventListener("click", () => showStudyMaterial(material.id));
      gallery.append(card);
    });

    app.append(topBar, header, gallery);
    const firstCard = gallery.querySelector(".study-card");
    if (firstCard) firstCard.focus({ preventScroll: true });
  }

  function showStudyMaterial(materialId, { updateHistory = true } = {}) {
    const material = STUDY_MATERIALS.find(item => item.id === materialId);
    if (!material) {
      showStudyMaterials({ updateHistory });
      return;
    }

    state.quizId = null;
    setDocumentTitle(material.title);
    if (updateHistory) updateURL(null, { view: "nauka", materialId });

    clearApp();
    app.className = "app-shell study-viewer-shell";

    const topBar = createElement("div", "topbar study-viewer-topbar");
    const back = createElement("button", "back-link", "← Wróć do materiałów");
    back.type = "button";
    back.addEventListener("click", () => showStudyMaterials());
    topBar.append(back);

    const panel = createElement("article", "study-viewer");
    const header = createElement("header", "study-viewer-header");
    header.append(
      createElement("p", "eyebrow", "NAUKA"),
      createElement("h1", "study-viewer-title", material.title),
      createElement("p", "study-viewer-hint", material.type === "pdf"
        ? "Otwórz dokument PDF, aby przeczytać kompendium."
        : "Na telefonie użyj gestu powiększania, aby odczytać drobny tekst.")
    );

    panel.append(header);
    if (material.type !== "pdf") {
      const image = document.createElement("img");
      image.className = "study-viewer-image";
      image.src = material.file;
      image.alt = `Infografika: ${material.title}`;
      image.decoding = "async";
      panel.append(image);
    }

    const fullSize = createElement("a", "study-full-size-link",
      material.type === "pdf" ? "Otwórz dokument PDF" : "Otwórz obraz w pełnym rozmiarze");
    fullSize.href = material.file;
    fullSize.target = "_blank";
    fullSize.rel = "noopener";
    panel.append(fullSize);
    app.append(topBar, panel);
    window.scrollTo({ top: 0 });
  }

  function renderTopBar(quiz) {
    const topBar = createElement("div", "topbar");
    const back = createElement("button", "back-link", "← Wróć do listy ustaw");
    back.type = "button";
    back.addEventListener("click", () => showHome());
    topBar.append(back);
    return topBar;
  }

  function showLoading(quiz) {
    clearApp();
    app.className = "app-shell quiz-shell";
    app.append(renderTopBar(quiz));

    const panel = createElement("section", "quiz-panel status-panel");
    panel.setAttribute("aria-live", "polite");
    const spinner = createElement("span", "spinner");
    spinner.setAttribute("aria-hidden", "true");
    panel.append(
      spinner,
      createElement("h1", "status-title", quiz.title),
      createElement("p", "status-message", "Ładowanie pytań...")
    );
    app.append(panel);
  }

  function showError(quiz, error) {
    console.error("Nie udało się uruchomić testu:", error);
    clearApp();
    app.className = "app-shell quiz-shell";
    app.append(renderTopBar(quiz));

    const panel = createElement("section", "quiz-panel status-panel");
    panel.setAttribute("role", "alert");
    const icon = createElement("div", "status-icon error-icon", "!");
    icon.setAttribute("aria-hidden", "true");
    const title = createElement("h1", "status-title", "Nie udało się wczytać pytań.");
    const message = createElement("p", "status-message", "Sprawdź, czy plik z pytaniami istnieje i ma poprawny format.");
    const back = createElement("button", "primary-button", "Wróć do listy ustaw");
    back.type = "button";
    back.addEventListener("click", () => showHome());
    panel.append(icon, title, message, back);
    app.append(panel);
  }

  async function loadQuestions(file) {
    const response = await fetch(file, { cache: "no-cache" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} podczas pobierania ${file}`);
    }
    const text = await response.text();
    const { questions, warnings } = window.CSVUtils.parseQuestionsCSV(text);
    warnings.forEach(warning => console.warn(warning));
    return questions;
  }

  async function startQuiz(quizId, { updateHistory = true } = {}) {
    const quiz = QUIZZES[quizId];
    if (!quiz) {
      showHome({ updateHistory: false });
      if (updateHistory) updateURL(null, { replace: true });
      return;
    }

    state.quizId = quizId;
    setDocumentTitle(quiz.shortTitle);
    if (updateHistory) updateURL(quizId);
    showLoading(quiz);

    try {
      let questions = cache.get(quizId);
      if (!questions) {
        questions = await loadQuestions(quiz.file);
        cache.set(quizId, questions);
      }

      // Guard against a fast navigation change while fetch was in flight.
      if (state.quizId !== quizId) return;

      state.sourceQuestions = questions;
      if (restoreSavedSession(quizId, questions)) {
        renderQuestion();
        if (state.answered) {
          const currentAnswer = state.answers.find(answer => answer.questionIndex === state.currentQuestionIndex);
          const currentQuestion = state.questions[state.currentQuestionIndex];
          const correctIndex = currentQuestion.answers.findIndex(answer => answer.isCorrect);
          renderAnswerResult(state.selectedAnswerIndex, correctIndex, currentAnswer.isCorrect);
        }
        return;
      }

      const availableQuestions = getAvailableQuestions(quizId, questions);
      state.questions = prepareQuizSession(availableQuestions);
      resetSessionCounters();
      if (state.questions.length === 0) {
        showMastered(quiz);
      } else {
        saveCurrentSession();
        renderQuestion();
      }
    } catch (error) {
      if (state.quizId === quizId) showError(quiz, error);
    }
  }

  function showMastered(quiz) {
    clearApp();
    app.className = "app-shell quiz-shell";
    app.append(renderTopBar(quiz));

    const panel = createElement("section", "quiz-panel status-panel");
    panel.setAttribute("aria-live", "polite");
    const icon = createElement("div", "status-icon success-icon", "✓");
    icon.setAttribute("aria-hidden", "true");
    const title = createElement("h1", "status-title", "Brak pytań w puli");
    const message = createElement(
      "p",
      "status-message",
      "Wszystkie pytania zostały opanowane lub usunięte z puli. Możesz przywrócić pełną pulę i zacząć od nowa."
    );
    const reset = createElement("button", "primary-button", "Przywróć pytania z tej ustawy");
    reset.type = "button";
    reset.addEventListener("click", () => resetQuizLearningProgress(state.quizId));
    panel.append(icon, title, message, reset);
    app.append(panel);
    reset.focus({ preventScroll: true });
  }

  function renderQuestion() {
    const quiz = QUIZZES[state.quizId];
    const question = state.questions[state.currentQuestionIndex];
    if (!quiz || !question) {
      showResults();
      return;
    }

    clearApp();
    app.className = "app-shell quiz-shell";
    app.append(renderTopBar(quiz));

    const panel = createElement("section", "quiz-panel");
    const header = createElement("header", "quiz-header");
    const lawTitle = createElement("p", "law-title", quiz.title);

    const progressRow = createElement("div", "progress-row");
    const counter = createElement(
      "span",
      "question-counter",
      `Pytanie ${state.currentQuestionIndex + 1} z ${state.questions.length}`
    );
    const percent = Math.round(((state.currentQuestionIndex + 1) / state.questions.length) * 100);
    const percentText = createElement("span", "progress-percent", `${percent}%`);
    progressRow.append(counter, percentText);

    const progress = createElement("div", "progress-track");
    progress.setAttribute("role", "progressbar");
    progress.setAttribute("aria-valuemin", "0");
    progress.setAttribute("aria-valuemax", "100");
    progress.setAttribute("aria-valuenow", String(percent));
    progress.setAttribute("aria-label", "Postęp testu");
    const progressFill = createElement("div", "progress-fill");
    progressFill.style.width = `${percent}%`;
    progress.append(progressFill);

    header.append(lawTitle, progressRow, progress);

    const body = createElement("div", "question-body");
    const questionText = createElement("h1", "question-text", question.question);
    questionText.id = "question-text";

    const answers = createElement("div", "answers");
    answers.setAttribute("role", "group");
    answers.setAttribute("aria-labelledby", "question-text");

    question.answers.forEach((answer, index) => {
      const button = createElement("button", "answer-button");
      button.type = "button";
      button.dataset.answerIndex = String(index);
      button.setAttribute("aria-label", `${LETTERS[index]}. ${answer.text}`);

      const letter = createElement("span", "answer-letter", LETTERS[index]);
      letter.setAttribute("aria-hidden", "true");
      const text = createElement("span", "answer-text", answer.text);
      const marker = createElement("span", "answer-marker");
      marker.setAttribute("aria-hidden", "true");
      button.append(letter, text, marker);
      button.addEventListener("click", () => handleAnswer(index));
      answers.append(button);
    });

    const feedback = createElement("section", "feedback");
    feedback.id = "feedback";
    feedback.setAttribute("aria-live", "polite");
    feedback.hidden = true;

    const actions = createElement("div", "question-actions");
    const remove = createElement("button", "remove-question-button", "Usuń pytanie");
    remove.type = "button";
    remove.addEventListener("click", removeCurrentQuestion);
    const next = createElement("button", "primary-button next-button", "Dalej →");
    next.type = "button";
    next.id = "next-button";
    next.hidden = true;
    next.addEventListener("click", nextQuestion);
    actions.append(remove, next);

    body.append(questionText, answers, feedback, actions);
    panel.append(header, body);
    app.append(panel);

    const firstAnswer = answers.querySelector(".answer-button");
    if (firstAnswer) firstAnswer.focus({ preventScroll: true });
  }

  function handleAnswer(index) {
    if (state.answered) return;

    const question = state.questions[state.currentQuestionIndex];
    const selected = question.answers[index];
    if (!selected) return;

    state.answered = true;
    state.selectedAnswerIndex = index;

    const correctIndex = question.answers.findIndex(answer => answer.isCorrect);
    const isCorrect = selected.isCorrect;

    if (isCorrect) {
      state.correctAnswers += 1;
    } else {
      state.incorrectAnswers += 1;
    }

    state.answers.push({
      questionIndex: state.currentQuestionIndex,
      selectedIndex: index,
      correctIndex,
      isCorrect
    });

    saveCurrentSession();
    renderAnswerResult(index, correctIndex, isCorrect);
  }

  function renderAnswerResult(selectedIndex, correctIndex, isCorrect) {
    const question = state.questions[state.currentQuestionIndex];
    const buttons = [...document.querySelectorAll(".answer-button")];

    buttons.forEach((button, index) => {
      button.disabled = true;
      const marker = button.querySelector(".answer-marker");
      if (index === correctIndex) {
        button.classList.add("is-correct");
        marker.textContent = "✓";
      }
      if (index === selectedIndex && !isCorrect) {
        button.classList.add("is-incorrect");
        marker.textContent = "✕";
      }
    });

    const feedback = document.getElementById("feedback");
    feedback.replaceChildren();
    feedback.hidden = false;
    feedback.className = `feedback ${isCorrect ? "feedback-correct" : "feedback-incorrect"}`;

    const heading = createElement(
      "h2",
      "feedback-heading",
      isCorrect ? "✓ Poprawna odpowiedź" : "✕ Niepoprawna odpowiedź"
    );
    feedback.append(heading);

    if (!isCorrect) {
      const correctBlock = createElement("div", "correct-answer-block");
      correctBlock.append(
        createElement("span", "feedback-label", "Poprawna odpowiedź:"),
        createElement("p", "correct-answer-text", `${LETTERS[correctIndex]}. ${question.answers[correctIndex].text}`)
      );
      feedback.append(correctBlock);
    }

    const explanation = createElement("div", "explanation-block");
    explanation.append(
      createElement("span", "feedback-label", "Wyjaśnienie"),
      createElement("p", "explanation-text", question.explanation || "Brak dodatkowego wyjaśnienia.")
    );
    feedback.append(explanation);

    const next = document.getElementById("next-button");
    next.hidden = false;
    if (state.currentQuestionIndex === state.questions.length - 1) {
      next.textContent = "Zobacz wynik →";
    }
    next.focus({ preventScroll: true });
  }

  function nextQuestion() {
    if (!state.answered) return;

    if (state.currentQuestionIndex >= state.questions.length - 1) {
      showResults();
      return;
    }

    state.currentQuestionIndex += 1;
    state.answered = false;
    state.selectedAnswerIndex = null;
    saveCurrentSession();
    renderQuestion();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showResults() {
    const quiz = QUIZZES[state.quizId];
    if (!quiz || state.questions.length === 0) {
      showHome();
      return;
    }

    const total = state.questions.length;
    const percentage = Math.round((state.correctAnswers / total) * 100);
    saveBestScore(state.quizId, percentage);
    commitSessionProgress();
    clearSavedSession(state.quizId);

    clearApp();
    app.className = "app-shell quiz-shell";
    app.append(renderTopBar(quiz));

    const panel = createElement("section", "quiz-panel results-panel");
    const kicker = createElement("p", "eyebrow", quiz.shortTitle);
    const title = createElement("h1", "results-title", "Test ukończony");
    const score = createElement("div", "score", `${state.correctAnswers} / ${total}`);
    score.setAttribute("aria-label", `${state.correctAnswers} poprawnych odpowiedzi na ${total}`);
    const percentageText = createElement("p", "results-percentage", `Wynik: ${percentage}%`);

    const stats = createElement("div", "results-stats");
    const correctStat = createElement("div", "stat-card");
    correctStat.append(
      createElement("span", "stat-value", String(state.correctAnswers)),
      createElement("span", "stat-label", "Poprawne odpowiedzi")
    );
    const incorrectStat = createElement("div", "stat-card");
    incorrectStat.append(
      createElement("span", "stat-value", String(state.incorrectAnswers)),
      createElement("span", "stat-label", "Błędne odpowiedzi")
    );
    stats.append(correctStat, incorrectStat);

    const learningSummary = createElement("p", "learning-summary");
    if (state.newlyMastered > 0) {
      learningSummary.textContent = `Pytania, które wypadną z puli w kolejnej sesji: ${state.newlyMastered}.`;
    } else {
      learningSummary.textContent = "Pytanie wypada z puli po poprawnej odpowiedzi w dwóch kolejnych sesjach.";
    }

    const actions = createElement("div", "results-actions");
    const restart = createElement("button", "primary-button", "Rozwiąż ponownie");
    restart.type = "button";
    restart.addEventListener("click", restartQuiz);
    const home = createElement("button", "secondary-button", "Wróć do listy ustaw");
    home.type = "button";
    home.addEventListener("click", () => showHome());
    actions.append(restart, home);

    panel.append(kicker, title, score, percentageText, stats, learningSummary, actions);
    app.append(panel);
    restart.focus({ preventScroll: true });
  }

  function restartQuiz() {
    if (!state.quizId || state.sourceQuestions.length === 0) return;
    const availableQuestions = getAvailableQuestions(state.quizId, state.sourceQuestions);
    state.questions = prepareQuizSession(availableQuestions);
    resetSessionCounters();
    if (state.questions.length === 0) {
      showMastered(QUIZZES[state.quizId]);
    } else {
      saveCurrentSession();
      renderQuestion();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleKeyboard(event) {
    if (!state.quizId || state.questions.length === 0) return;

    const target = event.target;
    const isFormControl = target instanceof HTMLButtonElement;

    if (!state.answered) {
      const key = event.key.toLowerCase();
      const keyMap = { a: 0, "1": 0, b: 1, "2": 1, c: 2, "3": 2, d: 3, "4": 3 };
      if (Object.prototype.hasOwnProperty.call(keyMap, key)) {
        event.preventDefault();
        handleAnswer(keyMap[key]);
      }
      return;
    }

    if (event.key === "Enter" && !isFormControl) {
      event.preventDefault();
      nextQuestion();
    }
  }

  function initializeFromURL() {
    const params = new URLSearchParams(window.location.search);
    const quizId = params.get("quiz");
    const view = params.get("view");
    const materialId = params.get("material");
    const materialExists = STUDY_MATERIALS.some(material => material.id === materialId);
    if (view === "nauka" && materialId && materialExists) {
      showStudyMaterial(materialId, { updateHistory: false });
    } else if (view === "nauka") {
      if (materialId) updateURL(null, { replace: true, view: "nauka" });
      showStudyMaterials({ updateHistory: false });
    } else if (quizId && QUIZZES[quizId]) {
      startQuiz(quizId, { updateHistory: false });
    } else {
      if (quizId || view || materialId) updateURL(null, { replace: true });
      showHome({ updateHistory: false });
    }
  }

  window.addEventListener("popstate", initializeFromURL);
  window.addEventListener("pwa-install-availability-changed", updateInstallControl);
  document.addEventListener("keydown", handleKeyboard);
  initializeFromURL();
}());
