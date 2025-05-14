"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";

export function LandingNavbar() {
  const { isLoaded, isSignedIn } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navItems = [
    {
      name: "Features",
      link: "/#features",
    },
    {
      name: "How It Works",
      link: "/#how-it-works",
    },
    {
      name: "Pricing",
      link: "/#pricing",
    },
  ];

  return (
    <Navbar className="mb-8">
      {/* Desktop Navigation */}
      <NavBody>
        <NavbarLogo />
        <NavItems items={navItems} />
        <div className="flex items-center gap-4">
          {isLoaded && isSignedIn ? (
            <NavbarButton href="/dashboard" variant="gradient">Dashboard</NavbarButton>
          ) : (
            <>
              <NavbarButton href="/sign-in" variant="secondary">Login</NavbarButton>
              <NavbarButton href="/sign-up" variant="gradient">Get Started</NavbarButton>
            </>
          )}
        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav>
        <MobileNavHeader>
          <Link href={isLoaded && isSignedIn ? "/dashboard" : "/"} className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Genarki</span>
          </Link>
          <div className="flex items-center gap-4">
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </div>
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          {navItems.map((item, idx) => (
            <a
              key={`mobile-link-${idx}`}
              href={item.link}
              onClick={() => setIsMobileMenuOpen(false)}
              className="relative text-neutral-600 dark:text-neutral-300"
            >
              <span className="block py-2">{item.name}</span>
            </a>
          ))}
          <div className="flex w-full flex-col gap-4 mt-4">
            {isLoaded && isSignedIn ? (
              <NavbarButton
                href="/dashboard"
                variant="gradient"
                className="w-full"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </NavbarButton>
            ) : (
              <>
                <NavbarButton
                  href="/sign-in"
                  variant="secondary"
                  className="w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </NavbarButton>
                <NavbarButton
                  href="/sign-up"
                  variant="gradient"
                  className="w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started
                </NavbarButton>
              </>
            )}
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
} 