import Link from 'next/link';

export default function LeaderboardsPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="w-full max-w-4xl flex flex-col items-center rounded-2xl shadow-xl bg-white/90 p-8 text-gray-900 text-center">
        <h1 className="text-3xl font-bold mb-6">Leaderboards</h1>
        <p className="mb-6">Leaderboard data and sections can be ported here.</p>
        <Link href="/" className="text-blue-600 underline text-xl">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
