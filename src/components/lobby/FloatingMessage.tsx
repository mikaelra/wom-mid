'use client';

import { useEffect, useState, useRef } from 'react';

export default function FloatingMessage({
  message,
  onDone,
}: {
  message: string;
  onDone: () => void;
}) {
  const [visible, setVisible] = useState(true);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDoneRef.current(), 800);
    }, 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none transition-all duration-700 ${
        visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
      }`}
    >
      <div className="bg-white text-gray-700 px-6 py-6 rounded-2xl shadow-2xl max-w-3xl w-full mx-4 text-center font-sans space-y-6 border-2 border-gray-300">
        <h3 className="font-semibold text-2xl text-gray-800">Round Messages</h3>
        <div className="text-lg sm:text-xl whitespace-pre-line">{message}</div>
      </div>
    </div>
  );
}
