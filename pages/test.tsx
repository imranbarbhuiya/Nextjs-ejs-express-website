import type { NextPage } from "next";
import Link from "next/link";

const Test: NextPage = () => {
  return (
    <>
      <p>
        Ok let&#39;s try something funny. Go to inspect find body tag add a
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
