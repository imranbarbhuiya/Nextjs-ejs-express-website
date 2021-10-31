// next types
import type { AppProps } from "next/app";
import NextNprogress from "nextjs-progressbar";
import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <ToastContainer
        position="top-right"
        autoClose={8000}
        hideProgressBar={false}
        newestOnTop={true}
        draggable={false}
        closeOnClick
        pauseOnHover
      />
      <NextNprogress />
    </>
  );
}
export default MyApp;
