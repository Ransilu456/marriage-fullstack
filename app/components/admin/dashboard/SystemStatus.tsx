export default function SystemStatus() {
  const systems = [
    { name: 'API Server', status: 'ONLINE' },
    { name: 'Database', status: 'ONLINE' },
    { name: 'Auth Service', status: 'DEGRADED' },
  ];

  return (
    <div className="bg-white rounded-2xl border p-6 space-y-3">
      <h3 className="font-bold text-lg">System Status</h3>
      {systems.map((s, i) => (
        <div key={i} className="flex justify-between text-sm">
          <span>{s.name}</span>
          <span
            className={`font-bold ${
              s.status === 'ONLINE'
                ? 'text-emerald-600'
                : 'text-amber-600'
            }`}
          >
            {s.status}
          </span>
        </div>
      ))}
    </div>
  );
}
