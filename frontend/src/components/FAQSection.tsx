import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export const FAQSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('faq-1');

  const faqs: FAQItem[] = [
    {
      id: 'faq-1',
      question: 'What is DeCompute?',
      answer:
        'DeCompute is a decentralized compute marketplace connecting workload demand with distributed compute capacity. It coordinates the partitioning, assignment, execution, and cryptographic verification of computing jobs via Ethereum smart contracts.',
    },
    {
      id: 'faq-2',
      question: 'Who can request computing resources?',
      answer:
        'Any user or developer with a Web3 wallet can connect to the requester portal, upload a supported CSV dataset, define execution parameters and escrow rewards, and track completion through their requester workspace.',
    },
    {
      id: 'faq-3',
      question: 'How can I become a provider?',
      answer:
        'Providers register their wallet address on the ProviderRegistry smart contract and deposit collateral staking tokens. Once registered, providers run the worker client daemon to fetch open subjobs, compute outputs, and submit verified results.',
    },
    {
      id: 'faq-4',
      question: 'What types of workloads are supported?',
      answer:
        'The platform currently processes structured CSV datasets partitioned deterministically into 5 chunks. Provider worker daemons execute task logic in containerized runner environments and produce verifiable structured output files.',
    },
    {
      id: 'faq-5',
      question: 'How are execution status and results verified?',
      answer:
        'Each subjob computes an output hash that is evaluated against the expected SHA-256 output hash. Only subjobs where the returned output hash matches the expected hash are marked as VERIFIED and eligible for escrow disbursement.',
    },
    {
      id: 'faq-6',
      question: 'How do payments or rewards work?',
      answer:
        'Requesters deposit reward tokens (ERC-20 USDC) into the ComputeMarketplace escrow upon job submission. After verification of subjobs, rewards are disbursed to completing providers, minus a 5% protocol fee.',
    },
  ];

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-20 bg-white border-t border-[#E4E4E7]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-14">
          <div className="text-xs font-mono font-medium text-emerald-700 uppercase tracking-wider mb-2">
            Questions & Answers
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#18181B] mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-base text-[#71717A]">
            Direct answers on protocol architecture, verification mechanisms, and role participation.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="border border-[#E4E4E7] rounded-xl overflow-hidden transition-colors bg-[#FAFAFA]"
              >
                <button
                  type="button"
                  id={`btn-${faq.id}`}
                  aria-expanded={isOpen}
                  aria-controls={`content-${faq.id}`}
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full py-4 px-6 text-left flex items-center justify-between gap-4 font-medium text-[#18181B] hover:text-black transition-colors focus:outline-none"
                >
                  <span className="text-base font-semibold">{faq.question}</span>
                  <div className={`w-7 h-7 rounded-full bg-white border border-[#E4E4E7] flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 bg-zinc-100' : ''}`}>
                    <ChevronDown className="w-4 h-4 text-zinc-600" />
                  </div>
                </button>

                {isOpen && (
                  <div
                    id={`content-${faq.id}`}
                    role="region"
                    aria-labelledby={`btn-${faq.id}`}
                    className="px-6 pb-5 pt-1 text-sm text-[#71717A] leading-relaxed border-t border-zinc-100"
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
