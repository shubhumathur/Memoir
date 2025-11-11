import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroPreview from '../components/layout/HeroPreview';
import OnboardingModal from '../components/Onboarding/OnboardingModal';

export default function Home() {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);

  const openOnboarding = () => setShowOnboarding(true);
  const openLogin = () => navigate('/login');

  return (
    <div className="min-h-screen bg-hero-soft flex items-center">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-10">
        <div className="flex flex-col justify-center gap-6">
          <h1 className="text-4xl md:text-5xl font-semibold text-neutral-900">
            journAI — journaling that understands you
          </h1>
          <p className="text-lg max-w-xl text-neutral-700">
            Write daily, get AI reflections, and small habit nudges tailored to you.
          </p>
          <ul className="space-y-2 text-neutral-700" aria-label="Key benefits">
            <li className="flex items-start gap-3"><span className="text-primary" aria-hidden>✓</span> Daily journaling with mood tracking</li>
            <li className="flex items-start gap-3"><span className="text-primary" aria-hidden>✓</span> AI-powered reflections and insights</li>
            <li className="flex items-start gap-3"><span className="text-primary" aria-hidden>✓</span> Personal habit suggestions from a quick survey</li>
          </ul>
          <div className="flex gap-3 mt-2">
            <button
              className="px-6 py-3 rounded-2xl bg-primary text-white hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              onClick={openOnboarding}
              aria-label="Get started with journAI"
            >
              Get Started
            </button>
            <button
              className="px-6 py-3 rounded-2xl border-2 border-primary text-primary hover:bg-primary/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              onClick={openLogin}
              aria-label="Log in to journAI"
            >
              Log in
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <HeroPreview />
        </div>
      </div>
      <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} onCompleted={() => navigate('/habits')} />
    </div>
  );
}
