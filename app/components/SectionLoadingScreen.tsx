export default function SectionLoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          {/* Outer circle */}
          <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
          {/* Inner circle */}
          <div className="absolute top-2 left-2 w-16 h-16 border-4 border-blue-100 rounded-full animate-spin border-t-blue-400" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
        </div>
        <p className="mt-6 text-lg text-gray-600">Loading...</p>
        <p className="mt-2 text-sm text-gray-500">Please wait while we fetch your data</p>
      </div>
    </div>
  )
}
