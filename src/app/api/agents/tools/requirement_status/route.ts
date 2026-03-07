import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/database/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { site_id, instance_id, asset_id, requirement_id, repo_url, status, message } = body;

    if (!site_id || !instance_id || !asset_id || !requirement_id || !status) {
      return NextResponse.json(
        { success: false, error: 'site_id, instance_id, asset_id, requirement_id, and status are required' },
        { status: 400 }
      );
    }

    // Insert into requirement_progress table (or requirement_status)
    const { data, error } = await supabaseAdmin
      .from('requirement_status')
      .insert([
        {
          site_id,
          instance_id,
          asset_id,
          requirement_id,
          repo_url: repo_url || null,
          status,
          message: message || null,
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Error inserting requirement status: ${error.message}`);
    }

    // Optional: update the general status of the requirement in the requirements table
    if (status === 'completed' || status === 'done' || status === 'in-progress') {
      const mappedStatus = status === 'in-progress' ? 'in-progress' : (status === 'completed' || status === 'done' ? 'done' : undefined);
      if (mappedStatus) {
        await supabaseAdmin
          .from('requirements')
          .update({ status: mappedStatus, updated_at: new Date().toISOString() })
          .eq('id', requirement_id);
      }
    }

    return NextResponse.json({
      success: true,
      data
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error in requirement_status tool:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const requirement_id = url.searchParams.get('requirement_id');
    const instance_id = url.searchParams.get('instance_id');

    let query = supabaseAdmin.from('requirement_status').select('*');

    if (requirement_id) {
      query = query.eq('requirement_id', requirement_id);
    }
    if (instance_id) {
      query = query.eq('instance_id', instance_id);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error getting requirement status: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error: any) {
    console.error('Error getting requirement_status:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
