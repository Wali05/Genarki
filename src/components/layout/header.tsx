"use client";

import Link from 'next/link';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Button } from '@/components/ui/button';
import { UserButton, useAuth } from "@clerk/nextjs";
import { Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface HeaderProps {
  showMobileMenuButton?: boolean;
  onMobileMenuClick?: () => void;
}

export function Header({ showMobileMenuButton = false, onMobileMenuClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isLoaded, isSignedIn } = useAuth();

  const navItems = [
    { name: 'Features', href: '/#features' },
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'Pricing', href: '/#pricing' },
  ];

  const handleMobileMenuToggle = () => {
    if (onMobileMenuClick) {
      onMobileMenuClick();
    } else {
      setMobileMenuOpen(!mobileMenuOpen);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          {showMobileMenuButton && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden mr-2"
              onClick={handleMobileMenuToggle}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Link href={isLoaded && isSignedIn ? "/dashboard" : "/"} className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Genarki</span>
          </Link>
        </motion.div>

        {/* Desktop Navigation - Only show on landing pages */}
        {!showMobileMenuButton && (
          <motion.nav 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden md:flex items-center gap-6 mx-4"
          >
            {navItems.map((item) => (
              <motion.div
                key={item.name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  href={item.href} 
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.name}
                </Link>
              </motion.div>
            ))}
          </motion.nav>
        )}

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4"
        >
          <ThemeToggle />
          
          {isLoaded && isSignedIn ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="hidden md:flex">
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300" asChild>
                <Link href="/sign-up">Get Started</Link>
              </Button>
              {!showMobileMenuButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={handleMobileMenuToggle}
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              )}
            </>
          )}
        </motion.div>
      </div>

      {/* Mobile Menu - Only for landing page */}
      {!showMobileMenuButton && mobileMenuOpen && !isSignedIn && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden py-4 px-4 border-t bg-background"
        >
          <nav className="flex flex-col space-y-4">
            {navItems.map((item) => (
              <Link 
                key={item.name}
                href={item.href} 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="flex flex-col space-y-2 pt-2 border-t">
              <Button variant="outline" size="sm" asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300" asChild>
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </div>
          </nav>
        </motion.div>
      )}
    </header>
  );
} 