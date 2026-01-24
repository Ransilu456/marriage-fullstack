export default function ReportStats() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-red-50 border rounded-xl p-4">
        <p className="text-xs text-red-600 font-bold">Total Reports</p>
        <p className="text-2xl font-bold">124</p>
      </div>
      <div className="bg-amber-50 border rounded-xl p-4">
        <p className="text-xs text-amber-600 font-bold">Pending</p>
        <p className="text-2xl font-bold">32</p>
      </div>
      <div className="bg-emerald-50 border rounded-xl p-4">
        <p className="text-xs text-emerald-600 font-bold">Resolved</p>
        <p className="text-2xl font-bold">92</p>
      </div>
    </div>
  );
}
