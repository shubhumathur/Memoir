import React from 'react';

export default function HeroPreview() {
  return (
    <div
      className="w-full max-w-md rounded-2xl shadow-xl bg-white border border-neutral-200 p-5"
      aria-label="Preview of journAI interface"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 w-28 rounded bg-neutral-200" />
        <div className="h-6 w-10 rounded bg-neutral-200" />
      </div>

      <div className="space-y-3">
        <div className="h-24 rounded-xl bg-neutral-100 p-4">
          <div className="h-4 w-3/5 bg-neutral-300 rounded mb-2" />
          <div className="h-3 w-4/5 bg-neutral-200 rounded mb-1" />
          <div className="h-3 w-2/3 bg-neutral-200 rounded" />
        </div>

        <div className="h-40 rounded-xl bg-neutral-100 p-4">
          <div className="h-4 w-2/5 bg-neutral-300 rounded mb-3" />
          <div className="flex items-end gap-2 h-24">
            <div className="w-5 bg-primary/40 rounded" style={{height: '30%'}} />
            <div className="w-5 bg-primary/60 rounded" style={{height: '65%'}} />
            <div className="w-5 bg-accent/60 rounded" style={{height: '45%'}} />
            <div className="w-5 bg-primary/30 rounded" style={{height: '25%'}} />
            <div className="w-5 bg-accent/40 rounded" style={{height: '55%'}} />
          </div>
        </div>
      </div>
    </div>
  );
}
