import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Banner from '@/models/banner';

export const dynamic = 'force-dynamic';

// GET /api/user/banners?section=intro_screen (or home_hero, home_middle, or all)
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const section = searchParams.get('section');

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
      section: b.section,
      title: b.title || '',
      subtitle: b.subtitle || '',
      imageUrl: b.imageUrl,
      actionUrl: b.actionUrl || '',
      order: b.order || 1,
    }));

    // If section requested, return array; if all requested, group by section
    if (section) {
      return NextResponse.json({ success: true, count: formatted.length, banners: formatted });
    }

    const grouped = {
      intro_screen: formatted.filter((b) => b.section === 'intro_screen'),
      home_hero: formatted.filter((b) => b.section === 'home_hero'),
      home_middle: formatted.filter((b) => b.section === 'home_middle'),
    };

    return NextResponse.json({ success: true, banners: grouped });
  } catch (error: any) {
    console.error('Error fetching user app banners:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
