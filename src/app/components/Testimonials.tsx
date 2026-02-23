import React from 'react';
import { motion } from 'motion/react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'HR Director, TechCorp',
    image: 'https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MDY3OTk1MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    content:
      'AttendancePro transformed how we manage our workforce. The real-time analytics and seamless QR integration saved us countless hours.',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Operations Manager, BuildRight',
    image: 'https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MDY3OTk1MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    content:
      'The multi-platform support is incredible. Our field teams can clock in from anywhere, and we have full visibility in real time.',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'CEO, StartupHub',
    image: 'https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MDY3OTk1MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    content:
      'Best investment we made this year. The secure access features and custom reports give us the insights we need to grow efficiently.',
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #060B1A 0%, #0B1C3D 100%)' }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
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
            <span className="text-sm text-[#3FA9FF] uppercase tracking-wider">Testimonials</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl mb-4">
            <span className="text-white">What Our </span>
            <span
              className="bg-gradient-to-r from-[#3FA9FF] to-[#5B2EFF] bg-clip-text"
              style={{ WebkitTextFillColor: 'transparent' }}
            >
              Clients Say
            </span>
          </h2>
          <p className="text-lg text-[#A7B3C5] max-w-2xl mx-auto">
            Trusted by thousands of businesses worldwide
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="relative group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <motion.div
                className="relative rounded-2xl p-8 backdrop-blur-xl h-full"
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
                {/* Quote Icon */}
                <Quote className="w-10 h-10 text-[#3FA9FF] opacity-20 mb-4" />

                {/* Rating */}
                <div className="flex space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#3FA9FF] text-[#3FA9FF]" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-[#A7B3C5] mb-6 leading-relaxed">{testimonial.content}</p>

                {/* Author */}
                <div className="flex items-center space-x-4">
                  <div
                    className="w-12 h-12 rounded-full overflow-hidden"
                    style={{
                      border: '2px solid rgba(63, 169, 255, 0.3)',
                    }}
                  >
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-white font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-[#A7B3C5]">{testimonial.role}</div>
                  </div>
                </div>

                {/* Glow Effect */}
                <motion.div
                  className="absolute inset-0 rounded-2xl opacity-0 -z-10"
                  style={{
                    background: 'radial-gradient(circle at top, rgba(63, 169, 255, 0.15), transparent 70%)',
                  }}
                  whileHover={{ opacity: 1 }}
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
