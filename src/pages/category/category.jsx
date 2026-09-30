import { useEffect, useState } from "react";
import { createCategory, deleteCategory, getCategories } from "../../api/category";
import { useTranslation } from "../../i18n/use-translation";
import { CategoryIcon, categoryIcons } from "../../components/category-icon";
import { confirmDelete } from "../../lib/alerts";

const SubcategoryList = ({ category, items, onAdd, onDelete, savingParentID, deletingID, t }) => {
  const [name, setName] = useState("");
  const submit = async (event) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    await onAdd(category, trimmedName);
    setName("");
  };

  return <div className="mt-3 border-t border-[#f1dfc2] pt-3">
    <p className="text-xs font-black uppercase tracking-wide text-[#8d6a4c]">{t("category.subcategories")}</p>
    {items.length > 0 && <div className="mt-2 flex flex-wrap gap-2">
      {items.map((item) => <span key={item.id} className="inline-flex items-center gap-1 rounded-lg bg-[#fff3d5] px-2 py-1 text-xs font-bold text-[#70441f]">
        {item.name}
        <button type="button" onClick={() => onDelete(item)} disabled={deletingID === item.id} className="grid size-5 place-items-center rounded text-rose-600 hover:bg-rose-100" aria-label={`${t("category.delete")} ${item.name}`}>×</button>
      </span>)}
    </div>}
    <form onSubmit={submit} className="mt-3 flex gap-2">
      <input value={name} onChange={(event) => setName(event.target.value)} placeholder={t("category.subcategoryPlaceholder")} maxLength={60} className="h-11 min-w-0 flex-1 rounded-xl border border-[#f1dfc2] bg-white px-3 text-sm text-[#4d2f1a] outline-none focus:border-[#aa7941]" />
      <button type="submit" disabled={savingParentID === category.id} className="h-11 shrink-0 rounded-xl border border-[#d5aa70] bg-[#fffaf0] px-3 text-xs font-black text-[#70441f] hover:bg-[#fff3d5] disabled:opacity-60">{savingParentID === category.id ? t("category.adding") : t("category.addSubcategory")}</button>
    </form>
  </div>;
};

