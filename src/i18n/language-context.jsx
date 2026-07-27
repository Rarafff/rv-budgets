import { useEffect, useMemo, useState } from "react";
import { LanguageContext } from "./language-store";
import { DEFAULT_LANGUAGE, LANGUAGES, translations } from "./translations";
import { domTranslations } from "./dom-translations";

const STORAGE_KEY = "budgets-language";

const getInitialLanguage = () => {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;

  const savedLanguage = window.localStorage.getItem(STORAGE_KEY);
  if (savedLanguage && LANGUAGES[savedLanguage]) return savedLanguage;

  const browserLanguage = window.navigator.language?.toLowerCase();
  return browserLanguage?.startsWith("en") ? "en" : DEFAULT_LANGUAGE;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(getInitialLanguage);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    let isTranslating = false;

    const resolveTranslation = (value) => {
      const trimmedValue = value.trim();
      if (!trimmedValue) return value;

      const entry = Object.values(domTranslations).find(
        (translation) =>
          translation.id === trimmedValue || translation.en === trimmedValue,
      );

      return entry?.[language] || value;
    };

    const translateAttributes = (root) => {
      root
        .querySelectorAll?.("[placeholder], [aria-label], [title]")
        .forEach((element) => {
          ["placeholder", "aria-label", "title"].forEach((attribute) => {
            const currentValue = element.getAttribute(attribute);
            if (!currentValue) return;

            const nextValue = resolveTranslation(currentValue);
            if (nextValue !== currentValue) {
              element.setAttribute(attribute, nextValue);
            }
          });
        });
    };

    const translateTextNodes = (root) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const nodes = [];

      while (walker.nextNode()) {
        nodes.push(walker.currentNode);
      }

      nodes.forEach((node) => {
        const currentValue = node.nodeValue;
        const nextValue = resolveTranslation(currentValue);
        if (nextValue === currentValue || nextValue === currentValue.trim()) return;
        node.nodeValue = currentValue.replace(currentValue.trim(), nextValue);
      });
    };

    const translateDocument = () => {
      if (isTranslating) return;
      isTranslating = true;
      translateTextNodes(document.body);
      translateAttributes(document.body);
      isTranslating = false;
    };

    translateDocument();

    const observer = new MutationObserver(() => {
      translateDocument();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["placeholder", "aria-label", "title"],
    });

    return () => observer.disconnect();
  }, [language]);

  const value = useMemo(() => {
    const setLanguage = (nextLanguage) => {
      if (LANGUAGES[nextLanguage]) {
        setLanguageState(nextLanguage);
      }
    };

    const t = (key, values = {}) => {
      const template = translations[language]?.[key] ?? translations.en[key] ?? key;

      return Object.entries(values).reduce(
        (result, [name, value]) => result.replaceAll(`{{${name}}}`, value),
        template,
      );
    };

    return {
      language,
      languages: LANGUAGES,
      setLanguage,
      t,
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
