import { Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import MalzemeEkle from "./pages/MalzemeEkle";
import MaterialList from "./pages/MaterialList";
import PurchaseInvoiceForm from "./pages/PurchaseInvoiceForm";
import ClientsPage from "./pages/ClientPage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/malzeme-ekle" element={<MalzemeEkle />} />
        <Route path="/malzemeler" element={<MaterialList />} />
        <Route path="/alma-fatura-ekle" element={<PurchaseInvoiceForm />} />
        <Route path="/musteriler" element={<ClientsPage />} />
      </Routes>
    </>
  );
}

export default App;
