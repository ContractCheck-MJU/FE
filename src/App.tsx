import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider.tsx";
import { Layout, RequireAuth } from "./components/Layout.tsx";
import { BillingFailPage, BillingPage, BillingSuccessPage } from "./pages/BillingPage.tsx";
import { ContractListPage } from "./pages/ContractListPage.tsx";
import { ContractPage } from "./pages/ContractPage.tsx";
import { LandingPage } from "./pages/LandingPage.tsx";
import { LedgerPage } from "./pages/LedgerPage.tsx";
import { LoginPage } from "./pages/LoginPage.tsx";
import { MilestonesPage } from "./pages/MilestonesPage.tsx";
import { MyPage } from "./pages/MyPage.tsx";
import { NotificationsPage } from "./pages/NotificationsPage.tsx";
import { UploadPage } from "./pages/UploadPage.tsx";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route element={<RequireAuth />}>
                <Route path="/contracts" element={<ContractListPage />} />
                <Route path="/contracts/new" element={<UploadPage />} />
                <Route path="/contracts/:id" element={<ContractPage />} />
                <Route path="/milestones" element={<MilestonesPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/billing" element={<BillingPage />} />
                <Route path="/billing/success" element={<BillingSuccessPage />} />
                <Route path="/billing/fail" element={<BillingFailPage />} />
                <Route path="/credits" element={<LedgerPage />} />
                <Route path="/me" element={<MyPage />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
