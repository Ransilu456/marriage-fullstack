import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import { prisma } from '@/src/infrastructure/db/prismaClient';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    console.log('SSE Stream Connection Attempt');

    // Pass the request to getSession for better reliability in Route Handlers
    const session = await getSession(request);

    if (!session?.userId) {
        console.warn('SSE Connection Rejected: No session');
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    console.log(`SSE Stream Connected for user: ${session.userId}`);
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            // Immediate heartbeat to establish connection and prevent early timeouts
            controller.enqueue(encoder.encode(': heartbeat\n\n'));

            // Send connection confirmation
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'CONNECTED' })}\n\n`));

            let lastCheck = new Date();

            const interval = setInterval(async () => {
                try {
                    const newNotifications = await prisma.notification.findMany({
                        where: {
                            userId: session.userId,
                            createdAt: { gt: lastCheck },
                            read: false
                        },
                        orderBy: { createdAt: 'asc' }
                    });

                    if (newNotifications.length > 0) {
                        lastCheck = new Date();
                        for (const note of newNotifications) {
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify(note)}\n\n`));
                        }
                    } else {
                        // Regular keep-alive
                        controller.enqueue(encoder.encode(': keep-alive\n\n'));
                    }
                } catch (error) {
                    console.error('SSE Error checking DB:', error);
                }
            }, 5000); // Polling every 5 seconds for balance

            request.signal.addEventListener('abort', () => {
                console.log(`SSE Stream Disconnected for user: ${session.userId}`);
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
            'X-Accel-Buffering': 'no', // Disable buffering for Nginx/Vercel
        },
    });
}
