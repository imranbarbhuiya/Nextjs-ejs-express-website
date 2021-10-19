// next types
import type { Request } from "express";
import type { NextPage } from "next";
// next components
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import * as React from "react";
// components
import toast from "../components/Toast";
// user type
import { User } from "../server/model/userModel";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { req } = ctx;
  const { user, session } = req as Request;
  let info: string[] = null;
  if (session.flash?.info?.length) {
    info = session.flash.info;
    delete session.flash["info"];
  }

  return {
    props: {
      data: user ? JSON.stringify(user) : null,
      info,
    },
  };
};
const Home: NextPage = ({
  data,
  info,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  let user: User = data ? JSON.parse(data) : null;
  const notify = React.useCallback((type, message) => {
    toast({ type, message });
  }, []);
  const dismiss = React.useCallback(() => {
    toast.dismiss();
  }, []);
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
      </Head>
      <div onClick={() => notify("success", "Success!")} className="message">
        <p>Success Message</p>
      </div>
      <div onClick={() => notify("error", "Error!")} className="message">
        <p>Error Message</p>
      </div>
      <div onClick={() => notify("info", "Info!")} className="message">
        <p>Info Message</p>
      </div>
      <div onClick={() => notify("warning", "Warning!")} className="message">
        <p>Warning Message</p>
      </div>
      <div onClick={dismiss} className="message">
        <p>Dismiss All Messages</p>
      </div>
      <div className="jumbotron centered">
        <h1>{info}</h1>
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
        </div>
      </div>
      <style jsx>{`
        .message {
          cursor: pointer;
          font: 15px Helvetica, Arial, sans-serif;
          background: #eee;
          padding: 20px;
          text-align: center;
          transition: 100ms ease-in background;
          margin: 10px;
        }
        .message:hover {
          background: #ccc;
        }
      `}</style>
    </>
  );
};

export default Home;
