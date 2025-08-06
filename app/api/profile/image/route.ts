import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Upload profile image
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const image = formData.get('image') as File;
    const userId = formData.get('userId') as string;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Validate file type
    if (!image.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (image.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size too large' }, { status: 400 });
    }

    // Validate user authorization
    if (userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized to update this profile' }, { status: 403 });
    }

    // In a real implementation, you would:
    // 1. Save the file to a storage service (AWS S3, Cloudinary, etc.)
    // 2. Generate optimized versions (thumbnails, different sizes)
    // 3. Update the user's profile in the database
    // 4. Return the URL of the uploaded image

    // Mock implementation - generate a temporary URL
    const mockImageUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

    // Mock response simulating successful upload
    const response = {
      success: true,
      imageUrl: mockImageUrl,
      uploadedAt: new Date().toISOString(),
      fileSize: image.size,
      fileName: image.name
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete profile image
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Validate user authorization
    if (userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized to update this profile' }, { status: 403 });
    }

    // Mock deletion - in real implementation, this would:
    // 1. Delete the image from storage service
    // 2. Update the user's profile in the database to remove image reference
    // 3. Clean up any cached versions

    return NextResponse.json({
      success: true,
      message: 'Profile image deleted successfully',
      deletedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}