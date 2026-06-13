import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Layout } from "@/components/layout/Layout";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import Browse from "@/pages/Browse";
import BookDetail from "@/pages/BookDetail";
import ChapterReader from "@/pages/ChapterReader";
import AuthorProfile from "@/pages/AuthorProfile";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import WriteDashboard from "@/pages/WriteDashboard";
import BookEditor from "@/pages/BookEditor";
import Library from "@/pages/Library";
import Premium from "@/pages/Premium";
import Admin from "@/pages/Admin";
import Settings from "@/pages/Settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/browse" component={Browse} />
        <Route path="/book/:id">{(params) => <BookDetail />}</Route>
        <Route path="/book/:id/chapter/:chapterId">{(params) => <ChapterReader />}</Route>
        <Route path="/author/:id">{(params) => <AuthorProfile />}</Route>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/write" component={WriteDashboard} />
        <Route path="/write/book/:id">{(params) => <BookEditor />}</Route>
        <Route path="/library" component={Library} />
        <Route path="/premium" component={Premium} />
        <Route path="/admin" component={Admin} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
