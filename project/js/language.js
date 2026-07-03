/**
 * language.js - single-source i18n loader
 *
 * All translations live in /locales/{lang}.json.
 * This file only loads JSON, applies data-lang attributes, and controls the dropdown.
 */

const SUPPORTED = [
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "my", label: "မြန်မာ", flag: "🇲🇲" },
  { code: "ne", label: "नेपाली", flag: "🇳🇵" },
  { code: "si", label: "සිංහල", flag: "🇱🇰" },
];

const DEFAULT_LANG = "en";
const translationCache = {};
let currentLang = localStorage.getItem("language") || DEFAULT_LANG;
let translations = {};
let defaultTranslations = {};
let isApplyingTranslations = false;
let observerStarted = false;

window.currentTranslations = translations;
window.t = (key, fallback = "") => translations[key] ?? defaultTranslations[key] ?? fallback;
window.loadLanguage = loadLanguage;

function normalizeLang(lang) {
  return SUPPORTED.some(item => item.code === lang) ? lang : DEFAULT_LANG;
}

async function fetchLocale(lang) {
  if (translationCache[lang]) return translationCache[lang];

  const response = await fetch(`locales/${lang}.json`, { cache: "no-cache" });
  if (!response.ok) throw new Error(`Could not load locale: ${lang}`);

  const data = await response.json();
  translationCache[lang] = data;
  return data;
}

async function loadLanguage(lang) {
  lang = normalizeLang(lang);
  currentLang = lang;
  localStorage.setItem("language", lang);

  try {
    defaultTranslations = await fetchLocale(DEFAULT_LANG);
    translations = lang === DEFAULT_LANG ? defaultTranslations : await fetchLocale(lang);
  } catch (error) {
    console.warn("Translation loading failed. Use Live Server instead of opening the HTML file directly.", error);
    translations = defaultTranslations || {};
  }

  window.currentTranslations = translations;
  document.documentElement.lang = lang;
  applyTranslations();
  updateDropdown(lang);
  validateTranslationCoverage(lang);
  document.dispatchEvent(new CustomEvent("languageChanged", { detail: { lang, translations } }));
}

function getTranslation(key) {
  return translations[key] ?? defaultTranslations[key];
}

function setText(el, value) {
  if (value === undefined) return;
  if (el.tagName === "TITLE") {
    if (document.title !== value) document.title = value;
  } else if (el.textContent !== value) {
    el.textContent = value;
  }
}

function setAttribute(el, attr, value) {
  if (value !== undefined && el.getAttribute(attr) !== value) {
    el.setAttribute(attr, value);
  }
}

function applyTranslations() {
  isApplyingTranslations = true;

  document.querySelectorAll("[data-lang]").forEach(el => {
    setText(el, getTranslation(el.dataset.lang));
  });

  document.querySelectorAll("[data-lang-placeholder]").forEach(el => {
    setAttribute(el, "placeholder", getTranslation(el.dataset.langPlaceholder));
  });

  document.querySelectorAll("[data-lang-title]").forEach(el => {
    setAttribute(el, "title", getTranslation(el.dataset.langTitle));
  });

  document.querySelectorAll("[data-lang-aria]").forEach(el => {
    setAttribute(el, "aria-label", getTranslation(el.dataset.langAria));
  });

  setTimeout(() => { isApplyingTranslations = false; }, 0);
}

function collectRequiredKeys() {
  const required = new Set();
  document.querySelectorAll("[data-lang]").forEach(el => required.add(el.dataset.lang));
  document.querySelectorAll("[data-lang-placeholder]").forEach(el => required.add(el.dataset.langPlaceholder));
  document.querySelectorAll("[data-lang-title]").forEach(el => required.add(el.dataset.langTitle));
  document.querySelectorAll("[data-lang-aria]").forEach(el => required.add(el.dataset.langAria));
  return required;
}

function validateTranslationCoverage(lang) {
  const missing = [...collectRequiredKeys()].filter(key => getTranslation(key) === undefined);
  if (missing.length) console.warn(`Missing ${lang} translation keys:`, missing);
}

function buildDropdowns() {
  document.querySelectorAll(".language-switch").forEach(container => {
    container.innerHTML = "";

    const toggle = document.createElement("button");
    toggle.className = "lang-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-haspopup", "true");
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="10" cy="10" r="8"></circle>
        <path d="M2 10h16M10 2c-2.5 3-4 5-4 8s1.5 5 4 8M10 2c2.5 3 4 5 4 8s-1.5 5-4 8"></path>
      </svg>
      <span class="lang-current">EN</span>
      <i class="lang-chevron">▾</i>`;
    container.appendChild(toggle);

    const dropdown = document.createElement("div");
    dropdown.className = "lang-dropdown";
    dropdown.setAttribute("role", "menu");

    SUPPORTED.forEach(({ code, label, flag }) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "lang-option";
      button.dataset.setLang = code;
      button.setAttribute("role", "menuitem");
      button.innerHTML = `<span class="lang-flag">${flag}</span><span>${label}</span>`;
      button.addEventListener("click", () => {
        loadLanguage(code);
        closeDropdown(container);
      });
      dropdown.appendChild(button);
    });

    container.appendChild(dropdown);

    toggle.addEventListener("click", event => {
      event.stopPropagation();
      const isOpen = container.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  });

  document.addEventListener("click", () => {
    document.querySelectorAll(".language-switch.open").forEach(closeDropdown);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      document.querySelectorAll(".language-switch.open").forEach(closeDropdown);
    }
  });
}

function closeDropdown(container) {
  container.classList.remove("open");
  const toggle = container.querySelector(".lang-toggle");
  if (toggle) toggle.setAttribute("aria-expanded", "false");
}

function updateDropdown(lang) {
  const meta = SUPPORTED.find(item => item.code === lang) || SUPPORTED.find(item => item.code === DEFAULT_LANG);
  document.querySelectorAll(".lang-current").forEach(el => { el.textContent = meta.code.toUpperCase(); });
  document.querySelectorAll(".lang-option").forEach(button => {
    button.classList.toggle("active", button.dataset.setLang === lang);
  });
}

function startTranslationObserver() {
  if (observerStarted || !document.body) return;
  observerStarted = true;

  let frame = null;
  const observer = new MutationObserver(() => {
    if (isApplyingTranslations || !Object.keys(translations).length) return;
    if (frame !== null) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      frame = null;
      if (!isApplyingTranslations) applyTranslations();
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

document.addEventListener("DOMContentLoaded", () => {
  buildDropdowns();
  loadLanguage(currentLang);
  startTranslationObserver();
});
