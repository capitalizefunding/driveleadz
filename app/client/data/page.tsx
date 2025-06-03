export default function ClientDataPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh]">
      <h1 className="text-3xl font-bold text-[#05E0E9] mb-4">Data Analytics</h1>
      <p className="text-xl mb-8">Coming Soon!</p>
      <div className="bg-sidebar p-8 rounded-lg shadow max-w-2xl">
        <p className="mb-4">Our data analytics tools are currently in development. Soon you'll be able to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Visualize lead data with interactive charts and graphs</li>
          <li>Generate custom reports on lead quality and conversion rates</li>
          <li>Identify trends and patterns in your lead data</li>
          <li>Compare performance across different lead batches</li>
          <li>Export analytics data for use in other platforms</li>
        </ul>
        <p className="mt-6">
          We're working hard to bring you these powerful analytics tools. Check back soon for updates!
        </p>
      </div>
    </div>
  )
}
