import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Play, Sparkles } from 'lucide-react';

export function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24"
      style={{
        background: 'linear-gradient(180deg, #060B1A 0%, #0B1C3D 50%, #0F2A5F 100%)',
      }}
    >
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Glowing Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, #3FA9FF 0%, transparent 70%)' }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, #5B2EFF 0%, transparent 70%)' }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.2, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(63, 169, 255, 0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(63, 169, 255, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
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
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="w-4 h-4 text-[#3FA9FF]" />
              <span className="text-sm text-[#A7B3C5] uppercase tracking-wider">
                Smart Workforce Solution
              </span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl mb-6 leading-tight">
              <span className="text-white">Track Attendance </span>
              <span
                className="bg-gradient-to-r from-[#3FA9FF] to-[#4FD1FF] bg-clip-text"
                style={{ WebkitTextFillColor: 'transparent' }}
              >
                Smarter
              </span>
              <span className="text-white">.</span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-[#A7B3C5] mb-8 leading-relaxed max-w-xl">
              Automate employee attendance, monitor work hours in real time, and gain actionable
              insights with our intelligent attendance system.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <motion.button
                className="px-8 py-4 rounded-full text-white text-lg font-medium relative overflow-hidden group"
                style={{
                  background: 'linear-gradient(135deg, #3FA9FF 0%, #5B2EFF 100%)',
                  boxShadow: '0 0 30px rgba(63, 169, 255, 0.4)',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  <span>Get Started</span>
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
                className="px-8 py-4 rounded-full text-white text-lg font-medium backdrop-blur-md"
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
                <span className="flex items-center justify-center space-x-2">
                  <Play className="w-5 h-5" />
                  <span>View Demo</span>
                </span>
              </motion.button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              {[
                { value: '50K+', label: 'Active Users' },
                { value: '99.9%', label: 'Uptime SLA' },
                { value: '24/7', label: 'Support' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="backdrop-blur-md rounded-lg p-4"
                  style={{
                    background: 'rgba(15, 42, 95, 0.3)',
                    border: '1px solid rgba(63, 169, 255, 0.1)',
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <div
                    className="text-2xl font-bold bg-gradient-to-r from-[#3FA9FF] to-[#4FD1FF] bg-clip-text"
                    style={{ WebkitTextFillColor: 'transparent' }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-sm text-[#A7B3C5] mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Dashboard Preview */}
          <motion.div
            className="relative hidden lg:block"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative">
              {/* Glow Effect */}
              <motion.div
                className="absolute -inset-8 rounded-3xl opacity-30 blur-3xl"
                style={{ background: 'radial-gradient(circle, #3FA9FF 0%, transparent 70%)' }}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Dashboard Image */}
              <div
                className="relative rounded-3xl backdrop-blur-xl p-1 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(63, 169, 255, 0.2), rgba(91, 46, 255, 0.2))',
                  border: '1px solid rgba(63, 169, 255, 0.3)',
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdXR1cmlzdGljJTIwZGFzaGJvYXJkJTIwYW5hbHl0aWNzfGVufDF8fHx8MTc3MDcyOTg1MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Dashboard Preview"
                  className="rounded-2xl w-full"
                />
              </div>

              {/* Floating Elements */}
              <motion.div
                className="absolute -top-4 -right-4 backdrop-blur-xl rounded-2xl p-4"
                style={{
                  background: 'rgba(15, 42, 95, 0.8)',
                  border: '1px solid rgba(63, 169, 255, 0.3)',
                  boxShadow: '0 0 30px rgba(63, 169, 255, 0.3)',
                }}
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <div className="text-[#22C55E] text-sm font-medium">✓ 98% Attendance</div>
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -left-4 backdrop-blur-xl rounded-2xl p-4"
                style={{
                  background: 'rgba(15, 42, 95, 0.8)',
                  border: '1px solid rgba(63, 169, 255, 0.3)',
                  boxShadow: '0 0 30px rgba(63, 169, 255, 0.3)',
                }}
                animate={{
                  y: [0, 10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.5,
                }}
              >
                <div className="text-[#3FA9FF] text-sm font-medium">Real-time Sync</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
