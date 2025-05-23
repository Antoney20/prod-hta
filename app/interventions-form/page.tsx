import React from 'react';
import BenefitsForm from './form';
import Navbar from '../components/layouts/navbar';
import Footer from '../components/layouts/footer';

function Page() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <section className="max-w-6xl mx-auto py-8 mt-20 px-4 ">
        <h2 className="text-2xl font-bold text-black mb-4 text-center">INTERVENTION PROPOSAL</h2>
        <p className="font-medium text-lg text-gray-800 mb-4">
          The relevant stakeholders including the Authority, policy makers, the academia, members of the public, health professional associations, civil society organizations involved in matters of health, the Kenya Medical Supplies Authority and the county governments may propose interventions for inclusion in the benefits packages under regulation.
        </p>
        <p className="font-medium text-md text-gray-800 mb-4">
          The proposals will be received by the HBTAP secretariat through various channels including direct requests by the Panel to key stakeholders; scheduled stakeholder meetings or forums; or digital platforms including hbtap@uonbi.ac.ke or by filling the form below.
        </p>
      </section>
      <BenefitsForm />
      <Footer />
    </div>
  );
}

export default Page;