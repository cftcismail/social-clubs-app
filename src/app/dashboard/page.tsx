import Link from "next/link";
import { createPostAction, joinClubAction, logoutAction } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import {
    getClubsWithMembership,
    getFeedForUser,
    getNotificationsForUser,
    getRecentAnnouncements,
    getUpcomingEventsForUser,
} from "@/lib/queries";

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ success?: string; error?: string }>;
}) {
    const user = await requireUser();
    const [clubs, feed, announcements, notifications, events, params] = await Promise.all([
        getClubsWithMembership(user.id),
        getFeedForUser(user.id),
        getRecentAnnouncements(),
        getNotificationsForUser(user.id),
        getUpcomingEventsForUser(user.id),
        searchParams,
    ]);

    return (
        <main className="min-h-screen bg-slate-50 px-6 py-8">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
                <header className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-sm text-slate-500">Hoş geldin</p>
                            <h1 className="text-2xl font-bold text-slate-900">{user.fullName}</h1>
                            <p className="text-sm text-slate-600">Rol: {user.role}</p>
                        </div>
                        <div className="flex gap-2">
                            {(user.role === "CLUB_MANAGER" || user.role === "ADMIN") && (
                                <Link
                                    href="/manager"
                                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                                >
                                    Kulüp Yönetimi
                                </Link>
                            )}
                            {user.role === "ADMIN" && (
                                <Link
                                    href="/admin"
                                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                                >
                                    Admin Paneli
                                </Link>
                            )}
                            <form action={logoutAction}>
                                <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
                                    Çıkış
                                </button>
                            </form>
                        </div>
                    </div>
                    {params.success ? (
                        <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                            İşlem başarıyla tamamlandı.
                        </p>
                    ) : null}
                    {params.error ? (
                        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                            İşlem sırasında bir hata oluştu veya yetkiniz yok.
                        </p>
                    ) : null}
                </header>

                <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                    <div className="space-y-6">
                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold">Kulüpler</h2>
                            <p className="mt-1 text-sm text-slate-600">Kulüplere katıl ve içerik paylaş.</p>
                            <div className="mt-4 space-y-3">
                                {clubs.map((club) => (
                                    <article key={club.id} className="rounded-lg border border-slate-200 p-4">
                                        <h3 className="font-semibold text-slate-900">{club.name}</h3>
                                        <p className="mt-1 text-sm text-slate-600">{club.description}</p>
                                        <p className="mt-2 text-xs text-slate-500">Üye sayısı: {club.member_count}</p>
                                        <div className="mt-3 flex items-center gap-2">
                                            <form action={joinClubAction}>
                                                <input type="hidden" name="clubId" value={club.id} />
                                                <button className="rounded-md bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800">
                                                    {club.membership_status === "APPROVED" ? "Üyeliği Yenile" : "Kulübe Katıl"}
                                                </button>
                                            </form>
                                            <span className="text-xs text-slate-500">
                                                Durum: {club.membership_status ?? "Üye değil"}
                                            </span>
                                        </div>
                                        <form action={createPostAction} className="mt-4">
                                            <input type="hidden" name="clubId" value={club.id} />
                                            <textarea
                                                name="content"
                                                minLength={5}
                                                placeholder="Kulüp gönderin..."
                                                className="h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-600 focus:ring"
                                            />
                                            <button className="mt-2 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                                                Gönderi Paylaş
                                            </button>
                                        </form>
                                    </article>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold">Kulüp Akışı</h2>
                            <div className="mt-4 space-y-3">
                                {feed.length === 0 ? (
                                    <p className="text-sm text-slate-600">Henüz içerik yok. Bir kulübe katılıp paylaşım yapabilirsin.</p>
                                ) : (
                                    feed.map((post) => (
                                        <article key={post.id} className="rounded-lg border border-slate-200 p-4">
                                            <p className="text-xs text-slate-500">
                                                {post.club_name} • {post.author_name} • {formatDate(post.created_at)}
                                            </p>
                                            <p className="mt-2 text-sm text-slate-800">{post.content}</p>
                                        </article>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <aside className="space-y-6">
                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold">Duyurular</h2>
                            <div className="mt-4 space-y-3">
                                {announcements.length === 0 ? (
                                    <p className="text-sm text-slate-600">Henüz duyuru bulunmuyor.</p>
                                ) : (
                                    announcements.map((announcement) => (
                                        <article key={announcement.id} className="rounded-lg border border-slate-200 p-4">
                                            <h3 className="text-sm font-semibold">{announcement.title}</h3>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {announcement.club_name} • {formatDate(announcement.created_at)}
                                            </p>
                                            <p className="mt-2 text-sm text-slate-700">{announcement.body}</p>
                                        </article>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold">Yaklaşan Etkinlikler</h2>
                            <div className="mt-4 space-y-3">
                                {events.length === 0 ? (
                                    <p className="text-sm text-slate-600">Kulüplerin için planlanan etkinlik bulunmuyor.</p>
                                ) : (
                                    events.map((event) => (
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

                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold">Bildirimler</h2>
                            <div className="mt-4 space-y-3">
                                {notifications.length === 0 ? (
                                    <p className="text-sm text-slate-600">Yeni bildirimin bulunmuyor.</p>
                                ) : (
                                    notifications.map((notification) => (
                                        <article key={notification.id} className="rounded-lg border border-slate-200 p-4">
                                            <p className="text-xs text-slate-500">{formatDate(notification.created_at)}</p>
                                            <h3 className="mt-1 text-sm font-semibold">{notification.title}</h3>
                                            <p className="mt-1 text-sm text-slate-700">{notification.body}</p>
                                        </article>
                                    ))
                                )}
                            </div>
                        </div>
                    </aside>
                </section>
            </div>
        </main>
    );
}
