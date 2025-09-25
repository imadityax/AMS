import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assignedToId, title, description, status, dueDate } = await request.json();

    // Verify that the assigned user is under the current manager
    const assignedUser = await prisma.user.findFirst({
      where: {
        id: assignedToId,
        managerId: user.id
      }
    });

    if (!assignedUser) {
      return NextResponse.json({ error: 'Invalid team member' }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'pending',
        assignedToId,
      }
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}