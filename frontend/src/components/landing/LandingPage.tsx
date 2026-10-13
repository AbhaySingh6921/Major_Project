import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../Navbar';
import { HeroSection } from '../HeroSection';
import { RoleSelection } from '../RoleSelection';
import { HowItWorks } from '../HowItWorks';
import { WhyDeCompute } from '../WhyDeCompute';
import { TechnicalCredibility } from '../TechnicalCredibility';
import { FAQSection } from '../FAQSection';
import { Footer } from '../Footer';
import { AuthModal } from '../AuthModal';
import { AdminWorkspaceModal } from '../AdminWorkspaceModal';
import { DocsModal } from '../DocsModal';
import { useMarketplace } from '../../context/MarketplaceContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { auth, backendOnline, loginAs, logout } = useMarketplace();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [roleIntent, setRoleIntent] = useState<'requester' | 'provider' | null>(null);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [docsModalOpen, setDocsModalOpen] = useState(false);

  const handleOpenAuth = (intent?: 'requester' | 'provider') => {
    setRoleIntent(intent || 'requester');
    setAuthModalOpen(true);
  };

  const handleSelectRole = (role: 'requester' | 'provider') => {
    if (auth.isAuthenticated && auth.role === role) {
      navigate(`/${role}`);
    } else {
      setRoleIntent(role);
      setAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = (newAuth: any) => {
    loginAs(newAuth.role, newAuth.walletAddress);
    if (newAuth.role === 'requester') {
      navigate('/requester');
    } else if (newAuth.role === 'provider') {
      navigate('/provider');
    } else if (newAuth.role === 'admin') {
      setAdminModalOpen(true);
    }
  };

  const handleOpenWorkspace = () => {
    if (auth.role === 'requester') navigate('/requester');
    else if (auth.role === 'provider') navigate('/provider');
    else if (auth.role === 'admin') setAdminModalOpen(true);
  };

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] text-[#18181B] dark:text-[#FAFAFA] flex flex-col font-sans transition-colors">
      {/* Navigation */}
      <Navbar
        auth={auth}
        onOpenAuth={handleOpenAuth}
        onOpenWorkspace={handleOpenWorkspace}
        onDisconnect={logout}
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

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultRoleIntent={roleIntent}
        onSuccess={handleAuthSuccess}
      />

      {/* Admin Operations Modal */}
      <AdminWorkspaceModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        auth={auth}
      />

      {/* Documentation Drawer */}
      <DocsModal
        isOpen={docsModalOpen}
        onClose={() => setDocsModalOpen(false)}
      />
    </div>
  );
};
