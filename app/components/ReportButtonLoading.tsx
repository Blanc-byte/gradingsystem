export default function ReportButtonLoading() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="w-4 h-4 border-2 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
      </div>
      <span>Loading...</span>
    </div>
  )
}
