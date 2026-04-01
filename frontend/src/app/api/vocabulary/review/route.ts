import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
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

    const { reviewId, quality } = await request.json(); // quality from 0 to 5

    if (quality < 0 || quality > 5) {
      return NextResponse.json({ error: 'Quality must be between 0 and 5' }, { status: 400 });
    }

    // Fetch the review entry
    const review = await prisma.userFlashcardReview.findUnique({
      where: { id: reviewId }
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Ensure user owns this review
    if (review.userId !== profileId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    let { repetitions, easinessFactor, intervalDays } = review;
    
    // SM-2 Algorithm Implementation
    if (quality >= 3) {
      if (repetitions === 0) {
        intervalDays = 1;
      } else if (repetitions === 1) {
        intervalDays = 6;
      } else {
        intervalDays = Math.round(intervalDays * easinessFactor);
      }
      repetitions += 1;
    } else {
      repetitions = 0;
      intervalDays = 1;
    }

    easinessFactor = easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easinessFactor < 1.3) easinessFactor = 1.3;

    // Calculate next review date
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays);

    const updatedReview = await prisma.userFlashcardReview.update({
      where: { id: reviewId },
      data: {
        repetitions,
        easinessFactor,
        intervalDays,
        nextReviewDate,
        lastQuality: quality,
        totalReviews: review.totalReviews + 1,
        correctCount: quality >= 3 ? review.correctCount + 1 : review.correctCount,
        incorrectCount: quality < 3 ? review.incorrectCount + 1 : review.incorrectCount,
        lastReviewedAt: new Date(),
        status: quality >= 3 ? 'learning' : 'relearning'
      }
    });

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error('Error processing SM-2 review:', error);
    return NextResponse.json({ error: 'Failed to process review' }, { status: 500 });
  }
}
