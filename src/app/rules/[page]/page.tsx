'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function RulesNerdsPage() {
  const params = useParams();
  const page = params?.page as string | undefined;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="w-full max-w-3xl flex flex-col items-center rounded-2xl shadow-xl bg-white/90 p-8 text-gray-900">
        <h1 className="text-2xl font-bold mb-4">Rules For Nerds {page ? `(Part ${page})` : ''}</h1>
        <p className="mb-6">Rules-for-nerds content can be ported per page (p1–p8).</p>
        <Link href="/rules" className="text-blue-600 underline text-lg">
          ← Back to Rules
        </Link>
        <Link href="/" className="mt-2 text-blue-600 underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
