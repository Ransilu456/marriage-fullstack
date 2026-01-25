export default function Loading() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-200 border-t-rose-600"></div>
                <p className="text-sm font-medium text-slate-500">Loading admin panel...</p>
            </div>
        </div>
    );
}
