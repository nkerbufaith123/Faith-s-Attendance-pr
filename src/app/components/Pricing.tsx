import React from 'react';
import { motion } from 'motion/react';
import { Check, Zap, Crown, Building2 } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    icon: Zap,
    price: '$29',
    period: 'per month',
    description: 'Perfect for small teams getting started',
    features: [
      'Up to 50 employees',
      'Basic QR code generation',
      'Mobile app access',
      'Email support',
      'Standard analytics',
    ],
    popular: false,
  },
  {
    name: 'Professional',
    icon: Crown,
    price: '$79',
    period: 'per month',
    description: 'Ideal for growing businesses',
    features: [
      'Up to 500 employees',
      'Advanced QR features',
      'Multi-platform support',
      'Priority support',
      'Advanced analytics',
      'Custom reports',
      'API access',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    icon: Building2,
    price: 'Custom',
    period: 'contact us',
    description: 'For large organizations',
    features: [
      'Unlimited employees',
      'White-label solution',
      'Dedicated support',
      'Custom integrations',
      'Advanced security',
      'SLA guarantee',
      'Training & onboarding',
    ],
    popular: false,
  },
];

export function Pricing() {
  return (
    <section
      id="pricing"
      className="py-24 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0B1C3D 0%, #0F2A5F 100%)' }}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
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
            <span className="text-sm text-[#3FA9FF] uppercase tracking-wider">Pricing</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl mb-4">
            <span className="text-white">Choose Your </span>
            <span
              className="bg-gradient-to-r from-[#3FA9FF] to-[#5B2EFF] bg-clip-text"
              style={{ WebkitTextFillColor: 'transparent' }}
            >
              Perfect Plan
            </span>
          </h2>
          <p className="text-lg text-[#A7B3C5] max-w-2xl mx-auto">
            Flexible pricing options to match your business needs
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <motion.div
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-sm font-semibold text-white z-10"
                  style={{
                    background: 'linear-gradient(135deg, #3FA9FF, #5B2EFF)',
                    boxShadow: '0 0 20px rgba(63, 169, 255, 0.5)',
                  }}
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  Most Popular
                </motion.div>
              )}

              <motion.div
                className={`relative rounded-2xl p-8 backdrop-blur-xl h-full ${
                  plan.popular ? 'md:scale-105' : ''
                }`}
                style={{
                  background: plan.popular
                    ? 'rgba(15, 42, 95, 0.6)'
                    : 'rgba(15, 42, 95, 0.4)',
                  border: plan.popular
                    ? '2px solid rgba(63, 169, 255, 0.3)'
                    : '1px solid rgba(63, 169, 255, 0.1)',
                }}
                whileHover={{
                  y: -8,
                  boxShadow: plan.popular
                    ? '0 25px 50px rgba(63, 169, 255, 0.3)'
                    : '0 20px 40px rgba(63, 169, 255, 0.2)',
                }}
              >
                {/* Icon */}
                <motion.div
                  className="w-16 h-16 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    background: 'linear-gradient(135deg, rgba(63, 169, 255, 0.2), rgba(91, 46, 255, 0.2))',
                    border: '1px solid rgba(63, 169, 255, 0.3)',
                  }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <plan.icon className="w-8 h-8 text-[#3FA9FF]" />
                </motion.div>

                {/* Plan Name */}
                <h3 className="text-2xl text-white font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-[#A7B3C5] mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span
                      className="text-5xl font-bold bg-gradient-to-r from-[#3FA9FF] to-[#4FD1FF] bg-clip-text"
                      style={{ WebkitTextFillColor: 'transparent' }}
                    >
                      {plan.price}
                    </span>
                    {plan.price !== 'Custom' && (
                      <span className="text-[#A7B3C5] ml-2">/{plan.period}</span>
                    )}
                  </div>
                  {plan.price === 'Custom' && (
                    <span className="text-[#A7B3C5]">{plan.period}</span>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-[#22C55E] flex-shrink-0 mt-0.5" />
                      <span className="text-[#A7B3C5]">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <motion.button
                  className="w-full px-6 py-3 rounded-full text-white font-medium relative overflow-hidden"
                  style={{
                    background: plan.popular
                      ? 'linear-gradient(135deg, #3FA9FF, #5B2EFF)'
                      : 'rgba(63, 169, 255, 0.1)',
                    border: plan.popular ? 'none' : '1px solid rgba(63, 169, 255, 0.3)',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10">
                    {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                  </span>
                  {!plan.popular && (
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(135deg, #3FA9FF, #5B2EFF)',
                      }}
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.button>

                {/* Glow Effect for Popular */}
                {plan.popular && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl opacity-30 -z-10 blur-xl"
                    style={{
                      background: 'radial-gradient(circle at center, #3FA9FF, transparent 70%)',
                    }}
                  />
                )}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
