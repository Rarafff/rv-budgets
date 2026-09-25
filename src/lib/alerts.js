import Swal from "sweetalert2";

const isEnglish = () => document.documentElement.lang === "en";

export const confirmDelete = async (name) => {
  const english = isEnglish();
  const result = await Swal.fire({
    title: english ? "Delete this item?" : "Hapus item ini?",
    text: english ? `“${name}” will be permanently deleted.` : `“${name}” akan dihapus secara permanen.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: english ? "Delete" : "Hapus",
    cancelButtonText: english ? "Cancel" : "Batal",
    confirmButtonColor: "#a94b4b",
    cancelButtonColor: "#8b5a2b",
    reverseButtons: true,
  });

  return result.isConfirmed;
};
