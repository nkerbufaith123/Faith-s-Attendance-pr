import React from 'react';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { HowItWorks } from './components/HowItWorks';
import { Testimonials } from './components/Testimonials';
import { Pricing } from './components/Pricing';
import { Integrations } from './components/Integrations';
import { FAQ } from './components/FAQ';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <Services />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <Integrations />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
