import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { MarketplaceProvider } from './context/MarketplaceContext';

import { LandingPage } from './components/landing/LandingPage';

// Service Requester screens
import { RequesterOverview } from './components/dashboard/requester/RequesterOverview';
import { RequesterJobs } from './components/dashboard/requester/RequesterJobs';
import { RequesterNewJob } from './components/dashboard/requester/RequesterNewJob';
import { RequesterJobDetails } from './components/dashboard/requester/RequesterJobDetails';
import { RequesterResults } from './components/dashboard/requester/RequesterResults';
import { RequesterSettings } from './components/dashboard/requester/RequesterSettings';

// Service Provider screens
import { ProviderOverview } from './components/dashboard/provider/ProviderOverview';
import { ProviderNodes } from './components/dashboard/provider/ProviderNodes';
import { ProviderJobs } from './components/dashboard/provider/ProviderJobs';
import { ProviderNodeDetails } from './components/dashboard/provider/ProviderNodeDetails';
import { ProviderEarnings } from './components/dashboard/provider/ProviderEarnings';
import { ProviderSettings } from './components/dashboard/provider/ProviderSettings';

export function App() {
  return (
    <ThemeProvider>
      <MarketplaceProvider>
        <BrowserRouter>
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* 1. Service Requester Routes */}
            <Route path="/requester" element={<RequesterOverview />} />
            <Route path="/requester/jobs" element={<RequesterJobs />} />
            <Route path="/requester/new" element={<RequesterNewJob />} />
            <Route path="/requester/jobs/:id" element={<RequesterJobDetails />} />
            <Route path="/requester/results" element={<RequesterResults />} />
            <Route path="/requester/settings" element={<RequesterSettings />} />

            {/* 2. Service Provider Routes */}
            <Route path="/provider" element={<ProviderOverview />} />
            <Route path="/provider/nodes" element={<ProviderNodes />} />
            <Route path="/provider/jobs" element={<ProviderJobs />} />
            <Route path="/provider/nodes/:id" element={<ProviderNodeDetails />} />
            <Route path="/provider/earnings" element={<ProviderEarnings />} />
            <Route path="/provider/settings" element={<ProviderSettings />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </MarketplaceProvider>
    </ThemeProvider>
  );
}

export default App;
