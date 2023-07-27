import { Helmet } from "react-helmet";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import ApolloProvider from "./clients/Apollo/Apollo";
import WalletProvider from "./clients/WalletProvider/Wallet";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Init } from "./components/Init";
import { MobileWarning } from "./components/MobileWarning";
import { AppPaths } from "./config/appPaths";
import { Dashboard } from "./pages/Dashboard";
import { OptionsTrading } from "./pages/OptionsTrading";
import { OTC } from "./pages/OTC";
import { Vault } from "./pages/Vault";
import { GlobalContextProvider } from "./state/GlobalContext";

import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {
  return (
    <GlobalContextProvider>
      <WalletProvider>
        <ApolloProvider>
          <Init />
          <div className="bg-bone flex flex-col min-h-screen">
            {process.env.REACT_APP_ENV !== "production" && (
              <Helmet>
                <meta name="robots" content="noindex, nofollow" />
              </Helmet>
            )}

            <MobileWarning />
            <Header />
            <div className="px-16 overflow-hidden">
              <div className="root-grid pb-16">
                <Routes>
                  <Route path={AppPaths.VAULT} element={<Vault />} />
                  <Route path={AppPaths.HOME} element={<OptionsTrading />} />
                  <Route path={AppPaths.TRADE} element={<OptionsTrading />} />
                  <Route path={AppPaths.DASHBOARD} element={<Dashboard />} />
                  <Route path={AppPaths.OTC} element={<OTC />} />
                </Routes>
              </div>
            </div>
            <Footer />
          </div>
          <ToastContainer
            toastClassName="bg-bone rounded-none border-2 border-black font-dm-sans text-black max-w-xl w-fit"
            hideProgressBar
            position="bottom-center"
            autoClose={5000}
          />
        </ApolloProvider>
      </WalletProvider>
    </GlobalContextProvider>
  );
}

export default App;
