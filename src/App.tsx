import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CreditsProvider } from "@/hooks/useCredits";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Portfolio from "./pages/Portfolio";
import Project from "./pages/Project";
import Pricing from "./pages/Pricing";
import Dashboard from "./pages/Dashboard";
import VapiDemo from "./pages/VapiDemo";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CreditsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/project/:id" element={<Project />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/vapi-demo" element={<VapiDemo />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CreditsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
