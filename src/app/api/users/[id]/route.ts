import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH update user
export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await req.json();

        console.log("Updating user:", id, body);

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

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                ...(body.email && { email: body.email }),
                ...(body.role && { role: body.role }),
                ...(body.managerId !== undefined && { managerId: body.managerId || null }),
                ...(body.position && { position: body.position }),
                ...(body.department && { department: body.department }),
            },
            include: { manager: true },
        });

        console.log("User updated:", updatedUser);

        return NextResponse.json({
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            managerId: updatedUser.managerId,
            managerName: updatedUser.manager ? updatedUser.manager.name : null,
            position: updatedUser.position,
            department: updatedUser.department,
        });
    } catch (error: any) {
        console.error("Error updating user:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

// DELETE user
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        console.log("Deleting user:", id);

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

        // Delete user
        await prisma.user.delete({
            where: { id },
        });

        console.log("User deleted:", id);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error deleting user:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
