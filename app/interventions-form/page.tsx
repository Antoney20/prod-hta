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

const CONTAINER = "mx-auto w-full container px-4 sm:px-6 lg:px-8";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      {/* Hero */}
      <section className="border-b border-gray-200 bg-white">
        <div className={`${CONTAINER} py-10 mt-8 sm:py-14`}>
          <div className="max-w-3xl">
     

            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-4xl">
              Interventions Proposal
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg">
              Submit your proposals for health interventions and contribute to strengthening
              healthcare systems in Kenya.
            </p>
          </div>
        </div>
      </section>

      {/* Info cards */}
      <section className="border-b border-gray-200 bg-white">
        <div className={`${CONTAINER} py-10 sm:py-14`}>
          <div className="grid border border-gray-200 sm:grid-cols-2 divide-y divide-gray-200 sm:divide-x sm:divide-y-0">
            {[
              {
                no: '01',
                Icon: Users,
                title: 'Who Can Submit Proposals?',
                body: (
                  <>
                    The relevant stakeholders including the Authority, policy makers, the academia,
                    members of the public, health professional associations, civil society
                    organizations involved in matters of health, the Kenya Medical Supplies Authority
                    and the county governments may propose interventions for inclusion in the benefits
                    packages under regulation.
                  </>
                ),
              },
              {
                no: '02',
                Icon: MessageSquare,
                title: 'How to Submit Your Proposal',
                body: (
                  <>
                    The proposals will be received by the BPTAP secretariat through various channels
                    including direct requests by the Panel to key stakeholders; scheduled stakeholder
                    meetings or forums; or digital platforms including{' '}
                    <Link
                      href="mailto:hbtap@uonbi.ac.ke"
                      className="font-semibold text-[#27aae1] underline underline-offset-2 transition-colors hover:text-[#1a8fc4]"
                    >
                      hbtap@uonbi.ac.ke
                    </Link>
                    {' '}or by filling the form below.
                  </>
                ),
              },
            ].map(({ no, Icon, title, body }) => (
              <article
                key={no}
                className="group relative flex flex-col gap-5 overflow-hidden bg-white p-6 transition-colors duration-200 hover:bg-[#f8fcff] sm:p-8"
              >
                <span className="absolute left-0 right-0 top-0 h-0.5 -translate-x-full bg-[#27aae1] transition-transform duration-300 group-hover:translate-x-0" />

                <div className="flex items-center justify-between">
                  <span className="select-none text-4xl font-black leading-none text-gray-100">{no}</span>
                  <span className="flex h-10 w-10 items-center justify-center border border-gray-200 transition-colors duration-200 group-hover:border-[#27aae1] group-hover:bg-[#27aae1]/5">
                    <Icon className="h-5 w-5 text-[#27aae1]" strokeWidth={1.75} />
                  </span>
                </div>

                <div>
                  <h2 className="mb-2 text-lg font-bold text-gray-900 sm:text-xl">{title}</h2>
                  <p className="text-sm leading-relaxed text-gray-600 sm:text-base">{body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="flex-1 border-b border-gray-200 ">
        <ScrollToForm>
          <div className={`${CONTAINER} py-10 sm:py-14`}>


            {/* wrapper padding tightened on mobile so the form isn't double-boxed */}
            <div className="">
              <BenefitsForm />
            </div>
          </div>
        </ScrollToForm>
      </section>

      <Footer />
    </div>
  );
}