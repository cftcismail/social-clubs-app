import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
    try {
        await query("select 1");

        return NextResponse.json({
            status: "ok",
            service: "social-clubs-app",
            database: "connected",
            timestamp: new Date().toISOString(),
        });
    } catch {
        return NextResponse.json(
            {
                status: "error",
                service: "social-clubs-app",
                database: "disconnected",
            },
            { status: 500 }
        );
    }
}
