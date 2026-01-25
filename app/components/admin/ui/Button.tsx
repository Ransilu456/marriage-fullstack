const styles = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
  outline: 'border border-slate-300 text-slate-700 hover:bg-slate-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

type ButtonVariant = keyof typeof styles;

export default function Button({
  children,
  variant = 'primary',
  ...props
}: {
  children: React.ReactNode;
  variant?: ButtonVariant;
  [key: string]: any;
}) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${styles[variant as ButtonVariant] || styles.primary}`}
    >
      {children}
    </button>
  );
}
