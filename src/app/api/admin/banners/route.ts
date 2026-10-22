import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Banner, { UserBannerSection, BannerAppType } from '@/models/banner';
import { uploadFile } from '@/lib/uploadFile';

export const dynamic = 'force-dynamic';

const DEFAULT_USER_BANNERS = [
  // 1. Intro Screen (Onboarding walkthrough slides)
  {
    appType: 'user' as BannerAppType,
    section: 'intro_screen' as UserBannerSection,
    title: '',
    subtitle: '',
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
    actionUrl: '/onboarding/step-1',
    order: 1,
    isActive: true,
  },
  {
    appType: 'user' as BannerAppType,
    section: 'intro_screen' as UserBannerSection,
    title: '',
    subtitle: '',
    imageUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80',
    actionUrl: '/onboarding/step-2',
    order: 2,
    isActive: true,
  },
  {
    appType: 'user' as BannerAppType,
    section: 'intro_screen' as UserBannerSection,
    title: '',
    subtitle: '',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    actionUrl: '/onboarding/step-3',
    order: 3,
    isActive: true,
  },

  // 2. Home Screen - Hero Section (Top Carousel)
  {
    appType: 'user' as BannerAppType,
    section: 'home_hero' as UserBannerSection,
    title: '',
    subtitle: '',
    imageUrl: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80',
    actionUrl: '/booking/driver?coupon=LUXE50',
    order: 1,
    isActive: true,
  },
  {
    appType: 'user' as BannerAppType,
    section: 'home_hero' as UserBannerSection,
    title: '',
    subtitle: '',
    imageUrl: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=1200&q=80',
    actionUrl: '/booking/outstation',
    order: 2,
    isActive: true,
  },
  {
    appType: 'user' as BannerAppType,
    section: 'home_hero' as UserBannerSection,
    title: '',
    subtitle: '',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    actionUrl: '/booking/valet',
    order: 3,
    isActive: true,
  },

  // 3. Home Screen - Middle Section (Mid-Feed Promo)
  {
    appType: 'user' as BannerAppType,
    section: 'home_middle' as UserBannerSection,
    title: '',
    subtitle: '',
    imageUrl: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80',
    actionUrl: '/booking/driver?type=night',
    order: 1,
    isActive: true,
  },
  {
    appType: 'user' as BannerAppType,
    section: 'home_middle' as UserBannerSection,
    title: '',
    subtitle: '',
    imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
    actionUrl: '/corporate-enquiry',
    order: 2,
    isActive: true,
  },
];

const DEFAULT_DRIVER_BANNERS = [
  // 1. Intro Screen
  {
    appType: 'driver' as BannerAppType,
    section: 'intro_screen' as UserBannerSection,
    title: 'Drive & Earn On Your Terms',
    subtitle: 'Flexible hours, instant daily payouts, and verified rental trips.',
    imageUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80',
    actionUrl: '/driver-onboarding',
    order: 1,
    isActive: true,
  },
  {
    appType: 'driver' as BannerAppType,
    section: 'intro_screen' as UserBannerSection,
    title: 'Zero Commission First Month',
    subtitle: 'Keep 100% of your earnings when you join our elite driver partner team.',
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
    actionUrl: '/driver-benefits',
    order: 2,
    isActive: true,
  },
  // 2. Home Hero
  {
    appType: 'driver' as BannerAppType,
    section: 'home_hero' as UserBannerSection,
    title: 'Weekend Surge Bonuses Live',
    subtitle: 'Earn up to 2.5x per kilometer during prime business hours.',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    actionUrl: '/driver-incentives',
    order: 1,
    isActive: true,
  },
  // 3. Home Middle
  {
    appType: 'driver' as BannerAppType,
    section: 'home_middle' as UserBannerSection,
    title: 'Comprehensive Driver Insurance & Safety',
    subtitle: 'Complete 24x7 roadside assistance and passenger coverage on all trips.',
    imageUrl: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80',
    actionUrl: '/driver-safety',
    order: 1,
    isActive: true,
  },
];

type BannerFilter = Record<string, any>;

