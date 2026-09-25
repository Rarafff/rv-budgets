import iconSprite from "../assets/icon-bears/category-icons.png";

const spriteColumns = 6;

const createIcons = (group, labels, types, spriteStart) => labels.map((label, index) => {
  const spriteIndex = spriteStart + index;
  return {
  id: `${group}-${index}`,
  label,
  types,
  column: spriteIndex % spriteColumns,
  row: Math.floor(spriteIndex / spriteColumns),
};
});

export const categoryIcons = [
  ...createIcons("everyday", ["Makan", "Belanja", "Utilitas", "Rumah", "Transportasi", "Bensin", "Kesehatan", "Pendidikan", "Keluarga", "Hiburan", "Game", "Pakaian", "Donasi", "Tagihan", "Pajak", "Investasi", "Dana darurat", "Tabungan"], ["expense"], 0),
  ...createIcons("money", ["Gaji", "Pendapatan", "Pekerjaan", "Usaha", "Pertumbuhan", "Refund", "Hadiah", "Sewa", "Jual aset", "Simpanan"], ["income"], 18),
  ...createIcons("extra", ["Lainnya", "Langganan digital", "Utang"], ["expense", "income"], 28),
];

export const CategoryIcon = ({ iconID, size = 40, className = "" }) => {
  const icon = categoryIcons.find((item) => item.id === iconID);
  if (!icon) return null;
  return (
    <span
      className={`relative inline-block shrink-0 overflow-hidden ${className}`}
      style={{ width: size, height: size }}
      aria-label={icon.label}
      role="img"
    >
      <img
        src={iconSprite}
        alt=""
        aria-hidden="true"
        className="absolute max-w-none"
        style={{
          width: `${spriteColumns * 100}%`,
          height: `${spriteColumns * 100}%`,
          left: `${-icon.column * size}px`,
          top: `${-icon.row * size}px`,
        }}
      />
    </span>
  );
};
