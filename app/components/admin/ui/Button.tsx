export default function Button({
  children,
  variant = 'primary',
  ...props
}: any) {
  const styles = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    outline: 'border border-slate-300 text-slate-700 hover:bg-slate-100',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${styles[variant]}`}
    >
      {children}
    </button>
  );
}
