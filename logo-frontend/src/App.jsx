import { Navigate, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import MalzemeEkle from "./pages/MalzemeEkle";
import MaterialList from "./pages/MaterialList";
import PurchaseInvoiceForm from "./pages/PurchaseInvoiceForm";
import SalesInvoiceForm from "./pages/SalesInvoiceForm";
import ClientsPage from "./pages/ClientPage";
import Invoice from "./pages/Invoice";
import Collection from "./pages/Collection";
import CombinedInvoiceForm from "./pages/CombinedInvoiceForm";
import PurchaseInvoiceXmlImport from "./XML/PurchaseInvoiceXmlImport";
import { useAuthentication } from "../backend/store/useAuthentication";
import AuthPage from "./authentication/AuthPage";

function App() {
  const { isAuthenticated } = useAuthentication();

  return (
    <>
      <Routes>
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
            isAuthenticated ? (
              <PurchaseInvoiceXmlImport />
            ) : (
              <Navigate to={"/login"} />
            )
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
          element={isAuthenticated ? <Invoice /> : <Navigate to={"/login"} />}
        />
        <Route
          path="/tahsilatlar"
          element={
            isAuthenticated ? <Collection /> : <Navigate to={"/login"} />
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
