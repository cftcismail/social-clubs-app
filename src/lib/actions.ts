"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { clearSession, createSession, hashPassword, requireRole, requireUser, verifyPassword } from "@/lib/auth";
import { query } from "@/lib/db";

const registerSchema = z.object({
    fullName: z.string().min(3),
    email: z.string().email().transform((value) => value.toLowerCase()),
    password: z.string().min(8),
});

const loginSchema = z.object({
    email: z.string().email().transform((value) => value.toLowerCase()),
    password: z.string().min(8),
});

export async function registerAction(formData: FormData) {
    const parsed = registerSchema.safeParse({
        fullName: formData.get("fullName"),
        email: formData.get("email"),
        password: formData.get("password"),
    });

    if (!parsed.success) {
        redirect("/register?error=validation");
    }

    const { fullName, email, password } = parsed.data;

    const existing = await query<{ id: number }>("select id from users where email = $1", [email]);

    if (existing.rowCount) {
        redirect("/register?error=exists");
    }

    const passwordHash = await hashPassword(password);

    const userResult = await query<{ id: number }>(
        `insert into users (full_name, email, password_hash, role)
     values ($1, $2, $3, 'USER')
     returning id`,
        [fullName, email, passwordHash]
    );

    const userId = userResult.rows[0].id;

    await query(
        `insert into notifications (user_id, title, body)
     values ($1, 'Hoş geldin', 'Sosyal kulüp platformuna kaydın başarıyla tamamlandı.')`,
        [userId]
    );

    await createSession(userId);
    redirect("/dashboard");
}

export async function loginAction(formData: FormData) {
    const parsed = loginSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
    });

    if (!parsed.success) {
        redirect("/login?error=validation");
    }

    const { email, password } = parsed.data;

    const result = await query<{ id: number; password_hash: string }>(
        "select id, password_hash from users where email = $1",
        [email]
    );

    if (!result.rowCount) {
        redirect("/login?error=credentials");
    }

    const user = result.rows[0];
    const valid = await verifyPassword(password, user.password_hash);

    if (!valid) {
        redirect("/login?error=credentials");
    }

    await createSession(user.id);
    redirect("/dashboard");
}

export async function logoutAction() {
    await clearSession();
    redirect("/login");
}

export async function createClubAction(formData: FormData) {
    const user = await requireRole(["CLUB_MANAGER", "ADMIN"]);

    const name = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();

    if (name.length < 3 || description.length < 10) {
        redirect("/manager?error=validation");
    }

    await query(
        `insert into clubs (name, description, manager_id)
     values ($1, $2, $3)`,
        [name, description, user.id]
    );

    await query(
        `insert into audit_logs (actor_user_id, action, target_type, details)
     values ($1, 'CREATE_CLUB', 'club', $2)`,
        [user.id, JSON.stringify({ name })]
    );

    revalidatePath("/manager");
    redirect("/manager?success=club-created");
}

export async function joinClubAction(formData: FormData) {
    const user = await requireUser();
    const clubId = Number(formData.get("clubId"));

    if (!clubId) {
        redirect("/dashboard?error=club");
    }

    await query(
        `insert into memberships (club_id, user_id, status)
     values ($1, $2, 'APPROVED')
     on conflict (club_id, user_id) do update set status = 'APPROVED'`,
        [clubId, user.id]
    );

    await query(
        `insert into notifications (user_id, title, body)
     values ($1, 'Kulübe katıldın', 'Seçtiğin kulübe üyeliğin aktif edildi.')`,
        [user.id]
    );

    revalidatePath("/dashboard");
    redirect("/dashboard?success=joined");
}

export async function createPostAction(formData: FormData) {
    const user = await requireUser();
    const clubId = Number(formData.get("clubId"));
    const content = String(formData.get("content") ?? "").trim();

    if (!clubId || content.length < 5) {
        redirect("/dashboard?error=post");
    }

    const memberCheck = await query<{ id: number }>(
        `select id from memberships where club_id = $1 and user_id = $2 and status = 'APPROVED'`,
        [clubId, user.id]
    );

    if (!memberCheck.rowCount) {
        redirect("/dashboard?error=membership");
    }

    await query(
        `insert into posts (club_id, author_id, content)
     values ($1, $2, $3)`,
        [clubId, user.id, content]
    );

    revalidatePath("/dashboard");
    redirect("/dashboard?success=posted");
}

export async function createAnnouncementAction(formData: FormData) {
    const user = await requireRole(["CLUB_MANAGER", "ADMIN"]);
    const clubId = Number(formData.get("clubId"));
    const title = String(formData.get("title") ?? "").trim();
    const body = String(formData.get("body") ?? "").trim();

    if (!clubId || title.length < 4 || body.length < 10) {
        redirect("/manager?error=announcement");
    }

    await query(
        `insert into announcements (club_id, title, body, created_by)
     values ($1, $2, $3, $4)`,
        [clubId, title, body, user.id]
    );

    revalidatePath("/dashboard");
    revalidatePath("/manager");
    redirect("/manager?success=announcement");
}

export async function createEventAction(formData: FormData) {
    const user = await requireRole(["CLUB_MANAGER", "ADMIN"]);
    const clubId = Number(formData.get("clubId"));
    const title = String(formData.get("title") ?? "").trim();
    const eventDate = String(formData.get("eventDate") ?? "").trim();
    const location = String(formData.get("location") ?? "").trim();

    if (!clubId || title.length < 3 || !eventDate || location.length < 2) {
        redirect("/manager?error=event");
    }

    await query(
        `insert into events (club_id, title, event_date, location, created_by)
     values ($1, $2, $3, $4, $5)`,
        [clubId, title, eventDate, location, user.id]
    );

    revalidatePath("/dashboard");
    revalidatePath("/manager");
    redirect("/manager?success=event");
}

export async function updateUserRoleAction(formData: FormData) {
    await requireRole(["ADMIN"]);
    const userId = Number(formData.get("userId"));
    const role = String(formData.get("role"));

    if (!userId || !["USER", "CLUB_MANAGER", "ADMIN"].includes(role)) {
        redirect("/admin?error=role");
    }

    await query("update users set role = $1 where id = $2", [role, userId]);
    revalidatePath("/admin");
    redirect("/admin?success=role-updated");
}

export async function toggleClubStatusAction(formData: FormData) {
    const actor = await requireRole(["ADMIN"]);
    const clubId = Number(formData.get("clubId"));

    if (!clubId) {
        redirect("/admin?error=club");
    }

    await query("update clubs set is_active = not is_active where id = $1", [clubId]);
    await query(
        `insert into audit_logs (actor_user_id, action, target_type, target_id)
     values ($1, 'TOGGLE_CLUB_STATUS', 'club', $2)`,
        [actor.id, clubId]
    );

    revalidatePath("/admin");
    redirect("/admin?success=club-updated");
}
