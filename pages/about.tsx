import type { Request } from "express";
import type { NextPage } from "next";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Link from "next/link";
// user type
import { User } from "../server/model/userModel";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { req } = ctx;
  const { user, session } = req as Request;
  console.log(session.flash?.info);
  delete session.flash["info"];

  if (!user) {
    return {
      props: {
        data: null,
      },
    };
  }
  const data = JSON.stringify(user);

  return { props: { data } };
};
const About: NextPage = ({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  let user: User;
  if (data) user = JSON.parse(data);
  else user = null;
  return (
    <>
      <h1>{user?.email}</h1>
      <ul>
        <li>
          <Link href="/b" as="/a">
            <a>a</a>
          </Link>
        </li>
        <li>
          <Link href="/a" as="/b">
            <a>b</a>
          </Link>
        </li>
      </ul>
    </>
  );
};

export default About;
