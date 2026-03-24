import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-700">
            Kurumsal Sosyal Kulüp Platformu
          </p>
          <h1 className="text-4xl font-bold leading-tight">
            Şirket içi kulüplerinizi tek merkezden yönetin ve çalışan etkileşimini artırın
          </h1>
          <p className="mt-4 max-w-3xl text-slate-600">
            Bu ürün; kullanıcı etkileşimi, kulüp yönetimi ve sistem admin operasyonlarını aynı
            platformda birleştirir. Gönderi, duyuru, etkinlik, bildirim ve rol bazlı yönetim
            panelleri üretime hazır mimariyle sunulur.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
              >
                Dashboard&apos;a Git
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Kullanıcı Etkileşimi",
              description: "Kulüp bazlı gönderi paylaşımı, yorum ve beğeni akışlarını yönetir.",
            },
            {
              title: "Kulüp Yönetimi",
              description:
                "Kulüp yöneticileri etkinlik, duyuru ve üyelik operasyonlarını tek panelden yürütür.",
            },
            {
              title: "Admin Kontrolü",
              description:
                "Sistem yöneticileri kullanıcı rolleri, kulüp durumları ve denetim kayıtlarını yönetir.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
