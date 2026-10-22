import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Banner from '@/models/banner';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(req.url);
        const section = searchParams.get('section');

        // Strictly query active User App banners (including legacy documents where appType is not set)
        const query: any = {
            isActive: true,
            $or: [{ appType: 'user' }, { appType: { $exists: false } }],
        };

        if (section && ['intro_screen', 'home_hero', 'home_middle'].includes(section)) {
            query.section = section;
        }

        const banners = await Banner.find(query).sort({ section: 1, order: 1 });

        const formatted = banners.map((b) => ({
            id: b._id.toString(),
            appType: 'user',
            section: b.section,
            title: b.title || '',
            subtitle: b.subtitle || '',
            imageUrl: b.imageUrl,
            actionUrl: b.actionUrl || '',
            order: b.order || 1,
        }));

        // If specific section requested, return array directly
        if (section) {
            return NextResponse.json({
                success: true,
                count: formatted.length,
                data: {
                    banners: formatted,
                },
                banners: formatted,
            });
        }

        // Return all active user banners grouped by section (intro_screen, home_hero, home_middle)
        const grouped = {
            intro_screen: formatted.filter((b) => b.section === 'intro_screen'),
            // home_hero: formatted.filter((b) => b.section === 'home_hero'),
            // home_middle: formatted.filter((b) => b.section === 'home_middle'),
        };

        return NextResponse.json({
            success: true,
            data: {
                banners: grouped,
            },
        });
    } catch (error: any) {
        console.error('Error fetching user app banners:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}