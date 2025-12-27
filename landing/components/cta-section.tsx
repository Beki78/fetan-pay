"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-20 px-6 md:px-12 lg:px-24 relative overflow-hidden bg-background">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#115097]/20 rounded-full blur-[150px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto text-center"
      >
        <div className="p-12 rounded-3xl bg-card/50 backdrop-blur-xl border border-border shadow-2xl">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Ready to secure your payments?</h2>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            Join thousands of businesses using Fetan Pay to verify payments and prevent fraud in real-time. Get started
            in minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="group px-8 py-4 bg-[#115097] text-primary-foreground font-semibold rounded-lg hover:bg-[#115097]/90 transition-all duration-300 flex items-center gap-2 shadow-[0_0_30px_rgba(17,80,151,0.4)]">
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-card text-foreground font-semibold rounded-lg backdrop-blur-xl border border-border hover:bg-accent transition-all duration-300">
              Schedule Demo
            </button>
          </div>

          <p className="text-muted-foreground/70 text-sm mt-6">No credit card required. 14-day free trial.</p>
        </div>
      </motion.div>
    </section>
  )
}
