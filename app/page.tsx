import Link from "next/link";
import { Chapters } from "./components/chapters";

export default function Page() {
  return (
    <main className="max-w-2xl mx-auto px-6 md:px-8 mt-12 lg:mt-16">
      <section>
        <div className="mb-12 space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight leading-tight mb-4">
            Lattice Cryptography for Applied Cryptographers
          </h1>
          <p>
            A plain-language course on lattices and lattice cryptography,
            written for applied cryptographers, protocol engineers, and software
            engineers who want to understand how modern post-quantum schemes
            work under the hood.
          </p>
          <p>
            The course starts with the background maths and builds up slowly:
            vectors, matrices, modular arithmetic, sampling, noise, lattices,
            SIS, LWE, rings, modules, ML-KEM, ML-DSA, and Falcon.
          </p>
          <p>
            I hope you find it useful,
            <br />
            <Link
              className="italic text-blue-600"
              href="https://x.com/conordeegan"
              target="_blank"
            >
              Conor
            </Link>
          </p>

          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-6 tracking-tight">
              Chapters
            </h2>
            <Chapters />
          </section>
        </div>
      </section>
    </main>
  );
}
