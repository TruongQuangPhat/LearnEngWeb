import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { testId, timeTaken, score, maxScore, answers } = await req.json();

    // 1. Verify User Session (Simple mock using headers or finding the first user for demo purposes)
    // In actual production, we extract the user from Supabase session using Next.js Auth helpers.
    const user = await prisma.profile.findFirst();
    if (!user) {
      return NextResponse.json({ error: "User profile not found. Please log in." }, { status: 401 });
    }

    // 2. Ensure test exists (or insert a demo test)
    let mockTest = await prisma.mockTest.findUnique({ where: { id: testId } });
    if (!mockTest) {
      // Create a dummy one just so relations don't fail during this dev test
      mockTest = await prisma.mockTest.create({
        data: {
          title: "Demo Placement Test",
          examType: "general",
          totalQuestions: 10,
          totalPoints: 100,
          timeLimitMinutes: 10,
          testStructure: { sections: [] }
        }
      });
    }

    // 3. Save Attempt
    const attempt = await prisma.mockTestAttempt.create({
      data: {
        userId: user.id,
        mockTestId: mockTest.id,
        status: "completed",
        timeSpentSeconds: timeTaken,
        userAnswers: answers,
        totalScore: score,
        totalPossible: maxScore,
        percentage: (score / maxScore) * 100,
        completedAt: new Date(),
        sectionScores: {},
        aiFeedback: {
          summary: "Great job completing the mock test! Your reading comprehension is strong."
        }
      }
    });

    return NextResponse.json({ success: true, attemptId: attempt.id });
  } catch (error) {
    console.error("Error saving mock exam attempt:", error);
    return NextResponse.json({ error: "Failed to save attempt" }, { status: 500 });
  }
}
