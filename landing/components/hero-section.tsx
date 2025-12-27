"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ShieldCheck, CheckCircle2, ArrowRight, Play } from "lucide-react";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-background pt-24">
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-40 left-20 w-96 h-96 rounded-full opacity-30"
          style={{ background: "#115097", filter: "blur(120px)" }}
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 rounded-full opacity-20"
          style={{ background: "#115097", filter: "blur(120px)" }}
          animate={{
            x: [0, -30, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 order-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
                <ShieldCheck className="w-4 h-4 text-foreground" />
                <span className="text-sm lg:text-xs text-foreground font-medium">
                  Trusted Payment Verification
                </span>
              </div>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl lg:text-6xl font-bold text-foreground leading-tight text-balance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Verify Payments{" "}
              <span style={{ color: "#115097" }}>Instantly</span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl lg:text-base text-muted-foreground max-w-xl text-pretty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Secure, fast, and reliable payment verification for modern
              businesses. Protect your transactions with enterprise-grade
              security.
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Button
                size="lg"
                className="glass-strong text-foreground font-semibold px-8 py-6 text-base hover:bg-[rgba(17,80,151,0.3)] transition-all duration-300"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                className="glass text-foreground font-semibold px-8 py-6 text-base hover:bg-[rgba(17,80,151,0.2)] transition-all duration-300"
              >
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </motion.div>

            <motion.div
              className="flex items-center gap-6 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className="w-5 h-5"
                  style={{ color: "#115097" }}
                />
                <span className="text-sm text-muted-foreground">
                  No credit card required
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className="w-5 h-5"
                  style={{ color: "#115097" }}
                />
                <span className="text-sm text-muted-foreground">
                  14-day free trial
                </span>
              </div>
            </motion.div>
          </div>

          {/* Image on the right side, updated to new payment hero image */}
          <motion.div
            className="relative order-2"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Image
              src="/images/hero-payment.svg"
              alt="Payment Verification"
              width={600}
              height={600}
              className="w-full max-w-md mx-auto h-auto drop-shadow-2xl rounded-2xl"
            />
          </motion.div>
        </div>
      </div>

      {/* Gradient overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
