export default function ActivityList() {
  const activities = [
    { user: 'John', action: 'registered', time: '2 min ago' },
    { user: 'Sarah', action: 'verified profile', time: '10 min ago' },
    { user: 'Michael', action: 'sent a proposal', time: '1 hour ago' },
  ];

  return (
    <div className="bg-white rounded-2xl border p-6 space-y-4">
      <h3 className="font-bold text-lg">Recent Activity</h3>
      {activities.map((a, i) => (
        <div key={i} className="flex justify-between text-sm">
          <span>
            <b>{a.user}</b> {a.action}
          </span>
          <span className="text-slate-500">{a.time}</span>
        </div>
      ))}
    </div>
  );
}
