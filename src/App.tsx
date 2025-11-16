import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LocalLibrary } from "./pages/LocalLibrary";
import { LocalWatch } from "./pages/LocalWatch";
import { LocalEmbed } from "./pages/LocalEmbed";
import { BulkEmbedCodes } from "./pages/BulkEmbedCodes";
import { Settings } from "./pages/Settings";
import { Folders } from "./pages/Folders";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LocalLibrary />} />
          <Route path="/watch/:id" element={<LocalWatch />} />
          <Route path="/embed/:id" element={<LocalEmbed />} />
          <Route path="/embed-codes" element={<BulkEmbedCodes />} />
          <Route path="/folders" element={<Folders />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