function getAppTypeFilter(appType: BannerAppType): BannerFilter {
  return appType === 'user'
    ? { $or: [{ appType: 'user' }, { appType: { $exists: false } }] }
    : { appType: 'driver' };
}

// GET: Fetch banners (filter by appType: 'user' | 'driver' and section: 'intro_screen' | 'home_hero' | 'home_middle')
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const section = searchParams.get('section');
  const rawAppType = searchParams.get('appType');
  const appType: BannerAppType = rawAppType === 'driver' ? 'driver' : 'user';

  try {
    await connectToDatabase();

    const seedTarget = appType === 'driver' ? DEFAULT_DRIVER_BANNERS : DEFAULT_USER_BANNERS;

    const countFilter: BannerFilter = {
      ...getAppTypeFilter(appType),
      section: { $in: ['intro_screen', 'home_hero', 'home_middle'] },
    };

    const count = await Banner.countDocuments(countFilter);

    if (count === 0) {
      try {
        await Banner.insertMany(seedTarget);
      } catch (seedErr) {
        console.warn('Banner seed error:', seedErr);
      }
    }

    const query: any = {
      ...getAppTypeFilter(appType),
      ...(section && ['intro_screen', 'home_hero', 'home_middle'].includes(section)
        ? { section }
        : { section: { $in: ['intro_screen', 'home_hero', 'home_middle'] } }),
    };

    const banners = await Banner.find(query).sort({ section: 1, order: 1, createdAt: -1 });

    const formatted = banners.map((b: any) => ({
      id: b._id.toString(),
      _id: b._id.toString(),
      appType: b.appType || 'user',
      section: b.section,
      title: b.title || '',
      subtitle: b.subtitle || '',
      imageUrl: b.imageUrl,
      actionUrl: b.actionUrl || '',
      order: b.order || 1,
      isActive: b.isActive !== undefined ? b.isActive : true,
      createdAt: b.createdAt?.toISOString(),
      updatedAt: b.updatedAt?.toISOString(),
    }));

    return NextResponse.json({ success: true, banners: formatted });
  } catch (error: any) {
    console.error('Error fetching banners:', error);
    const defaults = appType === 'driver' ? DEFAULT_DRIVER_BANNERS : DEFAULT_USER_BANNERS;
    const filteredDefaults = section
      ? defaults.filter((b) => b.section === section)
      : defaults;
    const fallback = filteredDefaults.map((b, idx) => ({
      ...b,
      id: `fallback-${b.appType}-${b.section}-${idx + 1}`,
      _id: `fallback-${b.appType}-${b.section}-${idx + 1}`,
    }));
    return NextResponse.json({ success: true, banners: fallback, isFallback: true });
  }
}

