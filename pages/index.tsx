// next types
import type { Request } from "express";
import type { NextPage } from "next";
// next components
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import React, { useEffect } from "react";
import { toast } from "react-toastify";
// user type
import { User } from "../server/model/userModel";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { req } = ctx;
  const { user, session } = req as Request;
  let info: string[] = [];
  let error: string[] = [];
  let success: string[] = [];
  if (session.flash?.success?.length) {
    success = session.flash.success;
    delete session.flash["success"];
  }
  if (session.flash?.info?.length) {
    info = session.flash.info;
    delete session.flash["info"];
  }
  if (session.flash?.error?.length) {
    error = session.flash.error;
    delete session.flash["error"];
  }

  return {
    props: {
      userData: user
        ? {
            username: user.username,
            verified: user.verified,
            email: user.email,
          }
        : null,
      success,
      info,
      error,
    },
  };
};

const Home: NextPage = ({
  userData,
  success,
  info,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  let user: User = userData || null,
    successMsg = success[0],
    infoMsg = info[0],
    errorMsg = error[0];
  useEffect(() => {
    if (successMsg) toast["success"](successMsg);
    if (infoMsg) toast["info"](infoMsg);
    if (errorMsg) toast["error"](errorMsg);
  }, [successMsg, infoMsg, errorMsg]);
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@codversity" />
        <meta name="twitter:title" content="Codversity" />
        <meta name="twitter:description" content="One place for everything" />
        <meta
          name="twitter:image"
          content="https://codversity.herokuapp.com/assets/img/logo.png"
        />
        <meta property="fb:app_id" content="886693702262731" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://codversity.herokuapp.com/" />
        <meta property="og:title" content="Codversity" />
        <meta property="og:description" content="One place for everything" />
        <meta
          property="og:image"
          content="https://codversity.herokuapp.com/assets/img/long_logo.jpeg"
        />
        <meta property="og:image:alt" content="Codversity" />
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3"
          crossOrigin="anonymous"
        ></link>
        <title>Codversity</title>
      </Head>

      <div className="jumbotron centered">
        <div className="container">
          <h1 className="display-3">Here&apos;s your detail&apos;s</h1>
          <hr />
          {user ? (
            <>
              <ul className="list">
                <li className="field-text">name: {user.username}</li>
                <li className="field-text">Email: {user.email}</li>
              </ul>
              <a className="btn btn-warning me-5" href="/logout" role="button">
                Log Out
              </a>
              {!user.verified && (
                <a
                  className="btn btn-success me-5"
                  href="/verify"
                  role="button"
                >
                  verify
                </a>
              )}
            </>
          ) : (
            <>
              <a
                className="btn btn-primary me-5"
                href="/register"
                role="button"
              >
                Register
              </a>
              <a className="btn btn-primary ms-5" href="/login" role="button">
                Login
              </a>
            </>
          )}
          <a className="btn btn-success ms-5" href="blog">
            Blogs
          </a>
          <Link href="/test">
            <a className="btn btn-success ms-5">Test</a>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Home;
