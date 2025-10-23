import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import TestimonialsSection from "@/components/TestimonialsSection";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    const userRole = (session.user as any).role;
    if (userRole === "ADMIN") {
      redirect("/dashboard");
    } else {
      redirect("/menu");
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
      <header className="flex items-center justify-between px-10 py-4 border-b border-[#f4f2f0]">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-3xl text-primary">
            bakery_dining
          </span>
          <h2 className="text-xl font-bold text-[#181411]">Boulangerie</h2>
        </div>
        <div className="flex gap-2">
          <Link
            href="/login"
            className="flex items-center justify-center h-10 px-6 rounded-lg bg-white border border-[#e6e0db] text-[#181411] text-sm font-bold hover:bg-gray-50 transition-colors"
          >
            Se connecter
          </Link>
          <Link
            href="/register"
            className="flex items-center justify-center h-10 px-6 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors"
          >
            S'inscrire
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="px-10 py-16">
          <div
            className="flex min-h-[480px] flex-col gap-6 items-center justify-center p-4 text-center rounded-xl bg-cover bg-center"
            style={{
              backgroundImage:
                'linear-gradient(rgba(34, 25, 16, 0.5) 0%, rgba(34, 25, 16, 0.7) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuDd6AWXJ4p83yfEuBiHidof9O2uLOfmKOzAcxdMI6dAc3bjdviFZ0tMveegu-5OPPLYUzd8IEa2yPFUqV0ZQdvQtwioVyNNghYguXDbn413M3uK0j5ecswyGIs59ODFF5uuGvNcrufHWBqoM9eQjrSxDW8f3n-h2givKQvqHq8ck5IlclTbmDSrtBOAqfZIFnEqhOMAxlVfsR8dE8zdTK181-PynocVEAnqdd0pw-xhLC_SUrp0qctpbYFxsN0_XQYwdn3kIJgxqZI")',
            }}
          >
            <div className="flex flex-col gap-4 max-w-xl">
              <h1 className="text-white text-5xl font-black leading-tight tracking-tight">
                L'art de la boulangerie, une tradition familiale
              </h1>
              <h2 className="text-stone-200 text-lg font-normal">
                Découvrez nos pains frais, nos viennoiseries dorées et nos
                pâtisseries gourmandes, préparés chaque jour avec passion.
              </h2>
            </div>
            <Link
              href="/login"
              className="flex items-center justify-center h-12 px-6 rounded-lg bg-primary text-white text-base font-bold hover:bg-primary/90 transition-colors"
            >
              Commander maintenant
            </Link>
          </div>
        </div>

        <div className="px-10 py-16 bg-white">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#181411]">
            Nos produits phares
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Croissant au beurre",
                desc: "Un classique indémodable, pur beurre, pour un réveil tout en douceur.",
                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCeSkd3PY8bOAAGLKI5o1r3TvrtuuJ-upXNxVP6R7JKl0BkjmHS75cQh4Rc9BNyiM8miSV-fzsNCpDj72SwBOwHH5-MU8lmUcE-8iFmFLyCGvPlA3l4noDaxXVPgNCflNlR0jnWk4vXTxPdEcY6SvBP6M6a7dNplsAIZaJqWeqO3zXd4TBeFW69J4jQxZhrSbMfnaecHNELtK0COtrTAPTxsYy1wGNQ99jjrVfM99uDAJXdX_ZfEpG1C4HX6YZ_uzgJuAhwwRZ98RM",
              },
              {
                name: "Baguette Tradition",
                desc: "Une croûte croustillante et une mie aérée, idéale pour tous vos repas.",
                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB4P5EOx_5nZi97CV5JEcifnd9ryA6dd6zx_CJ9V_DTLEq24zIqS3fQmNvnLcJhlqjytoDt47RQk_jrSZXBPfDvxdl_ICMZJbn7lhg5pcmEI02bHLUGljertGmhqLPFAwTR8Hq1DOp3E0_kBnnxwXQYVArf_HpQj6gauPMB3CZ3w62eOsTJQACQ1gRdA3PAc_SlD70qGRetQ03qMF8i0OITUdsw-mdRDZ_vre8Bt4KnWKy_fUc5P0yx2HhVz02mBa1I5pVBqWhzV6E",
              },
              {
                name: "Pain au chocolat",
                desc: "La gourmandise d'un chocolat noir intense dans une pâte feuilletée.",
                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFNMuh1jXhb27e_RMC9db7zuScUJZzj57alBJuJVjq-Qm9d45NuYlnEAwAkdtFh33fd-Cf19NZNdgfA9wDeYf2fkilsrqVxGSTxLzhoeIHuHiOcNmDbYQP0ZzlNBA-qrkzomJGlBlmJh_I9cV8T5vyUntLp1zLF75qPm7A8BzlekthD30QHua9mFGv8ZmTJg8fKf9gbEt1SaQrE_UBTtiZ_-CX1UzNmkMBAyfUdSz3cR-6WI7dzxyW_4VYSiCHXLT1egq9k-HsnFk",
              },
            ].map((product, i) => (
              <div
                key={i}
                className="flex flex-col gap-4 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow bg-white"
              >
                <div
                  className="w-full aspect-video bg-center bg-cover"
                  style={{ backgroundImage: `url("${product.img}")` }}
                />
                <div className="px-4 pb-4">
                  <p className="text-lg font-bold text-[#181411]">
                    {product.name}
                  </p>
                  <p className="text-sm text-[#897561]">{product.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section témoignages clients */}
        <TestimonialsSection />
      </main>

      <footer className="bg-white border-t border-[#f4f2f0] py-8">
        <div className="px-10 text-center text-sm text-[#897561]">
          <p>© 2024 Boulangerie. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
