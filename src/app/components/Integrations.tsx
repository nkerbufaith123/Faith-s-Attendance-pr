import React from 'react';
import { motion } from 'motion/react';

const integrations = [
  { name: 'Slack', logo: '💬' },
  { name: 'Google Workspace', logo: '🔍' },
  { name: 'Microsoft Teams', logo: '📧' },
  { name: 'Salesforce', logo: '☁️' },
  { name: 'Zoom', logo: '📹' },
  { name: 'Jira', logo: '📊' },
  { name: 'Trello', logo: '📋' },
  { name: 'Asana', logo: '✅' },
];

export function Integrations() {
  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0F2A5F 0%, #0B1C3D 100%)' }}
    >
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
            <span className="text-sm text-[#3FA9FF] uppercase tracking-wider">Integrations</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl mb-4">
            <span className="text-white">Seamlessly </span>
            <span
              className="bg-gradient-to-r from-[#3FA9FF] to-[#5B2EFF] bg-clip-text"
              style={{ WebkitTextFillColor: 'transparent' }}
            >
              Integrates
            </span>
          </h2>
          <p className="text-lg text-[#A7B3C5] max-w-2xl mx-auto">
            Connect with your favorite tools and apps. Works with your workflow, not against it.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {integrations.map((integration, index) => (
            <motion.div
              key={index}
              className="relative group"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <motion.div
                className="rounded-2xl p-6 backdrop-blur-xl flex flex-col items-center justify-center aspect-square"
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
                <div className="text-4xl mb-3">{integration.logo}</div>
                <div className="text-white text-center font-medium">{integration.name}</div>

                {/* Glow on Hover */}
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

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-[#A7B3C5]">
            + 50 more integrations available{' '}
            <a href="#" className="text-[#3FA9FF] hover:underline">
              View all →
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
