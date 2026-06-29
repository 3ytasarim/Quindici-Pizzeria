import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Speisekarte from "@/pages/Speisekarte";
import Kontakt from "@/pages/Kontakt";
import UeberUns from "@/pages/UeberUns";
import Admin from "@/pages/Admin";
import TischReservieren from "@/pages/TischReservieren";
import Datenschutz from "@/pages/Datenschutz";
import Impressum from "@/pages/Impressum";
import { ReservationModalProvider } from "@/components/ReservationModal";
import SeoManager from "@/components/SeoManager";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/speisekarte" component={Speisekarte} />
      <Route path="/kontakt" component={Kontakt} />
      <Route path="/ueber-uns" component={UeberUns} />
      <Route path="/admin" component={Admin} />
      <Route path="/tisch-reservieren" component={TischReservieren} />
      <Route path="/datenschutz" component={Datenschutz} />
      <Route path="/impressum" component={Impressum} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ReservationModalProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <SeoManager />
            <Router />
          </WouterRouter>
          <Toaster />
        </ReservationModalProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
