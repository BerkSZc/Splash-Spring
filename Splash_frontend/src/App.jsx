import { Navigate, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/home/HomePage";
import MaterialPage from "./pages/material/MaterialPage";

import ClientsPage from "./pages/client/ClientsPage";
import InvoicePage from "./pages/invoice/InvoicePage";
import CollectionPage from "./pages/collection/CollectionPage";
import InvoiceForm from "./pages/invoice-process/InvoiceForm";
import { useAuthentication } from "../backend/store/useAuthentication";
import AuthPage from "./pages/auth/AuthPage";
import XmlPage from "./pages/xml/XmlPage";
import CompanyPage from "./pages/company/CompanyPage";
import PayrollPage from "./pages/payroll/PayrollPage";
import { useEffect } from "react";
import AuthLoading from "./components/AuthLoading";
import ReportsPage from "./pages/report/ReportsPage";

function App() {
  const { isAuthenticated, authControl, authChecked } = useAuthentication();

  useEffect(() => {
    authControl();
  }, []);

  if (!authChecked) {
    return <AuthLoading />;
  }

  return (
    <>
      <Routes>
        <Route path="/devir" element={<CompanyPage />} />

        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to={"/home"} /> : <AuthPage />}
        />
        <Route
          path="/home"
          element={isAuthenticated ? <HomePage /> : <Navigate to={"/login"} />}
        />
        <Route
          path="/malzeme-ekle"
          element={
            isAuthenticated ? <MaterialPage /> : <Navigate to={"/login"} />
          }
        />

        <Route
          path="/ekleme"
          element={isAuthenticated ? <XmlPage /> : <Navigate to={"/login"} />}
        />
        <Route
          path="/musteriler"
          element={
            isAuthenticated ? <ClientsPage /> : <Navigate to={"/login"} />
          }
        />

        <Route
          path="/payroll"
          element={
            isAuthenticated ? <PayrollPage /> : <Navigate to={"/login"} />
          }
        />
        <Route
          path="/"
          element={isAuthenticated ? <HomePage /> : <Navigate to={"/login"} />}
        />
        <Route
          path="/faturalar"
          element={
            isAuthenticated ? <InvoicePage /> : <Navigate to={"/login"} />
          }
        />
        <Route
          path="/tahsilatlar"
          element={
            isAuthenticated ? <CollectionPage /> : <Navigate to={"/login"} />
          }
        />
        <Route
          path="/faturalar-islemleri"
          element={
            isAuthenticated ? <InvoiceForm /> : <Navigate to={"/login"} />
          }
        />
        <Route
          path="/raporlar"
          element={
            isAuthenticated ? <ReportsPage /> : <Navigate to={"/login"} />
          }
        />
      </Routes>
    </>
  );
}

export default App;
