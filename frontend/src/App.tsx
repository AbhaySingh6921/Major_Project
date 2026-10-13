import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { RoleSelection } from './components/RoleSelection';
import { HowItWorks } from './components/HowItWorks';
import { WhyDeCompute } from './components/WhyDeCompute';
import { TechnicalCredibility } from './components/TechnicalCredibility';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { RequesterWorkspaceModal } from './components/RequesterWorkspaceModal';
import { ProviderWorkspaceModal } from './components/ProviderWorkspaceModal';
import { AdminWorkspaceModal } from './components/AdminWorkspaceModal';
import { DocsModal } from './components/DocsModal';
import { AuthState } from './types';

export function App() {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    walletAddress: null,
    role: null,
    usdcBalance: 0,
    stakedAmount: 0,
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [roleIntent, setRoleIntent] = useState<'requester' | 'provider' | null>(null);

  const [requesterModalOpen, setRequesterModalOpen] = useState(false);
  const [providerModalOpen, setProviderModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [docsModalOpen, setDocsModalOpen] = useState(false);

  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  // Check if local backend API server is accessible on :5000
  useEffect(() => {
    fetch('/api/providers/subjobs/open')
      .then((res) => {
        if (res.ok) setBackendOnline(true);
        else setBackendOnline(false);
      })
      .catch(() => {
        setBackendOnline(false);
      });
  }, []);

  const handleOpenAuth = (intent?: 'requester' | 'provider') => {
    setRoleIntent(intent || 'requester');
    setAuthModalOpen(true);
  };

  const handleSelectRole = (role: 'requester' | 'provider') => {
    if (auth.isAuthenticated && auth.role === role) {
      if (role === 'requester') setRequesterModalOpen(true);
      if (role === 'provider') setProviderModalOpen(true);
    } else {
      setRoleIntent(role);
      setAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = (newAuth: AuthState) => {
    setAuth(newAuth);
    // Directly guide user into their intended role workspace
    if (newAuth.role === 'requester') {
      setRequesterModalOpen(true);
    } else if (newAuth.role === 'provider') {
      setProviderModalOpen(true);
    } else if (newAuth.role === 'admin') {
      setAdminModalOpen(true);
    }
  };

  const handleOpenWorkspace = () => {
    if (auth.role === 'requester') setRequesterModalOpen(true);
    else if (auth.role === 'provider') setProviderModalOpen(true);
    else if (auth.role === 'admin') setAdminModalOpen(true);
  };

  const handleDisconnect = () => {
    setAuth({
      isAuthenticated: false,
      walletAddress: null,
      role: null,
      usdcBalance: 0,
      stakedAmount: 0,
    });
  };

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#18181B] flex flex-col font-sans">
      {/* Navigation */}
      <Navbar
        auth={auth}
        onOpenAuth={handleOpenAuth}
        onOpenWorkspace={handleOpenWorkspace}
        onDisconnect={handleDisconnect}
        onOpenDocs={() => setDocsModalOpen(true)}
      />

      {/* Main Page Sections */}
      <main className="flex-1">
        <HeroSection
          onGetStarted={() => handleOpenAuth('requester')}
          onExploreHowItWorks={scrollToHowItWorks}
        />

        <RoleSelection
          auth={auth}
          onSelectRole={handleSelectRole}
        />

        <HowItWorks />

        <WhyDeCompute />

        <TechnicalCredibility />

        <FAQSection />
      </main>

      {/* Footer */}
      <Footer
        onOpenRequester={() => handleSelectRole('requester')}
        onOpenProvider={() => handleSelectRole('provider')}
        onOpenAdmin={() => setAdminModalOpen(true)}
        onOpenDocs={() => setDocsModalOpen(true)}
        backendOnline={backendOnline}
      />

      {/* Modals & Workspaces */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultRoleIntent={roleIntent}
        onSuccess={handleAuthSuccess}
      />

      <RequesterWorkspaceModal
        isOpen={requesterModalOpen}
        onClose={() => setRequesterModalOpen(false)}
        auth={auth}
        backendOnline={backendOnline}
      />

      <ProviderWorkspaceModal
        isOpen={providerModalOpen}
        onClose={() => setProviderModalOpen(false)}
        auth={auth}
        backendOnline={backendOnline}
      />

      <AdminWorkspaceModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        auth={auth}
      />

      <DocsModal
        isOpen={docsModalOpen}
        onClose={() => setDocsModalOpen(false)}
      />
    </div>
  );
}

export default App;
