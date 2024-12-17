import { db } from '@/shared/db';
import { tasks, taskEvents } from '@/shared/db/schema';
import { eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { eventType, description } = body;

    await db.transaction(async (tx) => {
      // 이벤트 기록
      await tx.insert(taskEvents).values({
        task_id: params.id,
        event_type: eventType,
        description
      });

      // 중단 이벤트인 경우 interruption_count 증가
      if (eventType === 'INTERRUPTED') {
        await tx
          .update(tasks)
          .set({ 
            interruption_count: sql`interruption_count + 1` 
          })
          .where(eq(tasks.id, params.id));
      }
    });

    return NextResponse.json({ message: 'Event recorded successfully' });
  } catch (error) {
    console.error('Error recording event:', error);
    return NextResponse.json(
      { error: 'Failed to record event' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const events = await db
      .select()
      .from(taskEvents)
      .where(eq(taskEvents.task_id, params.id))
      .orderBy(taskEvents.created_at);

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching task events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task events' },
      { status: 500 }
    );
  }
} 