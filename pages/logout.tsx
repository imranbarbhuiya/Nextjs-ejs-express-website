// next types
import { Request } from "express";
import type { NextPage } from "next";
// next components
import { GetServerSideProps } from "next";
import React from "react";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  console.log("log");

  const { req } = ctx;
  const { session } = req as Request;
  session.destroy((err) => {
    if (err) {
      session.flash.error = ["An error occurred"];
    }
  });
  return {
    redirect: {
      destination: "/",
      permanent: true,
    },
  };
};

const Logout: NextPage = () => {
  return <>logged out successfully</>;
};

export default Logout;
