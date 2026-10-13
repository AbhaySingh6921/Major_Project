import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, ArrowRight, ArrowLeft, Check, AlertCircle, FileText, Lock, ShieldCheck, RefreshCw, Cpu } from 'lucide-react';
import { DashboardLayout } from '../shared/DashboardLayout';
import { useMarketplace } from '../../../context/MarketplaceContext';

export const RequesterNewJob: React.FC = () => {
  const navigate = useNavigate();
  const { auth, createNewJob } = useMarketplace();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [datasetName, setDatasetName] = useState('timeseries_telemetry_2026.csv');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [taskDescription, setTaskDescription] = useState('Compute linear regression weights & variance analysis per partition');
  const [deadlineHours, setDeadlineHours] = useState('24');
  const [reward, setReward] = useState('25');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation
  const handleNextFromUpload = () => {
    if (!datasetName.trim()) {
      setErrorMsg('Please specify a dataset name.');
      return;
    }
    setErrorMsg('');
    setCurrentStep(2);
  };

  const handleNextFromConfig = () => {
    setErrorMsg('');
    setCurrentStep(3);
  };

  const handleNextFromReward = () => {
    const num = Number(reward);
    if (!num || num <= 0) {
      setErrorMsg('Reward must be greater than 0.');
      return;
    }
    if (num % 5 !== 0) {
      setErrorMsg('Protocol Constraint: Escrow reward must be divisible by 5 (1 equal reward unit per sub-task chunk).');
      return;
    }
    setErrorMsg('');
    setCurrentStep(4);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const created = await createNewJob({
        datasetName: datasetName.trim(),
        totalReward: Number(reward),
        deadlineHours: Number(deadlineHours),
        file: selectedFile || undefined,
      });

      setIsSubmitting(false);
      navigate(`/requester/jobs/${created.id}`);
    } catch (e: any) {
      setIsSubmitting(false);
      setErrorMsg(e.message || 'Failed to submit workload to smart contract.');
    }
  };

  return (
    <DashboardLayout role="requester" title="New Compute Job" subtitle="Workload Wizard">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Wizard Steps Progress Indicator */}
        <div className="bg-white dark:bg-[#121215] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-4 sm:p-5 shadow-subtle">
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
            {[
              { step: 1, title: 'Upload Input' },
              { step: 2, title: 'Configure Task' },
              { step: 3, title: 'Set Escrow' },
              { step: 4, title: 'Review & Deploy' },
            ].map((s) => (
              <div
                key={s.step}
                className={`flex flex-col items-center gap-1.5 ${
                  currentStep === s.step
                    ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                    : currentStep > s.step
                    ? 'text-zinc-900 dark:text-zinc-200'
                    : 'text-zinc-400 dark:text-zinc-600'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    currentStep === s.step
                      ? 'bg-emerald-600 text-white'
                      : currentStep > s.step
                      ? 'bg-zinc-900 dark:bg-zinc-700 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {currentStep > s.step ? <Check className="w-3.5 h-3.5" /> : s.step}
                </div>
                <span className="hidden sm:inline text-[11px]">{s.title}</span>
              </div>
            ))}
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Wizard Step 1: Upload Input */}
        {currentStep === 1 && (
          <div className="bg-white dark:bg-[#121215] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-6 sm:p-8 shadow-subtle space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Step 1: Upload Workload Dataset
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Select a structured CSV dataset to be partitioned into 5 deterministic chunks for distributed processing.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Workload Dataset File (.csv)
              </label>
              <div className="border-2 border-dashed border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-8 text-center bg-[#FAFAFA] dark:bg-zinc-900/40 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors">
                <Upload className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
                <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Drag and drop your CSV file here, or click to browse
                </div>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mb-4 font-mono">
                  Supported formats: RFC 4180 CSV • Max 50 MB
                </p>
                <input
                  type="text"
                  value={datasetName}
                  onChange={(e) => setDatasetName(e.target.value)}
                  placeholder="dataset_filename.csv"
                  className="w-full max-w-sm px-3 py-2 text-xs font-mono rounded-lg border border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#18181B] text-zinc-800 dark:text-zinc-200 text-center focus:outline-none focus:border-zinc-900"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={handleNextFromUpload}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#18181B] dark:bg-white text-white dark:text-zinc-900 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-subtle"
              >
                <span>Continue to Configuration</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Wizard Step 2: Configure Task */}
        {currentStep === 2 && (
          <div className="bg-white dark:bg-[#121215] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-6 sm:p-8 shadow-subtle space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Step 2: Execution Configuration
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Configure containerized task parameters and the execution timeout deadline.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Task Execution Specification
                </label>
                <textarea
                  rows={3}
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#18181B] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Chunk Partition Count
                  </label>
                  <input
                    type="text"
                    disabled
                    value="5 sub-jobs (Deterministic Partition)"
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-[#E4E4E7] dark:border-[#27272A] bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                  />
                  <span className="text-[10px] text-zinc-400 font-mono mt-1 block">
                    Fixed protocol partition size for ComputeMarketplace
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Execution Deadline (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    value={deadlineHours}
                    onChange={(e) => setDeadlineHours(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#18181B] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-900"
                  />
                  <span className="text-[10px] text-zinc-400 font-mono mt-1 block">
                    Unclaimed chunks will be refunded after deadline
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#E4E4E7] dark:border-[#27272A] text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                onClick={handleNextFromConfig}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#18181B] dark:bg-white text-white dark:text-zinc-900 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-subtle"
              >
                <span>Continue to Escrow</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Wizard Step 3: Set Escrow */}
        {currentStep === 3 && (
          <div className="bg-white dark:bg-[#121215] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-6 sm:p-8 shadow-subtle space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Step 3: Escrow & Reward Deposit
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Deposit reward tokens in USDC. Tokens will be locked in ComputeMarketplace.sol until outputs are cryptographically verified.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Total Reward Escrow (USDC)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="5"
                    value={reward}
                    onChange={(e) => setReward(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm font-mono rounded-lg border border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#18181B] text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-zinc-400">
                    USDC
                  </span>
                </div>
              </div>

              {/* Reward Breakdown per Chunk */}
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-[#E4E4E7] dark:border-[#27272A] text-xs font-mono space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Reward Per SubJob Chunk:</span>
                  <span className="font-bold text-zinc-900 dark:text-white">
                    {Number(reward) ? Number(reward) / 5 : 0} USDC
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Platform Protocol Fee:</span>
                  <span className="text-zinc-900 dark:text-white">5% upon settlement</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500">Your Wallet Balance:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {auth.usdcBalance || 2450} USDC available
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#E4E4E7] dark:border-[#27272A] text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                onClick={handleNextFromReward}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#18181B] dark:bg-white text-white dark:text-zinc-900 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-subtle"
              >
                <span>Review & Deploy</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Wizard Step 4: Review & Deploy */}
        {currentStep === 4 && (
          <div className="bg-white dark:bg-[#121215] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-6 sm:p-8 shadow-subtle space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Step 4: Review Workload & Deploy
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Confirm job parameters before locking escrow and broadcasting subjob hashes.
              </p>
            </div>

            {/* Summary Card */}
            <div className="border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-5 bg-[#FAFAFA] dark:bg-zinc-900/40 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 font-mono">Dataset Name:</span>
                <span className="font-semibold text-zinc-900 dark:text-white">{datasetName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 font-mono">Total Chunks:</span>
                <span className="font-mono text-zinc-900 dark:text-white">5 independent subjobs</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 font-mono">Escrow Deposit:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{reward} USDC</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 font-mono">Execution Deadline:</span>
                <span className="font-mono text-zinc-900 dark:text-white">{deadlineHours} Hours</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-500 font-mono">Escrow Smart Contract:</span>
                <span className="font-mono text-[11px] text-zinc-600 dark:text-zinc-400">ComputeMarketplace.sol (0x5FbD...aa3)</span>
              </div>
            </div>

            {/* Smart contract security assurance */}
            <div className="flex items-center gap-3 p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-800 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5 flex-shrink-0 text-emerald-600" />
              <span>
                Funds will only be disbursed to provider nodes whose submitted output hashes cryptographically match expected SHA-256 hashes.
              </span>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={() => setCurrentStep(3)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#E4E4E7] dark:border-[#27272A] text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#18181B] dark:bg-white text-white dark:text-zinc-900 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-subtle"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-zinc-400" />
                    <span>Partitioning & Locking Escrow...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                    <span>Confirm & Deploy Workload</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};
