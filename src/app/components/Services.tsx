import React from 'react';
import { motion } from 'motion/react';
import { QrCode, BarChart3, Palette, Shield, Zap } from 'lucide-react';

const features = [
  {
    icon: QrCode,
    title: 'Smart QR Codes',
    description:
      'Quickly generate QR codes for attendance or access control. Secure, scannable, and integrated with your system.',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description:
      'Live dashboards with employee check-ins, attendance trends, and actionable workforce insights.',
  },
  {
    icon: Palette,
    title: 'Custom Reports',
    description:
      'Exportable attendance logs, insights, and custom reports tailored to your business needs.',
  },
  {
    icon: Shield,
    title: 'Secure Access',
    description:
      'Two-factor authentication and encrypted data ensure your workforce information stays protected.',
  },
  {
    icon: Zap,
    title: 'Multi-Platform Support',
    description:
      'Works seamlessly on desktop, tablet, and mobile devices. Access anywhere, anytime.',
  },
];

export function Services() {
  return (
    <section
      id="features"
      className="py-24 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0F2A5F 0%, #0B1C3D 100%)' }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(63, 169, 255, 0.15) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
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
            <span className="text-sm text-[#3FA9FF] uppercase tracking-wider">Features</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl mb-4">
            <span className="text-white">Powerful Features for </span>
            <span
              className="bg-gradient-to-r from-[#3FA9FF] to-[#5B2EFF] bg-clip-text"
              style={{ WebkitTextFillColor: 'transparent' }}
            >
              Every Need
            </span>
          </h2>
          <p className="text-lg text-[#A7B3C5] max-w-2xl mx-auto">
            Enterprise-grade tools designed to streamline attendance management and boost
            productivity
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="relative group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Glassmorphic Card */}
              <motion.div
                className="relative rounded-2xl p-8 h-full backdrop-blur-xl"
                style={{
                  background: 'rgba(15, 42, 95, 0.4)',
                  border: '1px solid rgba(63, 169, 255, 0.1)',
                }}
                whileHover={{
                  y: -8,
                  boxShadow: '0 20px 40px rgba(63, 169, 255, 0.2)',
                  borderColor: 'rgba(63, 169, 255, 0.3)',
                }}
                transition={{ duration: 0.3 }}
              >
                {/* Glow Effect on Hover */}
                <motion.div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                  style={{
                    background: 'radial-gradient(circle at top, rgba(63, 169, 255, 0.15), transparent 70%)',
                  }}
                />

                {/* Icon Container */}
                <motion.div
                  className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 relative"
                  style={{
                    background: 'linear-gradient(135deg, rgba(63, 169, 255, 0.2), rgba(91, 46, 255, 0.2))',
                    border: '1px solid rgba(63, 169, 255, 0.3)',
                  }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <feature.icon className="w-8 h-8 text-[#3FA9FF]" />
                  {/* Icon Glow */}
                  <div
                    className="absolute inset-0 rounded-xl blur-xl opacity-50"
                    style={{ background: 'rgba(63, 169, 255, 0.3)' }}
                  />
                </motion.div>

                {/* Content */}
                <h3 className="text-xl text-white mb-3 font-semibold">{feature.title}</h3>
                <p className="text-[#A7B3C5] leading-relaxed">{feature.description}</p>

                {/* Accent Line */}
                <motion.div
                  className="absolute bottom-0 left-0 h-1 rounded-b-2xl"
                  style={{
                    background: 'linear-gradient(90deg, #3FA9FF, #5B2EFF)',
                    width: '0%',
                  }}
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
