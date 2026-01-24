export default function ReportCard({ report }: any) {
  return (
    <div className="bg-white rounded-2xl border p-5 hover:shadow-lg transition">
      <h4 className="font-bold">{report.title}</h4>
      <p className="text-sm text-slate-600 mt-2">{report.description}</p>
      <p className="text-xs text-slate-400 mt-3">Reported by {report.user}</p>
    </div>
  );
}
