

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-7xl font-bold text-center w-full flex justify-center mb-[-0.5rem] text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-blue-300 animate-pulse">WhatsLeads</h1>
        <h1 className="text-4xl text-center">First AI-Powered WhatsApp Lead Management System</h1>
        <div className="flex justify-center w-full">
          <a
            href="/auth/signin"
            className="inline-flex items-center justify-center px-10 py-4 text-xl font-medium text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 gap-2 hover:text-white"
          >
            Get Started
          </a>
          
        </div>
        <div className="flex justify-center w-full"><a href="/plans" className="inline-flex items-center justify-center px-1 py-1 text-xl font-medium text-white underline rounded-full transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 gap-2 hover:text-white">View Plans</a></div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <p className="text-sm text-gray-500">© {new Date().getFullYear()} AI-Powered WhatsApp Lead Management System. All rights reserved.</p>
      </footer>
    </div>
  );
}
