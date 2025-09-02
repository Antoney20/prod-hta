import React from 'react';
import BenefitsForm from './form';
import Navbar from '../components/layouts/navbar';
import Footer from '../components/layouts/footer';
import Link from 'next/link';

function Page() {
  return (
   

<div className="flex flex-col min-h-screen">
  <Navbar />
  <section className="max-w-7xl mx-auto py-6 sm:py-8 mt-16 sm:mt-20 px-4 sm:px-6 lg:px-8">
    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black mb-4 sm:mb-6 text-center">
      INTERVENTIONS PROPOSAL
    </h2>
    <p className="font-medium text-base sm:text-lg lg:text-xl text-gray-800 mb-4 sm:mb-6 leading-relaxed">
      The relevant stakeholders including the Authority, policy makers, the academia, members of the public, health professional associations, civil society organizations involved in matters of health, the Kenya Medical Supplies Authority and the county governments may propose interventions for inclusion in the benefits packages under regulation.
    </p>
    <p className="font-medium text-base sm:text-lg lg:text-xl text-gray-800 mb-4 sm:mb-6 leading-relaxed">
      The proposals will be received by the BPTAP secretariat through various channels including direct requests by the Panel to key stakeholders; scheduled stakeholder meetings or forums; or digital platforms including{' '}
      <Link href="mailto:hbtap@uonbi.ac.ke" className="text-[#27aae1] hover:text-[#1e8a99] transition-colors underline">
        hbtap@uonbi.ac.ke
      </Link>
      {' '}or by filling the form below.
    </p>
  </section>
  <BenefitsForm />
  <Footer />
</div>
  );
}

export default Page;