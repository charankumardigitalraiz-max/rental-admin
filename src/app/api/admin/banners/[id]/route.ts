import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Banner from '@/models/banner';
import { uploadFile } from '@/lib/uploadFile';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const banner = await Banner.findById(id);
    if (!banner) {
      return NextResponse.json({ success: false, error: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      banner: {
        id: banner._id.toString(),
        _id: banner._id.toString(),
        section: banner.section,
        title: banner.title,
        subtitle: banner.subtitle,
        imageUrl: banner.imageUrl,
        actionUrl: banner.actionUrl,
        order: banner.order,
        isActive: banner.isActive,
        createdAt: banner.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const contentType = req.headers.get('content-type') || '';
    let updateData: any = {};

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const imageFile = formData.get('image') as File | null;

      if (imageFile && typeof imageFile !== 'string' && imageFile.size > 0) {
        if (!imageFile.type.startsWith('image/')) {
          return NextResponse.json(
            { success: false, error: 'Only image files are accepted.' },
            { status: 400 }
          );
        }
        const uploadedUrl = await uploadFile(imageFile);
        if (uploadedUrl) {
          updateData.imageUrl = uploadedUrl;
        }
      }

      if (formData.has('title')) updateData.title = formData.get('title') as string;
      if (formData.has('subtitle')) updateData.subtitle = formData.get('subtitle') as string;
      if (formData.has('actionUrl')) updateData.actionUrl = formData.get('actionUrl') as string;
      if (formData.has('section')) updateData.section = formData.get('section') as string;
      if (formData.has('order')) updateData.order = Number(formData.get('order'));
      if (formData.has('isActive')) updateData.isActive = formData.get('isActive') === 'true';
    } else {
      updateData = await req.json();
    }

    const updated = await Banner.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      banner: {
        id: updated._id.toString(),
        _id: updated._id.toString(),
        section: updated.section,
        title: updated.title,
        subtitle: updated.subtitle,
        imageUrl: updated.imageUrl,
        actionUrl: updated.actionUrl,
        order: updated.order,
        isActive: updated.isActive,
        createdAt: updated.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const deleted = await Banner.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Banner removed successfully.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
