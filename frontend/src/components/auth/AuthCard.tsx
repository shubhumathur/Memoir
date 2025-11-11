import React from 'react';

interface AuthCardProps {
  title: string;
  children: React.ReactNode;
}

export default function AuthCard({ title, children }: AuthCardProps) {
  return (
    <div className="max-w-md w-full mx-auto bg-white border border-neutral-200 rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-neutral-900 mb-4">{title}</h2>
      <div className="space-y-4">
        {/* Social placeholder */}
        <button
          type="button"
          className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 hover:bg-neutral-50"
          aria-label="Continue with Google"
        >
          <span className="inline-flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-neutral-300" aria-hidden />
            Continue with Google
          </span>
        </button>
        <div className="relative text-center text-sm text-neutral-500">
          <span className="px-3 bg-white relative z-10">or</span>
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-neutral-200" />
        </div>
        {children}
      </div>
    </div>
  );
}
