import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET user permissions
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        // Validate ObjectId format
        if (!id || id.length !== 24) {
            return NextResponse.json(
                { error: "Invalid user ID" },
                { status: 400 }
            );
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id },
        });

        if (!existingUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Get user permissions
        const userPermissions = await prisma.userPermission.findMany({
            where: { userId: id },
            include: {
                permission: true,
            },
        });

        const permissions = userPermissions.map(up => up.permission);

        return NextResponse.json(permissions);
    } catch (error: any) {
        console.error("Error fetching user permissions:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

// PATCH update user permissions (SuperAdmin only)
export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await req.json();

        console.log("Updating user permissions:", id, body);

        // TODO: Add SuperAdmin authentication check here
        // const currentUser = await getCurrentUser(req);
        // if (currentUser.role !== 'SuperAdmin') {
        //   return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        // }

        // Validate ObjectId format
        if (!id || id.length !== 24) {
            return NextResponse.json(
                { error: "Invalid user ID" },
                { status: 400 }
            );
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id },
        });

        if (!existingUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const { permissions } = body;

        if (!Array.isArray(permissions)) {
            return NextResponse.json(
                { error: "Permissions must be an array" },
                { status: 400 }
            );
        }

        // Get all available permissions
        const allPermissions = await prisma.permission.findMany();
        const permissionMap = new Map(allPermissions.map(p => [p.name, p.id]));

        // Clear existing permissions
        await prisma.userPermission.deleteMany({
            where: { userId: id }
        });

        // Add new permissions
        for (const permissionName of permissions) {
            const permissionId = permissionMap.get(permissionName);
            if (permissionId) {
                await prisma.userPermission.create({
                    data: {
                        userId: id,
                        permissionId: permissionId,
                    },
                });
            }
        }

        console.log("Permissions updated for user:", id, permissions);

        return NextResponse.json({
            success: true,
            message: "Permissions updated successfully",
            permissions: permissions
        });
    } catch (error: any) {
        console.error("Error updating permissions:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
