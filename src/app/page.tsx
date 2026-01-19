import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Foop</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-8">B2B Automation SaaS</p>
      <Link
        href="/dashboard/webhooks"
        className="px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
