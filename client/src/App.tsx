import { Router, Route } from "wouter";
import LandingPage from "./pages/landing";
import LoginPage from "./pages/login";
import SignupPage from "./pages/signup";
import HomePage from "./pages/home";
import ChatPage from "./pages/chat";
import ComplaintPage from "./pages/complaint";
import CommunityPage from "./pages/community";
import LegalLibraryPage from "./pages/legal-library";
import LawyerDashboardPage from "./pages/lawyer-dashboard";
import ProfilePage from "./pages/profile";
import NotFoundPage from "./pages/not-found";
import { Toaster } from "./components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Route path="/" component={LandingPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/signup" component={SignupPage} />
        <Route path="/home" component={HomePage} />
        <Route path="/chat" component={ChatPage} />
        <Route path="/complaint" component={ComplaintPage} />
        <Route path="/community" component={CommunityPage} />
        <Route path="/legal-library" component={LegalLibraryPage} />
        <Route path="/lawyer-dashboard" component={LawyerDashboardPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="*" component={NotFoundPage} />
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
