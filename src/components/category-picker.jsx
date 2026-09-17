import { useEffect, useMemo, useState } from "react";
import { createCategory, deleteCategory, getCategories } from "../api/category";

const CategoryPicker = ({ value, onChange, type = "expense", required = false, className = "", placeholder = "Select category..." }) => {
  const [categories, setCategories] = useState([]);
  const [isManaging, setIsManaging] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newType, setNewType] = useState(type);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data || []);
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Kategori belum dapat dimuat.");
    }
  };

  useEffect(() => {
    loadCategories();
    const refresh = () => loadCategories();
    window.addEventListener("budgets:categories-changed", refresh);
    return () => window.removeEventListener("budgets:categories-changed", refresh);
  }, []);

  const visibleCategories = useMemo(() => {
    const filtered = categories.filter((category) => category.type === type);
    if (value && !filtered.some((category) => category.name === value)) {
      return [{ id: `current-${value}`, name: value, type }, ...filtered];
    }
    return filtered;
  }, [categories, type, value]);

  const handleAdd = async () => {
    const name = newCategory.trim();
    if (!name) return;
    setIsSaving(true);
    setError("");
    try {
      await createCategory({ name, type: newType });
      setNewCategory("");
      await loadCategories();
      window.dispatchEvent(new Event("budgets:categories-changed"));
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Kategori tidak dapat ditambahkan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Hapus kategori ${category.name}?`)) return;
    setError("");
    try {
      await deleteCategory(category.id);
      await loadCategories();
      window.dispatchEvent(new Event("budgets:categories-changed"));
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Kategori tidak dapat dihapus.");
    }
  };

  return (
    <>
      <select className={className} value={value} onChange={onChange} required={required}>
        <option value="">{placeholder}</option>
        {visibleCategories.map((category) => (
          <option key={category.id} value={category.name}>{category.name}</option>
        ))}
      </select>
      <button type="button" onClick={() => { setNewType(type); setIsManaging(true); }} className="mt-2 text-xs font-bold text-[#805323] hover:text-[#5b3319]">
        + Kelola kategori
      </button>

      {isManaging && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4" role="dialog" aria-modal="true" onMouseDown={() => setIsManaging(false)}>
          <div className="max-h-[calc(100svh-3rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-xl" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-[#4d2f1a]">Kelola kategori</h2>
                <p className="mt-1 text-sm font-medium text-[#8d6a4c]">Kategori disimpan ke akun dan tersedia di semua perangkat.</p>
              </div>
              <button type="button" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" onClick={() => setIsManaging(false)} aria-label="Tutup pengelola kategori">×</button>
            </div>

            <div className="mt-5 flex gap-2">
              <input className="h-11 min-w-0 flex-1 rounded-xl border border-[#f1dfc2] bg-[#fffaf0] px-3 text-sm outline-none focus:border-[#aa7941]" value={newCategory} onChange={(event) => setNewCategory(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); handleAdd(); } }} placeholder="Nama kategori" />
              <select className="h-11 rounded-xl border border-[#f1dfc2] bg-[#fffaf0] px-2 text-sm font-bold text-[#70441f]" value={newType} onChange={(event) => setNewType(event.target.value)}>
                <option value="expense">Pengeluaran</option>
                <option value="income">Pemasukan</option>
              </select>
              <button type="button" disabled={isSaving} onClick={handleAdd} className="h-11 rounded-xl bg-[#865629] px-3 text-sm font-black text-white hover:bg-[#6d421e] disabled:opacity-60">Tambah</button>
            </div>
            {error && <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600">{error}</p>}

            {["expense", "income"].map((categoryType) => (
              <div key={categoryType} className="mt-5">
                <p className="text-xs font-black uppercase tracking-wide text-[#9a6428]">{categoryType === "expense" ? "Pengeluaran" : "Pemasukan"}</p>
                <div className="mt-2 space-y-2">
                  {categories.filter((category) => category.type === categoryType).length === 0 ? (
                    <p className="rounded-xl bg-[#fffaf0] p-3 text-sm font-semibold text-[#8d6a4c]">Belum ada kategori.</p>
                  ) : categories.filter((category) => category.type === categoryType).map((category) => (
                    <div key={category.id} className="flex items-center justify-between rounded-xl bg-[#fffaf0] px-3 py-2.5">
                      <span className="text-sm font-bold text-[#4d2f1a]">{category.name}</span>
                      <button type="button" onClick={() => handleDelete(category)} className="rounded-lg px-2 py-1 text-xs font-black text-rose-600 hover:bg-rose-50">Hapus</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default CategoryPicker;
