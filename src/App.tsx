import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import SubmitWork from './pages/SubmitWork';
import WorkDetail from './pages/WorkDetail';
import MyWorks from './pages/MyWorks';
import EditWork from './pages/EditWork';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/submit" element={<SubmitWork />} />
          <Route path="/work/:id" element={<WorkDetail />} />
          <Route path="/my-works" element={<MyWorks />} />
          <Route path="/edit/:id" element={<EditWork />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;