import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all users (with hierarchy)
// GET all users (with hierarchy)
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: { manager: true, employees: true },
    });

    // Map users into a clean shape
    const formatted = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      managerId: u.managerId,
      managerName: u.manager ? u.manager.name : null,
    }));

    return NextResponse.json({ users: formatted });
  } catch (error: any) {
    return NextResponse.json(
      { users: [], error: error.message },
      { status: 500 }
    );
  }
}


// POST new user
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Simple validation
    if (!body.name || !body.email || !body.password || !body.role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Ensure email uniqueness
    const exists = await prisma.user.findUnique({ where: { email: body.email } });
    if (exists) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: body.password, // ⚠️ hash later with bcrypt
        role: body.role,
        managerId: body.managerId || null,
      },
    });

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
