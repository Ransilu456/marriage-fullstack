import { motion } from 'framer-motion';

export default function GlassCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-sm hover:shadow-xl transition-all ${className}`}
    >
      {children}
    </motion.div>
  );
}
