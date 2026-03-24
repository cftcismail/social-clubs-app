import { query } from "@/lib/db";

export async function getClubsWithMembership(userId: number) {
    const result = await query<{
        id: number;
        name: string;
        description: string;
        membership_status: string | null;
        member_count: string;
    }>(
        `select c.id,
            c.name,
            c.description,
            m.status as membership_status,
            count(cm.id)::text as member_count
     from clubs c
     left join memberships m on m.club_id = c.id and m.user_id = $1
     left join memberships cm on cm.club_id = c.id and cm.status = 'APPROVED'
     where c.is_active = true
     group by c.id, c.name, c.description, m.status
     order by c.name asc`,
        [userId]
    );

    return result.rows;
}

export async function getFeedForUser(userId: number) {
    const result = await query<{
        id: number;
        club_name: string;
        author_name: string;
        content: string;
        created_at: string;
    }>(
        `select p.id,
            c.name as club_name,
            u.full_name as author_name,
            p.content,
            p.created_at::text
     from posts p
     join clubs c on c.id = p.club_id
     join users u on u.id = p.author_id
     join memberships m on m.club_id = c.id and m.user_id = $1 and m.status = 'APPROVED'
     where p.is_deleted = false
     order by p.created_at desc
     limit 20`,
        [userId]
    );

    return result.rows;
}

export async function getManagedClubs(userId: number) {
    const result = await query<{
        id: number;
        name: string;
        description: string;
        pending_count: string;
    }>(
        `select c.id,
            c.name,
            c.description,
            count(m.id) filter (where m.status = 'PENDING')::text as pending_count
     from clubs c
     left join memberships m on m.club_id = c.id
     where c.manager_id = $1 and c.is_active = true
     group by c.id, c.name, c.description
     order by c.created_at desc`,
        [userId]
    );

    return result.rows;
}

export async function getAdminSummary() {
    const [users, clubs, reports, events] = await Promise.all([
        query<{ total: string }>("select count(*)::text as total from users"),
        query<{ total: string }>("select count(*)::text as total from clubs where is_active = true"),
        query<{ total: string }>("select count(*)::text as total from abuse_reports where status = 'OPEN'"),
        query<{ total: string }>("select count(*)::text as total from events where event_date >= now()"),
    ]);

    return {
        users: Number(users.rows[0]?.total ?? 0),
        clubs: Number(clubs.rows[0]?.total ?? 0),
        openReports: Number(reports.rows[0]?.total ?? 0),
        upcomingEvents: Number(events.rows[0]?.total ?? 0),
    };
}

export async function getRecentAnnouncements() {
    const result = await query<{
        id: number;
        title: string;
        body: string;
        created_at: string;
        club_name: string;
    }>(
        `select a.id,
            a.title,
            a.body,
            a.created_at::text,
            c.name as club_name
     from announcements a
     join clubs c on c.id = a.club_id
     order by a.created_at desc
     limit 6`
    );

    return result.rows;
}

export async function getUpcomingEventsForUser(userId: number) {
    const result = await query<{
        id: number;
        title: string;
        event_date: string;
        location: string;
        club_name: string;
    }>(
        `select e.id,
            e.title,
            e.event_date::text,
            e.location,
            c.name as club_name
     from events e
     join clubs c on c.id = e.club_id
     join memberships m on m.club_id = c.id and m.user_id = $1 and m.status = 'APPROVED'
     where e.event_date >= now()
     order by e.event_date asc
     limit 8`,
        [userId]
    );

    return result.rows;
}

export async function getNotificationsForUser(userId: number) {
    const result = await query<{
        id: number;
        title: string;
        body: string;
        created_at: string;
        is_read: boolean;
    }>(
        `select id, title, body, created_at::text, is_read
     from notifications
     where user_id = $1
     order by created_at desc
     limit 10`,
        [userId]
    );

    return result.rows;
}
