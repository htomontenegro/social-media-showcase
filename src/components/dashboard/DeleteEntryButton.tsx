"use client";

import { useRouter } from "next/navigation";

export function DeleteEntryButton({ entryId }: { entryId: string }) {
  const router = useRouter();

  async function remove() {
    if (!confirm("Delete this entry?")) return;
    const res = await fetch(`/api/entries?id=${encodeURIComponent(entryId)}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      alert("Failed to delete entry. Please try again.");
      return;
    }
    router.push("/dashboard/entries");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={remove}
      className="mt-8 rounded-md border border-red-900 px-4 py-2 text-sm text-red-400 hover:bg-red-950/50"
    >
      Delete entry
    </button>
  );
}
