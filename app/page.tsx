import { Chapters } from "./components/chapters";

export default function Page() {
  return (
    <main className="max-w-2xl mx-auto px-6 md:px-8 mt-12 lg:mt-16">
      <section>
        <div className="mb-12 space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight leading-tight mb-4">
            Lattice Cryptography for Applied Cryptographers
          </h1>
          <p>Hello world</p>

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
