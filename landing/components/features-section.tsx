"use client";

import { motion } from "framer-motion";
import { Shield, Activity } from "lucide-react";

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative py-16 bg-background overflow-hidden"
    >
      <div id="integrations" className="absolute top-0" />
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20"
          style={{ background: "#115097", filter: "blur(120px)" }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2
            className="text-3xl md:text-5xl font-bold text-foreground mb-3 text-balance"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Essential tools for your
          </motion.h2>
          <motion.h2
            className="text-3xl md:text-5xl font-bold text-muted-foreground mb-4 text-balance"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            financial growth
          </motion.h2>
          <motion.p
            className="text-sm text-muted-foreground max-w-2xl mx-auto text-pretty"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Unlock your financial potential with Fetan Pay's powerful suite of 
            tools designed to drive your financial success
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 max-w-5xl mx-auto">
          {/* Top Left - Multi-Language Integration with Gemini effect */}
          <motion.div
            className="glass-card rounded-2xl p-6 hover:glass-strong transition-all duration-500 relative overflow-hidden group"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Seamless integration
            </h3>
            <p className="text-muted-foreground text-xs mb-6 leading-relaxed">
              Easily connect our platform with your existing financial tools.
              Our seamless integration ensures smooth data flow across all your
              devices.
            </p>

            <div className="relative h-40 mt-6">
              {/* Central hub */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 glass rounded-xl px-3 py-2 z-10 flex items-center gap-2"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: "#115097" }}
                />
                <span className="text-foreground text-xs font-medium">
                  Integration
                </span>
              </motion.div>

              {[
                { name: "typescript", x: 25, y: 25 },
                { name: "python", x: 75, y: 20 },
                { name: "nodejs", x: 80, y: 55 },
                { name: "go", x: 70, y: 75 },
                { name: "php", x: 20, y: 70 },
                { name: "java", x: 15, y: 50 },
              ].map((icon, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${icon.x}%`,
                    top: `${icon.y}%`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.15, duration: 0.4 }}
                >
                  {/* Connection path */}
                  <svg
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      width: "400px",
                      height: "400px",
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <motion.path
                      d={`M ${icon.x * 4} ${icon.y * 4} Q ${
                        200 + (icon.x - 50) * 2
                      } ${200 + (icon.y - 50) * 2}, 200 200`}
                      fill="none"
                      stroke="#115097"
                      strokeWidth="1.5"
                      strokeOpacity="0.3"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{
                        delay: i * 0.15 + 0.3,
                        duration: 0.8,
                        ease: "easeInOut",
                      }}
                    />
                  </svg>

                  {/* Icon */}
                  <motion.div
                    className="glass rounded-lg p-1.5"
                    animate={{
                      y: [0, -5, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                      delay: i * 0.3,
                    }}
                  >
                    <img
                      src={`https://skillicons.dev/icons?i=${icon.name}&theme=dark`}
                      alt={icon.name}
                      className="w-8 h-8"
                    />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Top Right - Revenue Analytics with Graph */}
          <motion.div
            className="glass-card rounded-2xl p-6 hover:glass-strong transition-all duration-500"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Real-time financial insights
            </h3>
            <p className="text-muted-foreground text-xs mb-6 leading-relaxed">
              Gain instant access to your financial data with our real-time
              analytics. Make informed decisions with up-to-the-minute
              information.
            </p>

            {/* Revenue display */}
            <div className="mb-4">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-muted-foreground text-xs">Revenue</span>
                <span className="text-xs text-muted-foreground/70">
                  Last 30 days
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">
                  $5.46K
                </span>
                <span
                  className="text-xs font-medium"
                  style={{ color: "#10b981" }}
                >
                  +14%
                </span>
              </div>
            </div>

            {/* Graph */}
            <div className="relative h-32">
              <svg
                className="w-full h-full"
                viewBox="0 0 400 120"
                preserveAspectRatio="none"
              >
                {/* Grid lines */}
                <line
                  x1="0"
                  y1="30"
                  x2="400"
                  y2="30"
                  stroke="#1f2937"
                  strokeWidth="1"
                />
                <line
                  x1="0"
                  y1="60"
                  x2="400"
                  y2="60"
                  stroke="#1f2937"
                  strokeWidth="1"
                />
                <line
                  x1="0"
                  y1="90"
                  x2="400"
                  y2="90"
                  stroke="#1f2937"
                  strokeWidth="1"
                />

                {/* Area under curve */}
                <motion.path
                  d="M 0 90 L 20 85 L 60 70 L 100 75 L 140 60 L 180 65 L 220 50 L 260 55 L 300 40 L 340 45 L 380 35 L 400 30 L 400 120 L 0 120 Z"
                  fill="url(#gradient)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.2 }}
                  transition={{ duration: 1 }}
                />

                {/* Line */}
                <motion.path
                  d="M 0 90 L 20 85 L 60 70 L 100 75 L 140 60 L 180 65 L 220 50 L 260 55 L 300 40 L 340 45 L 380 35 L 400 30"
                  fill="none"
                  stroke="#115097"
                  strokeWidth="2.5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />

                {/* Hover point */}
                <motion.circle
                  cx="300"
                  cy="40"
                  r="4"
                  fill="#115097"
                  animate={{
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                />

                <defs>
                  <linearGradient
                    id="gradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#115097" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#115097" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Tooltip */}
              <motion.div
                className="absolute glass rounded-lg px-2 py-1"
                style={{ top: "5px", right: "50px" }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5 }}
              >
                <div className="text-foreground text-xs font-medium">
                  $4,854
                </div>
              </motion.div>
            </div>

            {/* Y-axis labels */}
            <div className="flex justify-between text-xs text-muted-foreground/70 mt-1">
              <span>0K</span>
              <span>2K</span>
              <span>4K</span>
              <span>5K</span>
            </div>
          </motion.div>

          <motion.div
            className="glass-card rounded-2xl p-6 hover:glass-strong transition-all duration-500 relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Secure transactions
            </h3>
            <p className="text-muted-foreground text-xs mb-6 leading-relaxed">
              Enjoy peace of mind with our advanced security protocols. Your
              transactions are encrypted and protected against fraud.
            </p>

            {/* Shield with code background effect */}
            <div className="relative flex items-center justify-center h-40">
              {/* Background code matrix effect */}
              <div className="absolute inset-0 opacity-5 overflow-hidden text-[8px] text-green-500 font-mono leading-tight">
                <motion.div
                  animate={{ y: [0, -100] }}
                  transition={{
                    duration: 20,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                >
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div key={i}>
                      10110101 11001010 01010110 11010101 00110010 11010100
                      01011001 10011010
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Glowing shield with smoother animation */}
              <motion.div
                className="relative z-10"
                animate={{
                  scale: [1, 1.03, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full blur-2xl"
                  style={{ backgroundColor: "#115097" }}
                  animate={{
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
                <div className="relative glass-strong rounded-2xl p-6">
                  <Shield
                    className="w-20 h-20"
                    style={{ color: "#115097" }}
                    strokeWidth={1.5}
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="glass-card rounded-2xl p-6 hover:glass-strong transition-all duration-500 relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Vendor dashboard
            </h3>
            <p className="text-muted-foreground text-xs mb-6 leading-relaxed">
              Manage your payment operations with our comprehensive vendor
              dashboard. Track transactions, monitor performance, and access
              insights in real-time.
            </p>

            {/* Dashboard preview mockup */}
            <div className="relative h-40 rounded-xl overflow-hidden glass">
              {/* Dashboard header */}
              <div className="flex items-center justify-between p-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" style={{ color: "#115097" }} />
                  <span className="text-foreground text-xs font-medium">
                    Payment Dashboard
                  </span>
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
              </div>

              {/* Dashboard content */}
              <div className="p-3 space-y-2">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Revenue", value: "$24.5K", trend: "+12%" },
                    { label: "Orders", value: "1,429", trend: "+8%" },
                    { label: "Active", value: "856", trend: "+5%" },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      className="glass rounded-lg p-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                    >
                      <div className="text-[8px] text-muted-foreground mb-0.5">
                        {stat.label}
                      </div>
                      <div className="text-foreground text-xs font-bold">
                        {stat.value}
                      </div>
                      <div className="text-[8px]" style={{ color: "#10b981" }}>
                        {stat.trend}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Chart representation */}
                <motion.div
                  className="glass rounded-lg p-2 h-16 flex items-end gap-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                >
                  {[40, 65, 45, 80, 60, 85, 70, 95].map((height, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 rounded-sm"
                      style={{
                        backgroundColor: "#115097",
                        height: `${height}%`,
                      }}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: 1.2 + i * 0.05, duration: 0.3 }}
                    />
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
