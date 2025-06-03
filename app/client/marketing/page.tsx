export default function ClientMarketingPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh]">
      <h1 className="text-3xl font-bold text-[#05E0E9] mb-4">Marketing</h1>
      <p className="text-xl mb-8">Coming Soon!</p>
      <div className="bg-sidebar p-8 rounded-lg shadow max-w-2xl">
        <p className="mb-4">Our marketing tools are currently in development. Soon you'll be able to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Create targeted marketing campaigns based on your lead data</li>
          <li>Track campaign performance with detailed analytics</li>
          <li>Generate custom marketing materials</li>
          <li>Integrate with popular email marketing platforms</li>
          <li>Schedule automated follow-ups with potential clients</li>
        </ul>
        <p className="mt-6">We're working hard to bring you these features. Check back soon for updates!</p>
      </div>
    </div>
  )
}
