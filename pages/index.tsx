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
import type { User } from "../server/model/userModel";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { req } = ctx;
  const { user, session, isAuthenticated, query } = req as Request;
  if (!isAuthenticated())
    if (query.referred) session.referred = query.referred as string;
  let message: { info?: string[]; error?: string[]; success?: string[] } = {};
  ["success", "info", "error"].forEach((type) => {
    if (session.flash?.[type]?.length) {
      message[type] = session.flash[type];
      delete session.flash[type];
    }
  });

  return {
    props: {
      userData: user
        ? {
            username: user.username,
            verified: user.verified,
            email: user.email,
          }
        : null,
      message,
    },
  };
};

const Home: NextPage = ({
  userData,
  message,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  let user: User = userData || null,
    successMsg = message.success?.[0],
    infoMsg = message.info?.[0],
    errorMsg = message.error?.[0];
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
              <Link href="/logout">
                <a className="btn btn-warning me-2" role="button">
                  Log Out
                </a>
              </Link>
              {!user.verified && (
                <Link href="/verify">
                  <a className="btn btn-success me-2" role="button">
                    verify
                  </a>
                </Link>
              )}
            </>
          ) : (
            <>
              <Link href="/register">
                <a className="btn btn-primary me-2" role="button">
                  Register
                </a>
              </Link>
              <Link href="/login">
                <a className="btn btn-primary me-2" role="button">
                  Login
                </a>
              </Link>
            </>
          )}
          <Link href="/blog">
            <a className="btn btn-success me-2" role="button">
              Blogs
            </a>
          </Link>
          <Link href="/test">
            <a className="btn btn-success me-2" role="button">
              Test
            </a>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Home;
