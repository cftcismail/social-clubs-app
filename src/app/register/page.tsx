import Link from "next/link";
import { registerAction } from "@/lib/actions";

export default async function RegisterPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    const { error } = await searchParams;

    return (
        <main className="min-h-screen bg-slate-50 px-6 py-16">
            <div className="mx-auto w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-900">Kayıt Ol</h1>
                <p className="mt-2 text-sm text-slate-600">Şirket hesabınla platforma katıl.</p>

                {error ? (
                    <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                        Bu e-posta ile zaten bir hesap bulunuyor veya form verisi geçersiz.
                    </p>
                ) : null}

                <form action={registerAction} className="mt-6 space-y-4">
                    <label className="block text-sm font-medium text-slate-700">
                        Ad Soyad
                        <input
                            type="text"
                            name="fullName"
                            required
                            minLength={3}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-blue-600 focus:ring"
                        />
                    </label>

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
                        Hesap Oluştur
                    </button>
                </form>

                <p className="mt-5 text-sm text-slate-600">
                    Zaten hesabın var mı?{" "}
                    <Link href="/login" className="font-semibold text-blue-700 hover:text-blue-800">
                        Giriş yap
                    </Link>
                </p>
            </div>
        </main>
    );
}
