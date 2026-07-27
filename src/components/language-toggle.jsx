import { useTranslation } from "../i18n/use-translation";

const LanguageToggle = ({ className = "" }) => {
  const { language, languages, setLanguage, t } = useTranslation();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {t("language.label")}
      </span>
      <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
        {Object.keys(languages).map((languageCode) => {
          const isActive = language === languageCode;

          return (
            <button
              key={languageCode}
              type="button"
              className={`h-8 rounded-lg px-3 text-xs font-black transition ${
                isActive
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              onClick={() => setLanguage(languageCode)}
              aria-pressed={isActive}
            >
              {t(`language.${languageCode}`)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LanguageToggle;
