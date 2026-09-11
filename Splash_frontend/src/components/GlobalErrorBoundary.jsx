import React from "react";

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Kritik Sistem Hatası Yakalandı:", error, errorInfo);
  }

  componentDidMount() {
    // Asenkron ve event handler çökmelerini yakalama
    window.addEventListener("error", this.handleGlobalError);
    window.addEventListener(
      "unhandledrejection",
      this.handleUnhandledRejection,
    );
  }

  componentWillUnmount() {
    window.removeEventListener("error", this.handleGlobalError);
    window.removeEventListener(
      "unhandledrejection",
      this.handleUnhandledRejection,
    );
  }

  handleGlobalError = (event) => {
    console.error("Window Error:", event.error);
    this.setState({
      hasError: true,
      error: event.error || new Error(event.message),
    });
  };

  handleUnhandledRejection = (event) => {
    console.error("Unhandled Rejection:", event.reason);
    this.setState({ hasError: true, error: event.reason });
  };

  handleGoHome = () => {
    if (window.location.hash) {
      window.location.hash = "#/";
    } else {
      window.location.pathname = "/";
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 w-screen h-screen bg-[#030712] text-white flex flex-col items-center justify-center p-6 z-[999999] select-none">
          <div className="bg-[#0f172a] border border-gray-800 p-8 rounded-3xl max-w-lg w-full text-center shadow-2xl space-y-5">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto text-3xl">
              ⚠️
            </div>
            <h2 className="text-xl font-bold">Bir Aksaklık Oluştu</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              İşlem sırasında beklenmedik bir arayüz hatası meydana geldi. Siyah
              ekranda kalmamak için doğrudan ana sayfaya dönebilirsiniz.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleGoHome}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-blue-600/30"
              >
                Ana Sayfaya Dön
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-bold text-sm transition border border-gray-700"
              >
                Sayfayı Yenile
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
