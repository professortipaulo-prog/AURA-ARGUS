export function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 py-3 text-sm last:border-b-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-200">{value}</span>
    </div>
  );
}
