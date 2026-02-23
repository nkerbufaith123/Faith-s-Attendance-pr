import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';

export function CTA() {
  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #060B1A 0%, #0B1C3D 100%)' }}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-full blur-3xl opacity-30"
          style={{ background: 'radial-gradient(circle, #3FA9FF 0%, transparent 70%)' }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full mb-6 backdrop-blur-md"
            style={{
              background: 'rgba(63, 169, 255, 0.1)',
              border: '1px solid rgba(63, 169, 255, 0.2)',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="w-4 h-4 text-[#3FA9FF]" />
            <span className="text-sm text-[#A7B3C5] uppercase tracking-wider">
              Start Free Today
            </span>
          </motion.div>

          {/* Headline */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">
            <span className="text-white">Ready to Transform </span>
            <span
              className="bg-gradient-to-r from-[#3FA9FF] to-[#4FD1FF] bg-clip-text"
              style={{ WebkitTextFillColor: 'transparent' }}
            >
              Attendance Management
            </span>
            <span className="text-white">?</span>
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-[#A7B3C5] mb-10 leading-relaxed max-w-2xl mx-auto">
            Join thousands of businesses using AttendancePro to streamline workforce management,
            reduce errors, and boost productivity.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <motion.button
              className="px-10 py-4 rounded-full text-white text-lg font-medium relative overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, #3FA9FF 0%, #5B2EFF 100%)',
                boxShadow: '0 0 40px rgba(63, 169, 255, 0.5)',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center justify-center space-x-2">
                <span>Get Started Today</span>
                <ArrowRight className="w-5 h-5" />
              </span>
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(135deg, #4FD1FF 0%, #1F4FFF 100%)',
                }}
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>

            <motion.button
              className="px-10 py-4 rounded-full text-white text-lg font-medium backdrop-blur-md"
              style={{
                background: 'rgba(63, 169, 255, 0.1)',
                border: '2px solid rgba(63, 169, 255, 0.3)',
              }}
              whileHover={{
                scale: 1.05,
                borderColor: 'rgba(63, 169, 255, 0.6)',
                boxShadow: '0 0 20px rgba(63, 169, 255, 0.3)',
              }}
              whileTap={{ scale: 0.95 }}
            >
              Schedule Demo
            </motion.button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-[#A7B3C5]">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
