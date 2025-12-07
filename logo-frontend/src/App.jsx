import { Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import MalzemeEkle from "./pages/MalzemeEkle";
import MaterialList from "./pages/MaterialList";
import PurchaseInvoiceForm from "./pages/PurchaseInvoiceForm";
import SalesInvoiceForm from "./pages/SalesInvoiceForm";
import ClientsPage from "./pages/ClientPage";
import Invoice from "./pages/Invoice";
import Collection from "./pages/Collection";
import CombinedInvoiceForm from "./pages/CombinedInvoiceForm";

function App() {
  return (
    <>
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/malzeme-ekle" element={<MalzemeEkle />} />
        <Route path="/malzemeler" element={<MaterialList />} />

        {/* <Route path="/alma-fatura-ekle" element={<PurchaseInvoiceForm />} />
        <Route path="/satis-fatura-ekle" element={<SalesInvoiceForm />} /> */}

        <Route path="/musteriler" element={<ClientsPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/faturalar" element={<Invoice />} />
        <Route path="/tahsilatlar" element={<Collection />} />
        <Route path="/faturalar-islemleri" element={<CombinedInvoiceForm />} />
      </Routes>
    </>
  );
}

export default App;
