import { Response } from "express";
import type { NextPage } from "next";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { res } = ctx;
  const { locals } = res as Response;

  return { props: { csrf: locals.csrf } };
};

const Test: NextPage = ({
  csrf,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <>
      <form action="/login" method="POST">
        <input type="hidden" name="_csrf" value={csrf} />
        <button type="submit">Submit</button>
      </form>
    </>
  );
};

export default Test;
