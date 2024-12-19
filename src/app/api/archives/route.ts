import { NextResponse } from 'next/server';
import { VideoSummary } from '@/types/index';

// TODO: Replace this with actual database integration
const mockSummaries: VideoSummary[] = [];

export async function GET() {
  try {
    // In a real app, you would fetch from a database here
    return NextResponse.json(mockSummaries);
  } catch (error) {
    console.error('Error fetching archives:', error);
    return NextResponse.json(
      { error: 'Failed to fetch archives' },
      { status: 500 }
    );
  }
}
