import { NextResponse } from "next/server";
import { seedPermissions, assignDefaultRolePermissions } from "@/lib/seedPermissions";

// POST /api/permissions/seed - Seed permissions (SuperAdmin only)
export async function POST() {
    try {
        // TODO: Add SuperAdmin authentication check here
        // For now, we'll allow this endpoint to be called

        await seedPermissions();
        await assignDefaultRolePermissions();

        return NextResponse.json({
            success: true,
            message: "Permissions seeded successfully"
        });
    } catch (error: any) {
        console.error("Error seeding permissions:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