const CategoryGroup = ({ type, categories, onDelete, onAddSubcategory, savingParentID, deletingID, t }) => {
  const isExpense = type === "expense";
  const items = categories.filter((category) => category.type === type && !category.parentId);

  return (
    <section className="rounded-2xl border border-[#f1dfc2] bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className={`grid size-10 place-items-center rounded-xl text-xl font-black ${isExpense ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`} aria-hidden="true">
          {isExpense ? "−" : "+"}
        </span>
        <div>
          <h2 className="font-black text-[#4d2f1a]">{isExpense ? t("category.expense") : t("category.income")}</h2>
          <p className="text-xs font-medium text-[#8d6a4c]">{isExpense ? t("category.expenseHint") : t("category.incomeHint")}</p>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {items.length === 0 ? (
          <p className="rounded-xl bg-[#fffaf0] px-4 py-3 text-sm font-semibold text-[#8d6a4c]">{t("category.empty")}</p>
        ) : (
          items.map((category) => (
            <div key={category.id} className="rounded-xl bg-[#fffaf0] px-4 py-3">
              <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                {category.icon ? <CategoryIcon iconID={category.icon} size={34} /> : <span className={`grid size-8 place-items-center rounded-lg text-base font-black ${isExpense ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>{isExpense ? "−" : "+"}</span>}
                <span className="min-w-0 truncate text-sm font-bold text-[#4d2f1a]">{category.name}</span>
              </div>
              <button
                type="button"
                onClick={() => onDelete(category)}
                disabled={deletingID === category.id}
                className="shrink-0 rounded-lg px-2 py-1 text-xs font-black text-rose-600 hover:bg-rose-50 disabled:opacity-50"
              >
                {deletingID === category.id ? t("category.deleting") : t("category.delete")}
              </button>
              </div>
              <SubcategoryList category={category} items={categories.filter((item) => item.parentId === category.id)} onAdd={onAddSubcategory} onDelete={onDelete} savingParentID={savingParentID} deletingID={deletingID} t={t} />
            </div>
          ))
        )}
      </div>
    </section>
  );
};

const Category = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("expense");
  const [icon, setIcon] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingID, setDeletingID] = useState("");
  const [savingParentID, setSavingParentID] = useState("");
  const [error, setError] = useState("");
  const availableIcons = categoryIcons.filter((item) => item.types.includes(type));

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data || []);
    } catch (requestError) {
      setError(requestError.response?.data?.error || t("category.loadError"));
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    setIsSaving(true);
    setError("");
    try {
      await createCategory({ name: trimmedName, type, icon });
      setName("");
      setIcon("");
      await loadCategories();
      window.dispatchEvent(new Event("budgets:categories-changed"));
    } catch (requestError) {
      setError(requestError.response?.data?.error || t("category.saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (category) => {
    if (!await confirmDelete(category.name)) return;

    setDeletingID(category.id);
    setError("");
    try {
      await deleteCategory(category.id);
      await loadCategories();
      window.dispatchEvent(new Event("budgets:categories-changed"));
    } catch (requestError) {
      setError(requestError.response?.data?.error || t("category.deleteError"));
    } finally {
      setDeletingID("");
    }
  };

  const handleAddSubcategory = async (parent, subcategoryName) => {
    setSavingParentID(parent.id);
    setError("");
    try {
      await createCategory({ name: subcategoryName, type: parent.type, parentId: parent.id });
      await loadCategories();
      window.dispatchEvent(new Event("budgets:categories-changed"));
    } catch (requestError) {
      setError(requestError.response?.data?.error || t("category.saveError"));
    } finally {
      setSavingParentID("");
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 md:px-8 xl:px-10">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-black tracking-tight text-[#4d2f1a]">{t("category.title")}</h1>
        <p className="mt-2 text-sm font-medium text-[#8d6a4c]">{t("category.subtitle")}</p>
      </header>

      <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-[#f1dfc2] bg-[#fffdf7] p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_11rem_auto]">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t("category.namePlaceholder")}
            className="h-12 rounded-xl border border-[#f1dfc2] bg-white px-4 text-sm text-[#4d2f1a] outline-none focus:border-[#aa7941]"
            maxLength={80}
            required
          />
          <select value={type} onChange={(event) => { setType(event.target.value); setIcon(""); }} className="h-12 rounded-xl border border-[#f1dfc2] bg-white px-3 text-sm font-bold text-[#70441f] outline-none focus:border-[#aa7941]">
            <option value="expense">{t("category.expense")}</option>
            <option value="income">{t("category.income")}</option>
          </select>
          <button type="submit" disabled={isSaving} className="h-12 rounded-xl bg-[#8b5a2b] px-5 text-sm font-black text-white hover:bg-[#70441f] disabled:opacity-60">
            {isSaving ? t("category.adding") : t("category.add")}
          </button>
        </div>
        <div className="mt-4">
          <p className="text-xs font-black uppercase tracking-wide text-[#8d6a4c]">{t("category.iconOptional")}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" onClick={() => setIcon("")} className={`grid size-11 place-items-center rounded-xl border text-xs font-black ${icon === "" ? "border-[#aa7941] bg-[#fff3d5] text-[#70441f]" : "border-[#f1dfc2] bg-white text-[#8d6a4c]"}`} aria-label={t("category.noIcon")}>—</button>
            {availableIcons.map((item) => (
              <button key={item.id} type="button" onClick={() => setIcon(item.id)} className={`grid size-11 place-items-center rounded-xl border transition ${icon === item.id ? "border-[#aa7941] bg-[#fff3d5] ring-2 ring-[#f4dfbb]" : "border-[#f1dfc2] bg-white hover:bg-[#fffaf0]"}`} aria-label={item.label} title={item.label}>
                <CategoryIcon iconID={item.id} size={36} />
              </button>
            ))}
          </div>
        </div>
        {error && <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p>}
      </form>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <CategoryGroup type="expense" categories={categories} onDelete={handleDelete} onAddSubcategory={handleAddSubcategory} savingParentID={savingParentID} deletingID={deletingID} t={t} />
        <CategoryGroup type="income" categories={categories} onDelete={handleDelete} onAddSubcategory={handleAddSubcategory} savingParentID={savingParentID} deletingID={deletingID} t={t} />
      </div>
    </div>
  );
};

export default Category;
