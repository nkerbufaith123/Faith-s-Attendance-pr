import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'How does the QR code attendance system work?',
    answer:
      'Employees simply scan a unique QR code using their mobile device to check in and out. The system instantly records their attendance and syncs it with your dashboard in real-time.',
  },
  {
    question: 'Can I customize the attendance tracking settings?',
    answer:
      'Yes! You can configure work schedules, break times, overtime rules, and custom attendance policies. The system adapts to your business needs.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Absolutely. We use enterprise-grade encryption, two-factor authentication, and comply with international data protection standards including GDPR and SOC 2.',
  },
  {
    question: 'What devices are supported?',
    answer:
      'AttendancePro works on all modern devices - iOS, Android, tablets, and desktop browsers. No special hardware required.',
  },
  {
    question: 'Can I export attendance reports?',
    answer:
      'Yes, you can export detailed reports in multiple formats (PDF, Excel, CSV) with custom date ranges and filters.',
  },
  {
    question: 'Do you offer customer support?',
    answer:
      'We provide 24/7 email support for all plans, with priority support and dedicated account managers for Professional and Enterprise plans.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0B1C3D 0%, #060B1A 100%)' }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(63, 169, 255, 0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(63, 169, 255, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
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
            <span className="text-sm text-[#3FA9FF] uppercase tracking-wider">FAQ</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl mb-4">
            <span className="text-white">Frequently Asked </span>
            <span
              className="bg-gradient-to-r from-[#3FA9FF] to-[#5B2EFF] bg-clip-text"
              style={{ WebkitTextFillColor: 'transparent' }}
            >
              Questions
            </span>
          </h2>
          <p className="text-lg text-[#A7B3C5] max-w-2xl mx-auto">
            Everything you need to know about AttendancePro
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="relative rounded-2xl backdrop-blur-xl overflow-hidden"
              style={{
                background: 'rgba(15, 42, 95, 0.4)',
                border: '1px solid rgba(63, 169, 255, 0.1)',
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <button
                className="w-full px-6 py-5 flex items-center justify-between text-left"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="text-white font-medium pr-8">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5 text-[#3FA9FF] flex-shrink-0" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5">
                      <div
                        className="w-full h-px mb-4"
                        style={{
                          background: 'linear-gradient(90deg, transparent, #3FA9FF, transparent)',
                        }}
                      />
                      <p className="text-[#A7B3C5] leading-relaxed">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Accent Line on Hover */}
              <motion.div
                className="absolute bottom-0 left-0 h-0.5"
                style={{
                  background: 'linear-gradient(90deg, #3FA9FF, #5B2EFF)',
                  width: '0%',
                }}
                whileHover={{ width: '100%' }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-[#A7B3C5]">
            Still have questions?{' '}
            <a href="#contact" className="text-[#3FA9FF] hover:underline">
              Contact our support team →
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
