import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

function AuthGate({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const { data: authStatus, isLoading } = useQuery<{ authenticated: boolean; user?: any }>({
    queryKey: ['/api/auth/check'],
    retry: false,
  });

  useEffect(() => {
    if (!isLoading && authStatus) {
      if (authStatus.authenticated && location === '/login') {
        navigate('/');
      } else if (!authStatus.authenticated && location !== '/login') {
        navigate('/login');
      }
    }
  }, [authStatus, isLoading, location, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <AuthGate>
            <Router />
          </AuthGate>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
