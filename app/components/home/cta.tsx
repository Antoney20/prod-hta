import Link from 'next/link'
import { Mail, ArrowRight } from 'lucide-react'

export default function ContactSection() {
  return (
    <section className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-6 py-16">

        {/* ── Header ── */}
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-[#27aae1]" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#27aae1]">
              Contact
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
            Get in <span className="text-[#27aae1]">Touch</span>
          </h2>
          <p className="text-base text-gray-600 leading-relaxed">
            The Benefits Package and Tariffs Advisory Panel is committed to promoting transparent
            and evidence-informed approaches to healthcare decision-making in Kenya. We welcome
            inquiries from stakeholders.
          </p>
        </div>

        {/* ── Action cards ── */}
        <div className="grid md:grid-cols-2 border border-gray-200 divide-y md:divide-y-0 md:divide-x divide-gray-200">

          {/* General inquiries */}
          <div className="group bg-white p-8 flex flex-col gap-5 hover:bg-[#f8fcff] transition-colors duration-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#27aae1] -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />

            <div className="flex items-center justify-between">
              <span className="text-4xl font-black text-gray-100 select-none leading-none">01</span>
              <div className="w-10 h-10 flex items-center justify-center border border-gray-200 group-hover:border-[#27aae1] group-hover:bg-[#27aae1]/5 transition-colors duration-200">
                <Mail className="w-5 h-5 text-[#27aae1]" strokeWidth={1.75} />
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900 mb-2">General Inquiries</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                <Link href="/contact" className="font-semibold text-[#27aae1] hover:text-[#1a8fc4] transition-colors">
                  Contact us
                </Link>
                {' '}for general inquiries. To propose interventions,{' '}
                <Link href="/interventions-form" className="font-semibold text-[#27aae1] hover:text-[#1a8fc4] transition-colors">
                  fill this form.
                </Link>
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-[#27aae1] hover:bg-[#1a8fc4] text-white text-xs font-bold px-5 py-2.5 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#27aae1] focus-visible:ring-offset-2"
              >
                Get in Touch
                <Mail className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Submit proposal */}
          <div className="group bg-white p-8 flex flex-col gap-5 hover:bg-[#f8fcff] transition-colors duration-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#27aae1] -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />

            <div className="flex items-center justify-between">
              <span className="text-4xl font-black text-gray-100 select-none leading-none">02</span>
              <div className="w-10 h-10 flex items-center justify-center border border-gray-200 group-hover:border-[#27aae1] group-hover:bg-[#27aae1]/5 transition-colors duration-200">
                <ArrowRight className="w-5 h-5 text-[#27aae1]" strokeWidth={1.75} />
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Submit a Proposal</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                Ready to propose an intervention for inclusion in Kenya's health benefits package?
                Submit your proposal through our dedicated form and contribute to evidence-based
                healthcare decision-making.
              </p>
              <Link
                href="/interventions-form"
                className="inline-flex items-center gap-2 border-2 border-gray-900 text-gray-900 text-xs font-bold px-5 py-2.5 hover:bg-gray-900 hover:text-white transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
              >
                Submit Proposal
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}