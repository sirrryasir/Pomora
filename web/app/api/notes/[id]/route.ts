import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content } = await request.json();
    if (!content) {
        return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    try {
        const data = await prisma.note.update({
            where: {
                id,
                userId: session.user.id,
            },
            data: { content },
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error(`[API/NOTES/PATCH/${id}] Database Error:`, error);
        return NextResponse.json({ error: 'Note not found or access denied' }, { status: 404 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await prisma.note.delete({
            where: {
                id,
                userId: session.user.id,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(`[API/NOTES/DELETE/${id}] Database Error:`, error);
        return NextResponse.json({ error: 'Note not found or access denied' }, { status: 404 });
    }
}
