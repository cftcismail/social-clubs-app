import Link from "next/link";
import { loginAction } from "@/lib/actions";

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    const { error } = await searchParams;

    return (
        <main className="min-h-screen bg-slate-50 px-6 py-16">
            <div className="mx-auto w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-900">Giriş Yap</h1>
                <p className="mt-2 text-sm text-slate-600">Kurumsal e-posta hesabınızla oturum açın.</p>

                {error ? (
                    <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                        E-posta veya şifre doğrulanamadı.
                    </p>
                ) : null}

                <form action={loginAction} className="mt-6 space-y-4">
                    <label className="block text-sm font-medium text-slate-700">
                        E-posta
                        <input
                            type="email"
                            name="email"
                            required
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-blue-600 focus:ring"
                        />
                    </label>

                    <label className="block text-sm font-medium text-slate-700">
                        Şifre
                        <input
                            type="password"
                            name="password"
                            required
                            minLength={8}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-blue-600 focus:ring"
                        />
                    </label>

                    <button
                        type="submit"
                        className="w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
                    >
                        Giriş Yap
                    </button>
                </form>

                <p className="mt-5 text-sm text-slate-600">
                    Hesabın yok mu?{" "}
                    <Link href="/register" className="font-semibold text-blue-700 hover:text-blue-800">
                        Kayıt ol
                    </Link>
                </p>
            </div>
        </main>
    );
}
