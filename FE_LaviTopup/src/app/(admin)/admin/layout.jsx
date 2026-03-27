import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AdminShell from "./AdminShell";

const LOGIN_PATH = "/auth/login";
const HOME_PATH = "/";

async function requireAdminAccess() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
        redirect(LOGIN_PATH);
    }

    const cookieHeader = cookieStore
        .getAll()
        .map(({ name, value }) => `${name}=${value}`)
        .join("; ");
    const apiBaseUrl =
        process.env.INTERNAL_API_URL ||
        process.env.API_URL ||
        process.env.NEXT_PUBLIC_API_URL;

    if (!apiBaseUrl) {
        console.error("Missing API URL for admin auth check.");
        redirect(LOGIN_PATH);
    }

    let response;

    try {
        response = await fetch(`${apiBaseUrl}/api/users/checkRole`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                Cookie: cookieHeader,
            },
            cache: "no-store",
        });
    } catch (error) {
        console.error("Failed to verify admin access.", error);
        redirect(LOGIN_PATH);
    }

    if (response.status === 401) {
        redirect(LOGIN_PATH);
    }

    if (!response.ok) {
        redirect(HOME_PATH);
    }

    let payload;

    try {
        payload = await response.json();
    } catch (error) {
        console.error("Invalid admin auth response payload.", error);
        redirect(HOME_PATH);
    }

    if (payload.role !== "admin") {
        redirect(HOME_PATH);
    }
}

export default async function AdminLayout({ children }) {
    await requireAdminAccess();

    return <AdminShell>{children}</AdminShell>;
}
