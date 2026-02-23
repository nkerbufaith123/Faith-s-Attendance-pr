import React from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer
      id="contact"
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0B1C3D 0%, #060B1A 100%)' }}
    >
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <motion.div className="text-2xl font-bold mb-4" whileHover={{ scale: 1.05 }}>
              <span
                className="bg-gradient-to-r from-[#3FA9FF] to-[#5B2EFF] bg-clip-text"
                style={{ WebkitTextFillColor: 'transparent' }}
              >
                Attendance
              </span>
              <span className="text-white">Pro</span>
            </motion.div>
            <p className="text-[#A7B3C5] leading-relaxed mb-6">
              Smart attendance management and QR code system for modern businesses. Secure,
              intelligent, and enterprise-ready.
            </p>

            {/* Social Media Icons */}
            <div className="flex space-x-4">
              {[
                { Icon: Facebook, href: '#' },
                { Icon: Twitter, href: '#' },
                { Icon: Linkedin, href: '#' },
                { Icon: Instagram, href: '#' },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md"
                  style={{
                    background: 'rgba(63, 169, 255, 0.1)',
                    border: '1px solid rgba(63, 169, 255, 0.2)',
                  }}
                  whileHover={{
                    scale: 1.1,
                    boxShadow: '0 0 20px rgba(63, 169, 255, 0.4)',
                    borderColor: 'rgba(63, 169, 255, 0.5)',
                  }}
                >
                  <social.Icon className="w-5 h-5 text-[#3FA9FF]" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-white text-lg mb-6 font-semibold">Quick Links</h3>
            <ul className="space-y-3">
              {['About Us', 'Features', 'Pricing', 'Blog', 'Careers', 'Help Center'].map(
                (link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-[#A7B3C5] hover:text-[#3FA9FF] transition-colors duration-300 flex items-center space-x-2 group"
                    >
                      <span className="w-0 h-px bg-[#3FA9FF] group-hover:w-4 transition-all duration-300"></span>
                      <span>{link}</span>
                    </a>
                  </li>
                )
              )}
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-white text-lg mb-6 font-semibold">Resources</h3>
            <ul className="space-y-3">
              {[
                'Documentation',
                'API Reference',
                'Tutorials',
                'Case Studies',
                'Webinars',
                'Community',
              ].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-[#A7B3C5] hover:text-[#3FA9FF] transition-colors duration-300 flex items-center space-x-2 group"
                  >
                    <span className="w-0 h-px bg-[#3FA9FF] group-hover:w-4 transition-all duration-300"></span>
                    <span>{link}</span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-white text-lg mb-6 font-semibold">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
                  style={{
                    background: 'rgba(63, 169, 255, 0.1)',
                    border: '1px solid rgba(63, 169, 255, 0.2)',
                  }}
                >
                  <Mail className="w-4 h-4 text-[#3FA9FF]" />
                </div>
                <div>
                  <div className="text-[#A7B3C5] text-sm mb-1">Email</div>
                  <a
                    href="mailto:support@attendancepro.com"
                    className="text-white hover:text-[#3FA9FF] transition-colors duration-300"
                  >
                    support@attendancepro.com
                  </a>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
                  style={{
                    background: 'rgba(63, 169, 255, 0.1)',
                    border: '1px solid rgba(63, 169, 255, 0.2)',
                  }}
                >
                  <Phone className="w-4 h-4 text-[#3FA9FF]" />
                </div>
                <div>
                  <div className="text-[#A7B3C5] text-sm mb-1">Phone</div>
                  <a
                    href="tel:+1234567890"
                    className="text-white hover:text-[#3FA9FF] transition-colors duration-300"
                  >
                    +1 (234) 567-8900
                  </a>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
                  style={{
                    background: 'rgba(63, 169, 255, 0.1)',
                    border: '1px solid rgba(63, 169, 255, 0.2)',
                  }}
                >
                  <MapPin className="w-4 h-4 text-[#3FA9FF]" />
                </div>
                <div>
                  <div className="text-[#A7B3C5] text-sm mb-1">Address</div>
                  <div className="text-white">
                    123 Tech Boulevard, Suite 500
                    <br />
                    San Francisco, CA 94105
                  </div>
                </div>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        className="border-t py-6"
        style={{ borderColor: 'rgba(63, 169, 255, 0.1)' }}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-[#A7B3C5] text-sm">
              © 2026 AttendancePro. All rights reserved.
            </p>
            <div className="flex space-x-6">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-[#A7B3C5] hover:text-[#3FA9FF] transition-colors duration-300 text-sm"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Glow Effect */}
      <div
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, #3FA9FF, transparent)',
          opacity: 0.3,
        }}
      />
    </footer>
  );
}
