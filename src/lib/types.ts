export type Role = "USER" | "CLUB_MANAGER" | "ADMIN";

export type AuthUser = {
    id: number;
    fullName: string;
    email: string;
    role: Role;
};
