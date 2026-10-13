import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, Plus, Activity, Cpu, HardDrive, ShieldCheck, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { DashboardLayout } from '../shared/DashboardLayout';
import { StatusBadge } from '../shared/StatusBadge';
import { useMarketplace } from '../../../context/MarketplaceContext';

export const ProviderNodes: React.FC = () => {
  const navigate = useNavigate();
  const { nodes, registerNode } = useMarketplace();

  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [nodeName, setNodeName] = useState('Delta-Worker-AP');
  const [cpu, setCpu] = useState('16 vCPU (AMD Ryzen 9)');
  const [memory, setMemory] = useState('64 GB DDR5');
  const [gpu, setGpu] = useState('NVIDIA RTX 4080 16GB');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerNode({
      name: nodeName,
      cpu,
      memory,
      gpu,
    });
    setRegisterModalOpen(false);
  };

  return (
    <DashboardLayout role="provider" title="Compute Nodes" subtitle="Hardware Fleet">
      <div className="space-y-6">
        
        {/* Top Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
              Registered Provider Hardware
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Hardware instances running worker daemons authenticated by ProviderRegistry.sol
            </p>
          </div>

          <button
            onClick={() => setRegisterModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#18181B] dark:bg-white text-white dark:text-zinc-900 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-subtle flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register New Node</span>
          </button>
        </div>

        {/* Nodes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nodes.map((node) => (
            <div
              key={node.id}
              onClick={() => navigate(`/provider/nodes/${node.id}`)}
              className="bg-white dark:bg-[#121215] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-6 shadow-subtle hover:border-zinc-400 dark:hover:border-zinc-600 cursor-pointer transition-all flex flex-col justify-between space-y-5"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-800 dark:text-zinc-200">
                      <Server className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">
                        {node.name}
                      </h4>
                      <span className="text-[11px] font-mono text-zinc-400">
                        {node.id}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={node.health} size="sm" />
                </div>

                {/* Specs List */}
                <div className="space-y-2 text-xs font-mono text-zinc-600 dark:text-zinc-400 bg-[#FAFAFA] dark:bg-zinc-900/60 p-3.5 rounded-lg border border-zinc-100 dark:border-zinc-800">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">CPU:</span>
                    <span className="text-zinc-900 dark:text-zinc-200 font-medium truncate max-w-[180px]">{node.cpu}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">RAM:</span>
                    <span className="text-zinc-900 dark:text-zinc-200 font-medium">{node.memory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">GPU:</span>
                    <span className="text-zinc-900 dark:text-zinc-200 font-medium truncate max-w-[180px]">{node.gpu}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-zinc-200 dark:border-zinc-800">
                    <span className="text-zinc-400">Uptime:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{node.availability}% ({node.uptimeHours || 300} hrs)</span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-zinc-400">
                  Heartbeat: {node.lastHeartbeat}
                </span>
                <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1 hover:underline">
                  <span>Diagnostics</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Register Node Modal */}
        {registerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="relative w-full max-w-md bg-white dark:bg-[#121215] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-6 shadow-dropdown space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E4E4E7] dark:border-[#27272A]">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                  Register Compute Node
                </h3>
                <button
                  onClick={() => setRegisterModalOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRegister} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Node Identifier Name
                  </label>
                  <input
                    type="text"
                    required
                    value={nodeName}
                    onChange={(e) => setNodeName(e.target.value)}
                    className="w-full px-3 py-2 font-mono rounded-lg border border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#18181B] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    CPU Hardware Specification
                  </label>
                  <input
                    type="text"
                    required
                    value={cpu}
                    onChange={(e) => setCpu(e.target.value)}
                    className="w-full px-3 py-2 font-mono rounded-lg border border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#18181B] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    System Memory (RAM)
                  </label>
                  <input
                    type="text"
                    required
                    value={memory}
                    onChange={(e) => setMemory(e.target.value)}
                    className="w-full px-3 py-2 font-mono rounded-lg border border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#18181B] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    GPU Accelerator (Optional)
                  </label>
                  <input
                    type="text"
                    value={gpu}
                    onChange={(e) => setGpu(e.target.value)}
                    className="w-full px-3 py-2 font-mono rounded-lg border border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#18181B] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-900"
                  />
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setRegisterModalOpen(false)}
                    className="px-3.5 py-2 rounded-lg border border-[#E4E4E7] dark:border-[#27272A] text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#18181B] dark:bg-white text-white dark:text-zinc-900 font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-subtle"
                  >
                    Register Node
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};
