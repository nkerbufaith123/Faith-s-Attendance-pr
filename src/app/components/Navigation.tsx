import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Menu, X } from 'lucide-react';

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'backdrop-blur-xl bg-[#0B1C3D]/80 shadow-lg shadow-[#1F4FFF]/20'
          : 'backdrop-blur-md bg-[#0B1C3D]/40'
      }`}
      style={{
        borderBottom: isScrolled ? '1px solid rgba(63, 169, 255, 0.1)' : '1px solid transparent',
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            className="text-2xl font-bold"
            whileHover={{ scale: 1.05 }}
          >
            <span
              className="bg-gradient-to-r from-[#3FA9FF] to-[#5B2EFF] bg-clip-text"
              style={{ WebkitTextFillColor: 'transparent' }}
            >
              Attendance
            </span>
            <span className="text-white">Pro</span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {['Home', 'Features', 'Pricing', 'About', 'Contact'].map((item, index) => (
              <motion.button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className="text-[#A7B3C5] hover:text-[#3FA9FF] transition-all duration-300 font-medium relative group"
                whileHover={{ scale: 1.05 }}
              >
                {item}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#3FA9FF] to-[#5B2EFF] group-hover:w-full transition-all duration-300"></span>
              </motion.button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <motion.a
              href="/login.html"
              className="px-5 py-2 text-[#A7B3C5] hover:text-[#3FA9FF] transition-all duration-300 font-medium"
              whileHover={{ scale: 1.05 }}
            >
              Login
            </motion.a>
            <motion.a
              href="/signup.html"
              className="px-6 py-2 rounded-full text-white font-medium relative overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, #3FA9FF 0%, #5B2EFF 100%)',
                display: 'inline-block'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">Get Started</span>
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(135deg, #4FD1FF 0%, #1F4FFF 100%)',
                }}
              />
            </motion.a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden mt-4 pb-4 space-y-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {['Home', 'Features', 'Pricing', 'About', 'Contact'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className="block w-full text-left text-[#A7B3C5] hover:text-[#3FA9FF] transition-colors duration-300 font-medium py-2"
              >
                {item}
              </button>
            ))}
            <div className="flex flex-col space-y-3 pt-4 border-t border-[#3FA9FF]/20">
              <a href="/login.html" className="text-[#A7B3C5] font-medium">Login</a>
              <a
                href="/signup.html"
                className="px-6 py-2 rounded-full text-white font-medium inline-block"
                style={{
                  background: 'linear-gradient(135deg, #3FA9FF 0%, #5B2EFF 100%)',
                }}
              >
                Get Started
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
