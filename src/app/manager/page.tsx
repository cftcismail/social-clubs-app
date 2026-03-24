import Link from "next/link";
import { createAnnouncementAction, createClubAction, createEventAction } from "@/lib/actions";
import { requireRole } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { getManagedClubs, getRecentAnnouncements } from "@/lib/queries";
import { query } from "@/lib/db";

export default async function ManagerPage({
    searchParams,
}: {
    searchParams: Promise<{ success?: string; error?: string }>;
}) {
    const user = await requireRole(["CLUB_MANAGER", "ADMIN"]);
    const [managedClubs, announcements, events, params] = await Promise.all([
        getManagedClubs(user.id),
        getRecentAnnouncements(),
        query<{ id: number; title: string; event_date: string; location: string; club_name: string }>(
            `select e.id, e.title, e.event_date::text, e.location, c.name as club_name
       from events e
       join clubs c on c.id = e.club_id
       where c.manager_id = $1
       order by e.event_date asc
       limit 10`,
            [user.id]
        ),
        searchParams,
    ]);

    return (
        <main className="min-h-screen bg-slate-50 px-6 py-8">
            <div className="mx-auto w-full max-w-7xl space-y-6">
                <header className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Kulüp Yönetim Paneli</h1>
                            <p className="text-sm text-slate-600">Kulüp oluştur, etkinlik/duyuru yayınla ve operasyonu yönet.</p>
                        </div>
                        <Link href="/dashboard" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                            Dashboard&apos;a Dön
                        </Link>
                    </div>
                    {params.success ? (
                        <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">İşlem başarıyla tamamlandı.</p>
                    ) : null}
                    {params.error ? (
                        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">Form verisi geçersiz veya işlem başarısız.</p>
                    ) : null}
                </header>

                <section className="grid gap-6 lg:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold">Yeni Kulüp</h2>
                        <form action={createClubAction} className="mt-4 space-y-3">
                            <input name="name" minLength={3} required placeholder="Kulüp adı" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-600 focus:ring" />
                            <textarea name="description" minLength={10} required placeholder="Kulüp açıklaması" className="h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-600 focus:ring" />
                            <button className="rounded-md bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800">Kulüp Oluştur</button>
                        </form>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold">Duyuru Yayınla</h2>
                        <form action={createAnnouncementAction} className="mt-4 space-y-3">
                            <select name="clubId" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-600 focus:ring">
                                <option value="">Kulüp seç</option>
                                {managedClubs.map((club) => (
                                    <option key={club.id} value={club.id}>{club.name}</option>
                                ))}
                            </select>
                            <input name="title" minLength={4} required placeholder="Başlık" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-600 focus:ring" />
                            <textarea name="body" minLength={10} required placeholder="Duyuru metni" className="h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-600 focus:ring" />
                            <button className="rounded-md bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800">Yayınla</button>
                        </form>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold">Etkinlik Planla</h2>
                        <form action={createEventAction} className="mt-4 space-y-3">
                            <select name="clubId" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-600 focus:ring">
                                <option value="">Kulüp seç</option>
                                {managedClubs.map((club) => (
                                    <option key={club.id} value={club.id}>{club.name}</option>
                                ))}
                            </select>
                            <input name="title" minLength={3} required placeholder="Etkinlik başlığı" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-600 focus:ring" />
                            <input name="eventDate" type="datetime-local" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-600 focus:ring" />
                            <input name="location" minLength={2} required placeholder="Konum" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-600 focus:ring" />
                            <button className="rounded-md bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800">Etkinlik Oluştur</button>
                        </form>
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold">Yönetilen Kulüpler</h2>
                        <div className="mt-4 space-y-3">
                            {managedClubs.length === 0 ? (
                                <p className="text-sm text-slate-600">Henüz yönettiğiniz kulüp yok.</p>
                            ) : (
                                managedClubs.map((club) => (
                                    <article key={club.id} className="rounded-lg border border-slate-200 p-4">
                                        <h3 className="font-semibold">{club.name}</h3>
                                        <p className="mt-1 text-sm text-slate-600">{club.description}</p>
                                        <p className="mt-2 text-xs text-slate-500">Bekleyen talep: {club.pending_count}</p>
                                    </article>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold">Son Duyurular</h2>
                            <div className="mt-4 space-y-3">
                                {announcements.map((announcement) => (
                                    <article key={announcement.id} className="rounded-lg border border-slate-200 p-4">
                                        <h3 className="text-sm font-semibold">{announcement.title}</h3>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {announcement.club_name} • {formatDate(announcement.created_at)}
                                        </p>
                                        <p className="mt-2 text-sm text-slate-700">{announcement.body}</p>
                                    </article>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold">Yaklaşan Etkinlikler</h2>
                            <div className="mt-4 space-y-3">
                                {events.rows.length === 0 ? (
                                    <p className="text-sm text-slate-600">Planlanan etkinlik bulunmuyor.</p>
                                ) : (
                                    events.rows.map((event) => (
                                        <article key={event.id} className="rounded-lg border border-slate-200 p-4">
                                            <h3 className="text-sm font-semibold">{event.title}</h3>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {event.club_name} • {event.location} • {formatDate(event.event_date)}
                                            </p>
                                        </article>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
