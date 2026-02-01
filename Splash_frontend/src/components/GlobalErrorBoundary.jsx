import React from "react";

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uygulama Hatası:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white p-6">
          <h1 className="text-2xl font-bold mb-4">Bir şeyler ters gitti </h1>
          <p className="mb-6 opacity-80 text-center text-sm">
            Beklenmedik bir hata oluştu. Lütfen ana sayfaya dönmeyi deneyin.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
