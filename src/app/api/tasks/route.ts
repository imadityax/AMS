// src/app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch tasks for the current user
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch tasks where the current user is assigned to - EXCLUDE createdAt from selection
    const tasks = await prisma.task.findMany({
      where: {
        assignedToId: user.id
      },
      select: { // ✅ Use select instead of include to control exactly what fields we get
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        assignedToId: true,
        createdById: true,
        // ✅ Don't select createdAt and updatedAt to avoid the null error
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            department: true
          }
        }
      },
      orderBy: {
        // We can't order by createdAt since we're not selecting it, so order by id instead
        id: 'desc'
      }
    });

    // Transform the data to match your frontend interface
    const transformedTasks = tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      assigner: {
        id: task.createdBy?.id || 'unknown',
        name: task.createdBy?.name || 'Unknown Manager',
        avatar: task.createdBy?.name ? task.createdBy.name.charAt(0).toUpperCase() : 'U',
        department: task.createdBy?.department || 'Management'
      },
      dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: (task.priority as 'low' | 'medium' | 'high' | 'urgent') || 'medium',
      status: (task.status as 'todo' | 'in-progress' | 'review' | 'completed') || 'todo',
      createdAt: new Date().toISOString() // ✅ Use current date as fallback
    }));

    return NextResponse.json(transformedTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new task
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assignedToId, title, description, status, dueDate, priority } = await request.json();

    // Verify that the assigned user is under the current manager
    const managerRelation = await prisma.userManager.findFirst({
      where: {
        userId: assignedToId,
        managerId: user.id
      }
    });

    if (!managerRelation) {
      return NextResponse.json(
        { error: 'You can only assign tasks to your team members' },
        { status: 403 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'todo',
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        assignedToId,
        createdById: user.id
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true
        // Don't select createdAt/updatedAt
      }
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}