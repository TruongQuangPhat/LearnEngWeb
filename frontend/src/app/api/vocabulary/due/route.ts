import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Fallback for development if no user is signed in
    let profileId = user?.id;
    if (!profileId) {
      const firstProfile = await prisma.profile.findFirst();
      if (!firstProfile) {
         return NextResponse.json({ error: 'Unauthorized and no test profile found' }, { status: 401 });
      }
      profileId = firstProfile.id;
    }

    const dueReviews = await prisma.userFlashcardReview.findMany({
      where: {
        userId: profileId,
        nextReviewDate: {
          lte: new Date()
        }
      },
      include: {
        vocabularyItem: true
      },
      orderBy: {
        nextReviewDate: 'asc'
      },
      take: 20
    });
    
    return NextResponse.json(dueReviews);
  } catch (error) {
    console.error('Error fetching due reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch due reviews' }, { status: 500 });
  }
}
