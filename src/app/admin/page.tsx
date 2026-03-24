import Link from "next/link";
import { toggleClubStatusAction, updateUserRoleAction } from "@/lib/actions";
import { requireRole } from "@/lib/auth";
import { getAdminSummary } from "@/lib/queries";
import { query } from "@/lib/db";

export default async function AdminPage({
    searchParams,
}: {
    searchParams: Promise<{ success?: string; error?: string }>;
}) {
    await requireRole(["ADMIN"]);

    const [summary, users, clubs, params] = await Promise.all([
        getAdminSummary(),
        query<{ id: number; full_name: string; email: string; role: string }>(
            "select id, full_name, email, role from users order by created_at desc limit 30"
        ),
        query<{ id: number; name: string; is_active: boolean }>(
            "select id, name, is_active from clubs order by created_at desc limit 30"
        ),
        searchParams,
    ]);

    return (
        <main className="min-h-screen bg-slate-50 px-6 py-8">
            <div className="mx-auto w-full max-w-7xl space-y-6">
                <header className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Sistem Admin Paneli</h1>
                            <p className="text-sm text-slate-600">Kullanıcı rolleri, kulüp durumları ve sistem metrikleri.</p>
                        </div>
                        <Link href="/dashboard" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                            Dashboard&apos;a Dön
                        </Link>
                    </div>
                    {params.success ? (
                        <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">İşlem başarıyla tamamlandı.</p>
                    ) : null}
                    {params.error ? (
                        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">İşlem sırasında bir doğrulama hatası oluştu.</p>
                    ) : null}
                </header>

                <section className="grid gap-4 md:grid-cols-4">
                    {[
                        { label: "Toplam Kullanıcı", value: summary.users },
                        { label: "Aktif Kulüp", value: summary.clubs },
                        { label: "Açık Rapor", value: summary.openReports },
                        { label: "Yaklaşan Etkinlik", value: summary.upcomingEvents },
                    ].map((item) => (
                        <article key={item.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
                            <p className="mt-2 text-2xl font-bold text-slate-900">{item.value}</p>
                        </article>
                    ))}
                </section>

                <section className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold">Kullanıcı Yönetimi</h2>
                        <div className="mt-4 space-y-3">
                            {users.rows.map((user) => (
                                <article key={user.id} className="rounded-lg border border-slate-200 p-4">
                                    <p className="font-medium text-slate-900">{user.full_name}</p>
                                    <p className="text-xs text-slate-500">{user.email}</p>
                                    <form action={updateUserRoleAction} className="mt-3 flex items-center gap-2">
                                        <input type="hidden" name="userId" value={user.id} />
                                        <select name="role" defaultValue={user.role} className="rounded-md border border-slate-300 px-3 py-1.5 text-xs">
                                            <option value="USER">USER</option>
                                            <option value="CLUB_MANAGER">CLUB_MANAGER</option>
                                            <option value="ADMIN">ADMIN</option>
                                        </select>
                                        <button className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100">Güncelle</button>
                                    </form>
                                </article>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold">Kulüp Yönetimi</h2>
                        <div className="mt-4 space-y-3">
                            {clubs.rows.map((club) => (
                                <article key={club.id} className="rounded-lg border border-slate-200 p-4">
                                    <p className="font-medium text-slate-900">{club.name}</p>
                                    <p className="text-xs text-slate-500">Durum: {club.is_active ? "Aktif" : "Pasif"}</p>
                                    <form action={toggleClubStatusAction} className="mt-3">
                                        <input type="hidden" name="clubId" value={club.id} />
                                        <button className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                                            Durumu Değiştir
                                        </button>
                                    </form>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
