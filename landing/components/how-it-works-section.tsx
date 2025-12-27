"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Integrate SDK",
      description:
        "Add our lightweight SDK to your platform in minutes with support for multiple programming languages.",
    },
    {
      number: "02",
      title: "Configure Rules",
      description: "Set up payment verification rules, fraud detection parameters, and customize your workflow.",
    },
    {
      number: "03",
      title: "Start Verifying",
      description: "Process payments securely in real-time with instant verification and fraud protection.",
    },
  ]

  return (
    <section id="how-it-works" className="py-20 px-6 md:px-12 lg:px-24 relative overflow-hidden bg-background">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#115097]/20 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold text-foreground text-center mb-20"
        >
          How it works?
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Logo */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <div className="relative w-80 h-80 flex items-center justify-center">
              <Image
                src="/images/fetan-logo.png"
                alt="Fetan Pay"
                width={320}
                height={320}
                className="object-contain drop-shadow-[0_0_40px_rgba(17,80,151,0.6)]"
              />
            </div>
          </motion.div>

          {/* Right side - Steps */}
          <div className="space-y-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex gap-6"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-[#115097]/20 backdrop-blur-xl border border-[#115097]/30 flex items-center justify-center">
                    <span className="text-xl font-bold text-[#115097]">{step.number}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-center mt-16"
        >
          <button className="group px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all duration-300 flex items-center gap-2">
            Start now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  )
}
