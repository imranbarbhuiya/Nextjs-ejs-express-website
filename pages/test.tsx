import type { NextPage } from "next";
import Link from "next/link";

const Test: NextPage = () => {
  return (
    <>
      <h1>Why you&#39;ve came here? </h1>
      <Link href="/">Go Back</Link>
      <p>
        Ok let's try something funny. Go to inspect find body tag add a
        background color (bright) then click
      </p>
      <Link href="/">
        <a>Home</a>
      </Link>
      <p>Lemme what magic happened.</p>
    </>
  );
};

export default Test;
