import { useEffect, useMemo, useState } from "react";
import { getCategories } from "../api/category";

const SubcategoryPicker = ({ category, type, value, onChange, className = "", placeholder = "Select subcategory..." }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getCategories();
        setCategories(response.data || []);
      } catch {
        setCategories([]);
      }
    };
    load();
    window.addEventListener("budgets:categories-changed", load);
    return () => window.removeEventListener("budgets:categories-changed", load);
  }, []);

  const subcategories = useMemo(() => {
    const parent = categories.find((item) => !item.parentId && item.type === type && item.name === category);
    return parent ? categories.filter((item) => item.parentId === parent.id) : [];
  }, [categories, category, type]);

  if (!category || subcategories.length === 0) return null;

  return <select className={className} value={value} onChange={onChange}>
    <option value="">{placeholder}</option>
    {subcategories.map((subcategory) => <option key={subcategory.id} value={subcategory.name}>{subcategory.name}</option>)}
  </select>;
};

export default SubcategoryPicker;
