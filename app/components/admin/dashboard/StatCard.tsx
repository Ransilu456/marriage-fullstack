
import GlassCard from '../ui/GlassCard';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
}

export default function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  return (
    <GlassCard className="p-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
          <p className="text-4xl font-serif font-bold text-slate-900">{value}</p>
        </div>
        <div className={`p-3 rounded-2xl bg-${color}-50 text-${color}-600`}>
          <Icon size={24} />
        </div>
      </div>
    </GlassCard>
  );
}
