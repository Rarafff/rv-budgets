import { CategoryIcon, getTransactionCategoryIcon } from "./category-icon";

const fallback = (type) => {
  if (type === "income") return { symbol: "+", className: "bg-emerald-100 text-emerald-700" };
  if (type === "transfer") return { symbol: "↔", className: "bg-sky-100 text-sky-700" };
  return { symbol: "−", className: "bg-rose-100 text-rose-700" };
};

const TransactionCategoryIcon = ({ transaction, categories = [], size = 44 }) => {
  const iconID = getTransactionCategoryIcon(transaction, categories);

  if (iconID) return <CategoryIcon iconID={iconID} size={size} />;

  const sign = fallback(transaction?.type);
  return <span className={`inline-flex shrink-0 items-center justify-center rounded-xl text-2xl font-black leading-none ${sign.className}`} style={{ width: size, height: size }} aria-hidden="true">{sign.symbol}</span>;
};

export default TransactionCategoryIcon;
