"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Github, Twitter, Linkedin, Heart } from 'lucide-react';
import { Button } from "@/components/ui/button";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    {
      title: 'Product',
      links: [
        { name: 'Features', href: '/#features' },
        { name: 'How It Works', href: '/#how-it-works' },
        { name: 'Pricing', href: '/#pricing' },
      ]
    },
    {
      title: 'Resources',
      links: [
        { name: 'Documentation', href: '/docs' },
        { name: 'Blog', href: '/blog' },
        { name: 'FAQ', href: '/faq' },
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About', href: '/about' },
        { name: 'Privacy', href: '/privacy' },
        { name: 'Terms', href: '/terms' },
      ]
    }
  ];
  
  return (
    <footer className="border-t py-16 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 opacity-10">
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-blue-400 blur-3xl" />
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-purple-400 blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 max-w-6xl mx-auto">
          {/* Brand column */}
          <div className="flex flex-col">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                Genarki
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              AI-powered SaaS validation and blueprint generation platform to turn your ideas into successful businesses.
            </p>
            
            <div className="flex space-x-4 mt-4 text-muted-foreground">
              <motion.a 
                href="https://github.com/Wali05" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-600 transition-colors"
                whileHover={{ y: -3 }}
              >
                <Github className="h-5 w-5" />
              </motion.a>
              <motion.a 
                href="https://www.linkedin.com/in/wali-ahed-hussain-41b549252/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-600 transition-colors"
                whileHover={{ y: -3 }}
              >
                <Linkedin className="h-5 w-5" />
              </motion.a>
              <motion.a 
                href="/" 
                className="hover:text-blue-600 transition-colors"
                whileHover={{ y: -3 }}
              >
                <Twitter className="h-5 w-5" />
              </motion.a>
            </div>
          </div>
          
          {/* Link columns */}
          {footerLinks.map((column, idx) => (
            <div key={column.title} className="flex flex-col">
              <h3 className="font-semibold mb-4">{column.title}</h3>
              <ul className="space-y-3">
                {column.links.map((link, linkIdx) => (
                  <motion.li 
                    key={link.name}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: 0.1 * linkIdx }}
                    viewport={{ once: true }}
                  >
                    <Link 
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-blue-600 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center border-t pt-8 mt-16 max-w-6xl mx-auto">
          <p className="text-sm text-muted-foreground flex items-center">
            &copy; {currentYear} Genarki. Made with <Heart className="h-3 w-3 mx-1 text-red-500 inline-block" /> by Wali
          </p>
          
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Button variant="link" asChild className="text-sm text-muted-foreground p-0">
              <Link href="/privacy">Privacy Policy</Link>
            </Button>
            <Button variant="link" asChild className="text-sm text-muted-foreground p-0">
              <Link href="/terms">Terms of Service</Link>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
} 