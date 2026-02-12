import UploadForm from "@/components/UploadForm";
import ExpenseList from "@/components/ExpenseList";
import ExportButton from "@/components/ExportButton";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <header className="text-center mb-12 animate-fade-in">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          ExpenseLens
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          AI-Powered Expense Tracking & Business Automation
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300">
            🤖 AI Auto-Categorization
          </div>
          <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900 rounded-full text-sm font-medium text-purple-700 dark:text-purple-300">
            📊 Smart Reports
          </div>
          <div className="px-4 py-2 bg-green-100 dark:bg-green-900 rounded-full text-sm font-medium text-green-700 dark:text-green-300">
            ⚡ Instant OCR
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            <UploadForm />
            <ExportButton />
          </div>
        </div>

        {/* Expense List Section */}
        <div className="lg:col-span-2">
          <ExpenseList />
        </div>
      </div>
    </main>
  );
}

