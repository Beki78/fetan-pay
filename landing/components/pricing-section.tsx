"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"

export function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "$49",
      description: "Perfect for small businesses",
      features: [
        "Up to 1,000 transactions/month",
        "Basic fraud detection",
        "Email support",
        "API access",
        "Dashboard access",
      ],
    },
    {
      name: "Professional",
      price: "$149",
      description: "For growing businesses",
      popular: true,
      features: [
        "Up to 10,000 transactions/month",
        "Advanced fraud detection",
        "Priority support",
        "API access",
        "Dashboard access",
        "Custom rules",
        "Analytics & reporting",
      ],
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations",
      features: [
        "Unlimited transactions",
        "Enterprise fraud detection",
        "24/7 dedicated support",
        "API access",
        "Dashboard access",
        "Custom rules",
        "Advanced analytics",
        "Custom integrations",
        "SLA guarantee",
      ],
    },
  ]

  return (
    <section id="pricing" className="py-20 px-6 md:px-12 lg:px-24 relative overflow-hidden bg-background">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-[#115097]/20 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Simple, transparent pricing</h2>
          <p className="text-muted-foreground text-lg">Choose the plan that fits your business needs</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative p-8 rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:scale-105 ${
                plan.popular
                  ? "bg-[#115097]/20 border-[#115097] shadow-[0_0_40px_rgba(17,80,151,0.3)]"
                  : "bg-card/50 border-border hover:border-[#115097]/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-[#115097] text-white text-sm font-semibold rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-5xl font-bold text-foreground">{plan.price}</span>
                {plan.price !== "Custom" && <span className="text-muted-foreground ml-2">/month</span>}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#115097] flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                  plan.popular
                    ? "bg-[#115097] text-primary-foreground hover:bg-[#115097]/90"
                    : "bg-card text-foreground backdrop-blur-xl border border-border hover:bg-accent"
                }`}
              >
                Get Started
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
