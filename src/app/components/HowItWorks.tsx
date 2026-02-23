import React from 'react';
import { motion } from 'motion/react';
import { UserPlus, ScanLine, BarChart2, TrendingUp } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    number: '01',
    title: 'Create QR or User Profile',
    description: 'Set up employee profiles and generate unique QR codes for seamless check-ins.',
  },
  {
    icon: ScanLine,
    number: '02',
    title: 'Check-In & Track Attendance',
    description: 'Employees scan QR codes or use the app to mark attendance instantly.',
  },
  {
    icon: BarChart2,
    number: '03',
    title: 'Monitor & Analyze Data',
    description: 'View real-time dashboards with attendance metrics, trends, and insights.',
  },
  {
    icon: TrendingUp,
    number: '04',
    title: 'Optimize Workforce',
    description: 'Use data-driven insights to improve scheduling, productivity, and efficiency.',
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-24 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0B1C3D 0%, #060B1A 100%)' }}
    >
      {/* Animated Background Lines */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <motion.div
          className="absolute top-0 left-1/4 w-px h-full"
          style={{ background: 'linear-gradient(180deg, transparent, #3FA9FF, transparent)' }}
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-0 right-1/4 w-px h-full"
          style={{ background: 'linear-gradient(180deg, transparent, #5B2EFF, transparent)' }}
          animate={{ opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-block px-4 py-2 rounded-full mb-4 backdrop-blur-md"
            style={{
              background: 'rgba(63, 169, 255, 0.1)',
              border: '1px solid rgba(63, 169, 255, 0.2)',
            }}
          >
            <span className="text-sm text-[#3FA9FF] uppercase tracking-wider">Process</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl mb-4">
            <span className="text-white">How It </span>
            <span
              className="bg-gradient-to-r from-[#3FA9FF] to-[#5B2EFF] bg-clip-text"
              style={{ WebkitTextFillColor: 'transparent' }}
            >
              Works
            </span>
          </h2>
          <p className="text-lg text-[#A7B3C5] max-w-2xl mx-auto">
            Get started in minutes with our streamlined four-step process
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Connecting Arrow (Desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-px z-0">
                  <motion.div
                    className="h-full"
                    style={{
                      background: 'linear-gradient(90deg, rgba(63, 169, 255, 0.5), rgba(63, 169, 255, 0.1))',
                    }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.2 }}
                  />
                </div>
              )}

              {/* Card */}
              <motion.div
                className="relative rounded-2xl p-6 backdrop-blur-xl h-full"
                style={{
                  background: 'rgba(15, 42, 95, 0.4)',
                  border: '1px solid rgba(63, 169, 255, 0.1)',
                }}
                whileHover={{
                  y: -8,
                  boxShadow: '0 20px 40px rgba(63, 169, 255, 0.2)',
                  borderColor: 'rgba(63, 169, 255, 0.3)',
                }}
              >
                {/* Step Number Badge */}
                <motion.div
                  className="absolute -top-4 -right-4 w-12 h-12 rounded-full flex items-center justify-center font-bold text-white"
                  style={{
                    background: 'linear-gradient(135deg, #3FA9FF, #5B2EFF)',
                    boxShadow: '0 0 20px rgba(63, 169, 255, 0.5)',
                  }}
                  whileHover={{ scale: 1.1, rotate: 10 }}
                >
                  {step.number}
                </motion.div>

                {/* Icon */}
                <motion.div
                  className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 mx-auto"
                  style={{
                    background: 'linear-gradient(135deg, rgba(63, 169, 255, 0.2), rgba(91, 46, 255, 0.2))',
                    border: '1px solid rgba(63, 169, 255, 0.3)',
                  }}
                  whileHover={{ scale: 1.1, rotate: -5 }}
                >
                  <step.icon className="w-8 h-8 text-[#3FA9FF]" />
                </motion.div>

                {/* Content */}
                <h3 className="text-lg text-white mb-2 text-center font-semibold">
                  {step.title}
                </h3>
                <p className="text-sm text-[#A7B3C5] text-center leading-relaxed">
                  {step.description}
                </p>

                {/* Hover Glow */}
                <motion.div
                  className="absolute inset-0 rounded-2xl opacity-0 -z-10"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(63, 169, 255, 0.15), transparent 70%)',
                  }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.button
            className="px-10 py-4 rounded-full text-white text-lg font-medium relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #3FA9FF 0%, #5B2EFF 100%)',
              boxShadow: '0 0 30px rgba(63, 169, 255, 0.4)',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10">Start Your Free Trial</span>
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
        </motion.div>
      </div>
    </section>
  );
}
