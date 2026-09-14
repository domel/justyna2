(function () {
  "use strict";

  const REQUIRED_COLUMNS = [
    "pytanie",
    "odpowiedz 1",
    "odpowiedz 2",
    "odpowiedz 3",
    "odpowiedz 4",
    "poprawna",
    "opis"
  ];

  /**
   * Parse RFC 4180-style CSV text, including quoted commas, escaped quotes,
   * CRLF/LF line endings and embedded newlines inside quoted fields.
   */
  function parseCSV(text) {
    if (typeof text !== "string") {
      throw new TypeError("CSV input must be a string.");
    }

    // Remove a UTF-8 BOM if TextDecoder/fetch preserved it.
    const input = text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;

    for (let i = 0; i < input.length; i += 1) {
      const char = input[i];

      if (inQuotes) {
        if (char === '"') {
          if (input[i + 1] === '"') {
            field += '"';
            i += 1;
          } else {
            inQuotes = false;
          }
        } else {
          field += char;
        }
        continue;
      }

      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        row.push(field);
        field = "";
      } else if (char === "\n" || char === "\r") {
        row.push(field);
        field = "";
        rows.push(row);
        row = [];

        if (char === "\r" && input[i + 1] === "\n") {
          i += 1;
        }
      } else {
        field += char;
      }
    }

    if (inQuotes) {
      throw new Error("Nieprawidłowy CSV: niezamknięte pole w cudzysłowie.");
    }

    // Flush the last row. Avoid creating an extra empty row for a trailing EOL.
    if (field.length > 0 || row.length > 0) {
      row.push(field);
      rows.push(row);
    }

    // Ignore fully empty physical rows, but retain empty fields inside real records.
    const meaningfulRows = rows.filter(fields => fields.some(value => value !== ""));

    if (meaningfulRows.length === 0) {
      return { headers: [], rows: [] };
    }

    const headers = meaningfulRows[0].map(header => header.trim());
    const dataRows = meaningfulRows.slice(1).map((fields, index) => {
      const record = {};
      headers.forEach((header, columnIndex) => {
        record[header] = fields[columnIndex] ?? "";
      });
      record.__rowNumber = index + 2;
      record.__fieldCount = fields.length;
      return record;
    });

    return { headers, rows: dataRows };
  }

  function validateHeaders(headers) {
    const missing = REQUIRED_COLUMNS.filter(column => !headers.includes(column));
    if (missing.length > 0) {
      throw new Error(`Brak wymaganych kolumn CSV: ${missing.join(", ")}`);
    }
  }

  function normalizeQuestion(row) {
    const rowNumber = row.__rowNumber ?? "?";
    const question = String(row["pytanie"] ?? "").trim();
    const answerTexts = [1, 2, 3, 4].map(number => String(row[`odpowiedz ${number}`] ?? "").trim());
    const correctNumber = Number(String(row["poprawna"] ?? "").trim());
    const explanationExists = Object.prototype.hasOwnProperty.call(row, "opis");
    const explanation = explanationExists ? String(row["opis"] ?? "").trim() : "";

    if (!question) {
      throw new Error(`Wiersz ${rowNumber}: brak treści pytania.`);
    }
    if (answerTexts.some(answer => !answer)) {
      throw new Error(`Wiersz ${rowNumber}: pytanie nie zawiera czterech odpowiedzi.`);
    }
    if (![1, 2, 3, 4].includes(correctNumber)) {
      throw new Error(`Wiersz ${rowNumber}: wartość „poprawna” musi należeć do 1–4.`);
    }
    if (!explanationExists) {
      throw new Error(`Wiersz ${rowNumber}: brak pola „opis”.`);
    }

    return {
      question,
      answers: answerTexts.map((text, index) => ({
        text,
        isCorrect: index + 1 === correctNumber
      })),
      explanation
    };
  }

  function parseQuestionsCSV(text) {
    const parsed = parseCSV(text);
    validateHeaders(parsed.headers);

    const questions = [];
    const warnings = [];

    parsed.rows.forEach(row => {
      try {
        questions.push(normalizeQuestion(row));
      } catch (error) {
        warnings.push(error.message);
      }
    });

    if (questions.length === 0) {
      throw new Error("Plik CSV nie zawiera żadnych prawidłowych pytań.");
    }

    return { questions, warnings };
  }

  window.CSVUtils = Object.freeze({
    REQUIRED_COLUMNS,
    parseCSV,
    validateHeaders,
    normalizeQuestion,
    parseQuestionsCSV
  });
}());
