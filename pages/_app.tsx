// next types
import type { AppProps } from "next/app";
import * as React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import toast from "../components/Toast";

function MyApp({ Component, pageProps }: AppProps) {
  React.useEffect(() => {
    toast({ type: "info", message: "Hello world!" });
  }, []);

  return (
    <>
      <Component {...pageProps} />
      <ToastContainer
        position="top-right"
        autoClose={8000}
        hideProgressBar={false}
        newestOnTop={false}
        draggable={false}
        closeOnClick
        pauseOnHover
      />
    </>
  );
}
export default MyApp;
