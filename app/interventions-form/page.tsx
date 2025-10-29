import React from 'react';
import BenefitsForm from './form';
import Navbar from '../components/layouts/navbar';
import Footer from '../components/layouts/footer';
import Link from 'next/link';
import type { Metadata } from 'next';

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

function Page() {
  return (
    <div className="flex flex-col min-h-screen ">
      <Navbar />
      
      <section className="relative bg-white  mt-12 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 -left-20 w-72 h-72 bg-[#27aae1] rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-20 -right-20 w-96 h-96 bg-[#f7931e] rounded-full opacity-15 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
            <div className="absolute top-0 left-1/4 w-2 h-2  rounded-full opacity-30"></div>
            <div className="absolute top-1/4 right-1/3 w-1 h-1  rounded-full opacity-40"></div>
            <div className="absolute bottom-1/3 left-1/2 w-2 h-2  rounded-full opacity-20"></div>
          </div>
        </div>
        
        <div className="relative max-w-6xl mx-auto py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
          {/* Hero Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl  font-bold text-black mb-6 tracking-tight">
              INTERVENTIONS PROPOSAL
            </h1>
        
            <p className="text-xl text-black max-w-3xl mx-auto leading-relaxed">
              Submit your proposals for health interventions and contribute to strengthening healthcare systems
            </p>
          </div>

          {/* Content Cards */}
          <div className="grid md:grid-cols-2 lg:gap-6 gap-2 mb-12">
            {/* Who Can Submit */}
            <div className="/10 backdrop-blur-sm rounded-2xl p-2 lg:p-8 border border-white/20 hover:/15 transition-all duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-[#27aae1] rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-black">Who Can Submit Proposals?</h3>
              </div>
              <p className="text-black leading-relaxed text-xl">
                The relevant stakeholders including the Authority, policy makers, the academia, members of the public, health professional associations, civil society organizations involved in matters of health, the Kenya Medical Supplies Authority and the county governments may propose interventions for inclusion in the benefits packages under regulation.
              </p>
            </div>

            {/* How to Submit */}
            <div className="/10 backdrop-blur-sm rounded-2xl lg:p-8 p-2 border border-white/20 hover:/15 transition-all duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-[#f7931e] rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-black">How to Submit Your Proposal</h3>
              </div>
              <p className="text-black leading-relaxed mb-4 text-xl">
                The proposals will be received by the BPTAP secretariat through various channels including direct requests by the Panel to key stakeholders; scheduled stakeholder meetings or forums; or digital platforms including{' '}
                <Link 
                  href="mailto:hbtap@uonbi.ac.ke" 
                  className="inline-flex items-center text-[#27aae1] hover:text-black transition-colors underline font-semibold"
                >
                  hbtap@uonbi.ac.ke
                 
                </Link>
                {' '}or by filling the form below.
              </p>
            </div>
          </div>
        </div>
      </section>


      <section className="container mx-auto -mt-20 p-0 xl:px-8  z-20">
        <div className=" rounded-2xl shadow-xl  p-2 xl:p-12">
          <div className="mb-10">
            <h2 className="text-3xl text-center font-bold text-gray-900 mb-3">Submit Your Proposal</h2>
            <p className="text-lg text-center text-gray-600">Complete the form below to submit your intervention proposal</p>
          </div>
          <BenefitsForm />
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Page;