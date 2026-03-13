import { NextRequest, NextResponse } from 'next/server';
import { getRequirementStatuses } from '../../../../../lib/database/requirement-db';
import { z } from 'zod';

const GetRequirementStatusesSchema = z.object({
  requirement_id: z.string().uuid(),
  site_id: z.string().uuid().optional(),
  instance_id: z.string().uuid().optional(),
  status: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      requirement_id: id,
      site_id: searchParams.get('site_id') || undefined,
      instance_id: searchParams.get('instance_id') || undefined,
      status: searchParams.get('status') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
    };

    const validatedFilters = GetRequirementStatusesSchema.parse(filters);

    const { statuses, total, hasMore } = await getRequirementStatuses(validatedFilters);

    return NextResponse.json({
      success: true,
      data: {
        statuses,
        pagination: {
          total,
          count: statuses.length,
          has_more: hasMore,
          limit: validatedFilters.limit,
          offset: validatedFilters.offset,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching requirement statuses:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
