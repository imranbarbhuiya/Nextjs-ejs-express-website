import Link from "next/link";

// Pass this content as 'props' tp child components
const About = () => (
  <div>
    <Link href="/">
      <button>Home page</button>
    </Link>
    <Link href="/about">
      <button>About page</button>
    </Link>

    <p>Hello Next.js</p>
  </div>
);

export default About;
