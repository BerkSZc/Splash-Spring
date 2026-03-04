import Sidebar from "./Sidebar.jsx";

const MainLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[#0a0f1a] text-white">
      {/* Sidebar sabit durur */}
      <Sidebar />

      {/* İçerik Alanı: Sidebar genişliğine göre dinamik padding alır */}
      <main className="flex-1 transition-all duration-500 ease-in-out pl-24 lg:pl-72 w-full">
        <div className="p-6 lg:p-12 max-w-[1600px] mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default MainLayout;
