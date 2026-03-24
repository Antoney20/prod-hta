import React from 'react';
import BenefitsForm from './form';
import Navbar from '../components/layouts/navbar';
import Footer from '../components/layouts/footer';
import Link from 'next/link';
import type { Metadata } from 'next';
import { MessageSquare, Users } from 'lucide-react';
import ScrollToForm from './scroll';

export const metadata: Metadata = {
  title: 'Interventions Proposal | Health Benefits Package',
  description: 'Submit proposals for interventions to be included in health benefits packages. Stakeholders including healthcare professionals, policy makers, and civil society organizations can contribute.',
  keywords: 'health interventions, benefits package, healthcare proposals, stakeholder engagement, health policy',
  metadataBase: new URL("https://bptap.health.go.ke/interventions-form"),
  openGraph: {
    title: 'Interventions Proposal | Health Benefits Package',
    description: 'Submit proposals for interventions to be included in health benefits packages.',
    type: 'website',
    url: 'https://bptap.health.go.ke/interventions-form',
  },
  robots: {
    index: true,
    follow: true,
  },
    verification: {
    google: "D0TeHRYuJqPMFxLbOlh6kR6MAkSElpgiXE6GOv_yARw",
  },
  category: "Healthcare",
};



export default function Page() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />


      <section className="bg-white">


        <div className="container mx-auto px-2  border-b border-gray-900  py-12 mt-8">
          <div className="max-w-5xl">
     

            <h1 className="text-3xl  font-extrabold text-gray-900 tracking-tight leading-tight mb-5">
              Interventions Proposal
            </h1>

            <p className="text-lg  text-gray-900 leading-relaxed">
              Submit your proposals for health interventions and contribute to strengthening
              healthcare systems in Kenya.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 py-12">
          <div className="grid md:grid-cols-2 border border-gray-200 divide-y md:divide-y-0 md:divide-x divide-gray-200">

            <div className="group bg-white p-8 flex flex-col gap-5 hover:bg-[#f8fcff] transition-colors duration-200 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#27aae1] -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />

              <div className="flex items-center justify-between">
                <span className="text-4xl font-black text-gray-100 select-none leading-none">01</span>
                <div className="w-10 h-10 flex items-center justify-center border border-gray-200 group-hover:border-[#27aae1] group-hover:bg-[#27aae1]/5 transition-colors duration-200">
                  <Users className="w-5 h-5 text-[#27aae1]" strokeWidth={1.75} />
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  Who Can Submit Proposals?
                </h2>
                <p className="text-lg  leading-relaxed">
                  The relevant stakeholders including the Authority, policy makers, the academia,
                  members of the public, health professional associations, civil society
                  organizations involved in matters of health, the Kenya Medical Supplies Authority
                  and the county governments may propose interventions for inclusion in the benefits
                  packages under regulation.
                </p>
              </div>
            </div>

            {/* How to submit */}
            <div className="group bg-white p-8 flex flex-col gap-5 hover:bg-[#f8fcff] transition-colors duration-200 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#27aae1] -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />

              <div className="flex items-center justify-between">
                <span className="text-4xl font-black text-gray-100 select-none leading-none">02</span>
                <div className="w-10 h-10 flex items-center justify-center border border-gray-200 group-hover:border-[#27aae1] group-hover:bg-[#27aae1]/5 transition-colors duration-200">
                  <MessageSquare className="w-5 h-5 text-[#27aae1]" strokeWidth={1.75} />
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  How to Submit Your Proposal
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  The proposals will be received by the BPTAP secretariat through various channels
                  including direct requests by the Panel to key stakeholders; scheduled stakeholder
                  meetings or forums; or digital platforms including{' '}
                  <Link
                    href="mailto:hbtap@uonbi.ac.ke"
                    className="text-[#27aae1] underline hover:text-[#1a8fc4] font-semibold transition-colors"
                  >
                    hbtap@uonbi.ac.ke
                  </Link>
                  {' '}or by filling the form below.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f8f9fa] border-b border-gray-200 flex-1">
         <ScrollToForm>
        <div className="container mx-auto px-4 sm:px-6 py-6">
          <div className="mb-10">
     
            <h2 className="text-xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
              Submit Your Proposal
            </h2>
            <p className="text-lg text-gray-600">
              Complete the form below to submit your intervention proposal.
            </p>
          </div>

          <div className="bg-white border border-gray-200 p-6 sm:p-10">
            <BenefitsForm />
          </div>
        </div>
        </ScrollToForm>
      </section>

      <Footer />
    </div>
  )
}