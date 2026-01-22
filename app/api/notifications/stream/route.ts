import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import { prisma } from '@/src/infrastructure/db/prismaClient';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    console.log('SSE Stream Connection Attempt');
    const session = await getSession();
    if (!session?.userId) {
        console.warn('SSE Connection Rejected: No session');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`SSE Stream Connected for user: ${session.userId}`);
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            // Send initial connection message
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'CONNECTED' })}\n\n`));

            let lastCheck = new Date();

            // Minimal polling mechanism to simulate real-time push
            const interval = setInterval(async () => {
                try {
                    // Check for new notifications created since last check
                    const newNotifications = await prisma.notification.findMany({
                        where: {
                            userId: session.userId,
                            createdAt: { gt: lastCheck },
                            read: false // Only push unread
                        },
                        orderBy: { createdAt: 'asc' }
                    });

                    if (newNotifications.length > 0) {
                        lastCheck = new Date();
                        // Push each new notification
                        for (const note of newNotifications) {
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify(note)}\n\n`));
                        }
                    } else {
                        // Keep-alive comment to prevent timeout - mandatory for some browsers/proxies
                        controller.enqueue(encoder.encode(': keep-alive\n\n'));
                    }
                } catch (error) {
                    console.error('SSE Error checking DB:', error);
                }
            }, 3000); // Check every 3 seconds

            // Cleanup on close
            request.signal.addEventListener('abort', () => {
                clearInterval(interval);
                controller.close();
            });
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
        },
    });
}
