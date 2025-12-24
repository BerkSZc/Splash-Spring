import { Navigate, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import MalzemeEkle from "./pages/MalzemeEkle";
import MaterialList from "./pages/MaterialList";
import PurchaseInvoiceForm from "./pages/PurchaseInvoiceForm";
import SalesInvoiceForm from "./pages/SalesInvoiceForm";
import ClientsPage from "./pages/ClientPage";
import InvoicePage from "./pages/InvoicePage";
import CollectionPage from "./pages/CollectionPage";
import CombinedInvoiceForm from "./pages/CombinedInvoiceForm";
import { useAuthentication } from "../backend/store/useAuthentication";
import AuthPage from "./authentication/AuthPage";
import XmlImportPage from "./pages/XmlImportPage";
import TransferOperationPage from "./pages/TransferOperationPage";

function App() {
  const { isAuthenticated } = useAuthentication();

  return (
    <>
      <Routes>
        <Route
          path="/devir"
          element={
            !isAuthenticated ? (
              <Navigate to={"/home"} />
            ) : (
              <TransferOperationPage />
            )
          }
        />

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
            isAuthenticated ? <MalzemeEkle /> : <Navigate to={"/login"} />
          }
        />
        <Route path="/malzemeler" element={<MaterialList />} />

        {/* <Route path="/alma-fatura-ekle" element={<PurchaseInvoiceForm />} />
        <Route path="/satis-fatura-ekle" element={<SalesInvoiceForm />} /> */}

        <Route
          path="/ekleme"
          element={
            isAuthenticated ? <XmlImportPage /> : <Navigate to={"/login"} />
          }
        />
        <Route
          path="/musteriler"
          element={
            isAuthenticated ? <ClientsPage /> : <Navigate to={"/login"} />
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
            isAuthenticated ? (
              <CombinedInvoiceForm />
            ) : (
              <Navigate to={"/login"} />
            )
          }
        />
      </Routes>
    </>
  );
}

export default App;
