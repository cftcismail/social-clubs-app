import { compare, hash } from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { query } from "@/lib/db";
import { AuthUser, Role } from "@/lib/types";

const SESSION_COOKIE = "sc_session";

export async function hashPassword(password: string) {
    return hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
    return compare(password, passwordHash);
}

export async function createSession(userId: number) {
    const token = randomUUID();

    await query(
        `insert into sessions (token, user_id, expires_at)
     values ($1, $2, now() + interval '7 days')`,
        [token, userId]
    );

    const store = await cookies();
    store.set(SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
    });
}

export async function clearSession() {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;

    if (token) {
        await query("delete from sessions where token = $1", [token]);
    }

    store.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;

    if (!token) {
        return null;
    }

    const result = await query<{
        id: number;
        full_name: string;
        email: string;
        role: Role;
    }>(
        `select u.id, u.full_name, u.email, u.role
     from sessions s
     join users u on u.id = s.user_id
     where s.token = $1 and s.expires_at > now()`,
        [token]
    );

    if (!result.rowCount) {
        return null;
    }

    const row = result.rows[0];

    return {
        id: row.id,
        fullName: row.full_name,
        email: row.email,
        role: row.role,
    };
}

export async function requireUser() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    return user;
}

export async function requireRole(allowedRoles: Role[]) {
    const user = await requireUser();

    if (!allowedRoles.includes(user.role)) {
        redirect("/dashboard?error=forbidden");
    }

    return user;
}
