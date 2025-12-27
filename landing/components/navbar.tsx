"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

export function Navbar() {
  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "How it Works", href: "#how-it-works" },
    { name: "Integrations", href: "#integrations" },
    { name: "Pricing", href: "#pricing" },
    { name: "Docs", href: "#docs" },
    { name: "Contact", href: "#contact" },
  ]

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    if (href.startsWith("#")) {
      const element = document.querySelector(href)
      if (element) {
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - 100 // 100px offset for navbar
        
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        })
      }
    }
  }

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container mx-auto">
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-2xl px-6 py-4 shadow-lg">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <Image src="/images/fetan-logo.png" alt="Fetan Pay" width={40} height={40} className="w-10 h-10" />
            </Link>

            {/* Nav Links - Hidden on mobile */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                >
                  <a
                    href={link.href}
                    onClick={(e) => handleSmoothScroll(e, link.href)}
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 cursor-pointer"
                  >
                    {link.name}
                  </a>
                </motion.div>
              ))}
            </div>

            {/* Right side buttons */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.25 }}
              >
                <ThemeToggle />
              </motion.div>

              {/* Get Started Button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <Button className="bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all duration-300">
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
