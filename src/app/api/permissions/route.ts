import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/permissions - Get all permissions
export async function GET() {
    try {
        const permissions = await prisma.permission.findMany({
            where: { isActive: true },
            orderBy: { category: 'asc' },
        });

        return NextResponse.json(permissions);
    } catch (error: any) {
        console.error("Error fetching permissions:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

// POST /api/permissions - Create new permission (SuperAdmin only)
export async function POST(req: Request) {
    try {
        // TODO: Add SuperAdmin authentication check here

        const body = await req.json();
        const { name, description, category } = body;

        if (!name || !description || !category) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const permission = await prisma.permission.create({
            data: {
                name,
                description,
                category,
            },
        });

        return NextResponse.json(permission);
    } catch (error: any) {
        console.error("Error creating permission:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
