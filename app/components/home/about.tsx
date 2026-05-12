'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, ShieldCheck, Banknote, Users } from 'lucide-react'

const pillars = [
  {
    icon: ShieldCheck,
    color: '#27aae1',
    label: '01',
    title: 'Evidence-Based Decision Making',
    body: 'We ensure healthcare decisions are based on solid scientific evidence, maximizing benefits while minimizing risks and costs.',
  },
  {
    icon: Banknote,
    color: '#138788',
    label: '02',
    title: 'Sustainable Healthcare Financing',
    body: 'We develop fair pricing strategies that balance quality healthcare delivery with financial sustainability for the SHA program.',
  },
  {
    icon: Users,
    color: '#27aae1',
    label: '03',
    title: 'Universal Health Coverage',
    body: 'Our work directly contributes to advancing Universal Health Coverage by ensuring appropriate healthcare technologies are accessible to all.',
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function AboutSection() {
  return (
    <section className="bg-white ">
      {/* ── Section header band ── */}
      <div className="">
        <div className="container mx-auto  py-10 border-b border-gray-200">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6"
          >
            <div className="max-w-3xl">
              {/* Eyebrow */}
              <motion.div variants={itemVariants} className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-[#27aae1]" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#27aae1]">
                  Why BPTAP Matters
                </span>
              </motion.div>

              <motion.h2
                variants={itemVariants}
                className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight"
              >
                Why{' '}
                <span className="text-[#27aae1]">The Benefits Package and Tariffs Advisory Panel</span>{' '}
                Matters
              </motion.h2>

              <motion.p
                variants={itemVariants}
                className="mt-4 text-xl  leading-relaxed"
              >
                The Benefits Package and Tariffs Advisory Panel is committed to promoting
                transparent, evidence-informed approaches to healthcare decision-making in Kenya.
              </motion.p>
            </div>

            {/* CTA */}
            <motion.div variants={itemVariants} className="flex-shrink-0">
              <Link
                href="/about-us"
                className="inline-flex items-center gap-2 border-2 border-gray-900 text-gray-900 text-sm font-bold px-6 py-3 hover:bg-gray-900 hover:text-white transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
              >
                About Us
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-200 border border-gray-200"
        >
          {pillars.map((pillar) => {
            const Icon = pillar.icon
            return (
              <motion.div
                key={pillar.label}
                variants={itemVariants}
                className="group relative bg-white p-8 flex flex-col gap-5 hover:bg-[#f8fcff] transition-colors duration-200"
              >
                {/* Top accent line that reveals on hover */}
                <div
                  className="absolute top-0 left-0 right-0 h-0.5 bg-[#27aae1] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                />

                {/* Number + icon row */}
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-black text-gray-400 select-none leading-none">
                    {pillar.label}
                  </span>
                  <div
                    className="w-10 h-10 flex items-center justify-center border border-gray-200 group-hover:border-[#27aae1] group-hover:bg-[#27aae1]/5 transition-colors duration-200"
                  >
                    <Icon className="w-5 h-5 text-[#27aae1]" strokeWidth={1.75} />
                  </div>
                </div>

                {/* Text */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 ">
                    {pillar.title}
                  </h3>
                  <p className=" text-xl leading-relaxed">
                    {pillar.body}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-8 pt-6 border-t border-gray-200 flex flex-wrap items-center gap-x-8 gap-y-3"
        >
          {[
            { label: 'Gazetted', value: 'February 2025' },
            { label: 'Domiciled at', value: 'University of Nairobi' },
            { label: 'Mandate', value: 'Ministry of Health, Kenya' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                {item.label}
              </span>
              <span className="text-xs font-semibold text-gray-700">{item.value}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}