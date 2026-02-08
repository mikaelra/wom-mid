import Link from 'next/link';

export default function RulesPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="w-full max-w-3xl flex flex-col items-center rounded-2xl shadow-xl bg-white/90 p-8 text-gray-900">
        <h1 className="text-2xl font-bold mb-4">Rules</h1>
        <p className="mb-6">Rules content can be ported from tjuvpakk-frontend here.</p>
        <div className="flex flex-col gap-2">
          <Link href="/" className="text-blue-600 underline text-lg">
            ← Back to Home
          </Link>
          <Link href="/rules/p1" className="text-green-600 underline">
            Rules For Nerds (Part 1)
          </Link>
        </div>
      </div>
    </div>
  );
}
