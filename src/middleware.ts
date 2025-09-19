import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
        cookieName: "next-auth.session-token",
    });

    const url = request.nextUrl;

    console.log("token", token);

    // 1. Logged in user cannot go to login page
    if (token && (url.pathname.startsWith("/login") || url.pathname === "/")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // 2. Unauthenticated user cannot go to protected pages
    if (!token && (
        url.pathname.startsWith("/dashboard") ||
        url.pathname.startsWith("/admin") ||
        url.pathname.startsWith("/attendance") ||
        url.pathname.startsWith("/leave") ||
        url.pathname.startsWith("/tasks") ||
        url.pathname === "/profile"
    )) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // 3. Role-based admin access (only SuperAdmin and Admin can access admin pages)
    if (token && url.pathname.startsWith("/admin")) {
        const userRole = token.role as string;
        if (userRole !== 'SuperAdmin' && userRole !== 'Admin') {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/login",
        "/",
        "/dashboard/:path*",
        "/admin/:path*",
        "/attendance/:path*",
        "/leave/:path*",
        "/tasks/:path*",
        "/profile"
    ],
};