// POST: Add new banner(s) - Strictly image files, no title needed
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const contentType = req.headers.get('content-type') || '';

    // Check if multipart form data (multiple file uploads)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const rawAppType = formData.get('appType') as string;
      const appType: BannerAppType = rawAppType === 'driver' ? 'driver' : 'user';

      const rawSection = formData.get('section') as string;
      const section: UserBannerSection = (['intro_screen', 'home_hero', 'home_middle'].includes(rawSection)
        ? rawSection
        : 'home_hero') as UserBannerSection;

      // Get all uploaded image files
      const files = formData.getAll('images') as File[];
      const singleFile = formData.get('image') as File | null;
      const allFiles = files.length > 0 ? files : singleFile ? [singleFile] : [];

      const title = (formData.get('title') as string) || '';
      const subtitle = (formData.get('subtitle') as string) || '';
      const actionUrl = (formData.get('actionUrl') as string) || '';
      const directUrl = formData.get('imageUrl') as string;

      // Current max order in this section & appType
      const existingCount = await Banner.countDocuments({
        ...getAppTypeFilter(appType),
        section,
      });
      let currentOrder = existingCount + 1;

      const createdBanners: any[] = [];

      // 1. Process uploaded files
      if (allFiles.length > 0) {
        for (const file of allFiles) {
          if (!file || typeof file === 'string' || file.size === 0) continue;

          // STRICT CHECK: ONLY IMAGES ALLOWED
          if (!file.type.startsWith('image/')) {
            return NextResponse.json(
              { success: false, error: `Invalid file "${file.name}". Only image files (PNG, JPG, JPEG, WEBP, GIF) are accepted.` },
              { status: 400 }
            );
          }

          const fileUrl = await uploadFile(file);
          if (fileUrl) {
            const newBanner: any = await Banner.create({
              appType,
              section,
              title: title || '',
              subtitle: subtitle || '',
              imageUrl: fileUrl,
              actionUrl: actionUrl || '',
              order: currentOrder++,
              isActive: true,
            });

            createdBanners.push({
              id: newBanner._id.toString(),
              _id: newBanner._id.toString(),
              appType: newBanner.appType || 'user',
              section: newBanner.section,
              title: newBanner.title || '',
              subtitle: newBanner.subtitle || '',
              imageUrl: newBanner.imageUrl,
              actionUrl: newBanner.actionUrl || '',
              order: newBanner.order,
              isActive: newBanner.isActive,
              createdAt: newBanner.createdAt?.toISOString(),
            });
          }
        }
      } else if (directUrl) {
        // Direct image URL
        const newBanner: any = await Banner.create({
          appType,
          section,
          title: title || '',
          subtitle: subtitle || '',
          imageUrl: directUrl.trim(),
          actionUrl: actionUrl || '',
          order: currentOrder,
          isActive: true,
        });

        createdBanners.push({
          id: newBanner._id.toString(),
          _id: newBanner._id.toString(),
          appType: newBanner.appType || 'user',
          section: newBanner.section,
          title: newBanner.title || '',
          subtitle: newBanner.subtitle || '',
          imageUrl: newBanner.imageUrl,
          actionUrl: newBanner.actionUrl || '',
          order: newBanner.order,
          isActive: newBanner.isActive,
          createdAt: newBanner.createdAt?.toISOString(),
        });
      } else {
        return NextResponse.json(
          { success: false, error: 'Please select one or more image files to upload.' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        banners: createdBanners,
        message: `Successfully uploaded ${createdBanners.length} image banner(s).`,
      });
    }

    // JSON Body Payload
    const body = await req.json();
    const appType: BannerAppType = body.appType === 'driver' ? 'driver' : 'user';
    const rawSection = body.section;
    const section: UserBannerSection = (['intro_screen', 'home_hero', 'home_middle'].includes(rawSection)
      ? rawSection
      : 'home_hero') as UserBannerSection;

    const { imageUrl, actionUrl, title, subtitle } = body;

    if (!imageUrl) {
      return NextResponse.json({ success: false, error: 'Image URL is required.' }, { status: 400 });
    }

    const count = await Banner.countDocuments({
      ...getAppTypeFilter(appType),
      section,
    });
    const newBanner: any = await Banner.create({
      appType,
      section,
      title: title || '',
      subtitle: subtitle || '',
      imageUrl: imageUrl.trim(),
      actionUrl: actionUrl || '',
      order: count + 1,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      banner: {
        id: newBanner._id.toString(),
        _id: newBanner._id.toString(),
        appType: newBanner.appType || 'user',
        section: newBanner.section,
        title: newBanner.title || '',
        subtitle: newBanner.subtitle || '',
        imageUrl: newBanner.imageUrl,
        actionUrl: newBanner.actionUrl || '',
        order: newBanner.order,
        isActive: newBanner.isActive,
        createdAt: newBanner.createdAt?.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/banners:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to upload banners' }, { status: 500 });
  }
}

// PUT: Batch reorder or toggle active
export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    if (body.action === 'reorder' && Array.isArray(body.items)) {
      // items = [{ id, order }]
      for (const item of body.items) {
        if (item.id) {
          await Banner.findByIdAndUpdate(item.id, { order: Number(item.order) || 1 });
        }
      }
      return NextResponse.json({ success: true, message: 'Banners reordered successfully.' });
    }

    return NextResponse.json({ success: false, error: 'Invalid action.' }, { status: 400 });
  } catch (error: any) {
    console.error('Error reordering banners:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
