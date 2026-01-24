export default function Pagination({ page, total, onChange }: any) {
  const pages = Math.ceil(total / 10);

  return (
    <div className="flex justify-end gap-2 mt-4">
      {Array.from({ length: pages }).map((_, i) => (
        <button
          key={i}
          onClick={() => onChange(i + 1)}
          className={`px-3 py-1 rounded-lg text-sm ${
            page === i + 1
              ? 'bg-indigo-600 text-white'
              : 'border hover:bg-slate-100'
          }`}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}
