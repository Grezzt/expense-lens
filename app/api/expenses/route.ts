import { NextRequest, NextResponse } from 'next/server';
import {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
} from '@/lib/supabase';

// GET all expenses or by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const expense = await getExpenseById(id);
      return NextResponse.json({ success: true, expense });
    }

    const expenses = await getAllExpenses();
    return NextResponse.json({ success: true, expenses });
  } catch (error) {
    console.error('GET expenses error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

// POST create new expense
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const expense = await createExpense({
      organization_id: data.organization_id,
      created_by: data.created_by,
      image_url: data.image_url,
      merchant_name: data.merchant_name,
      amount: data.amount,
      category: data.category,
      date: data.date,
      status: data.status || 'DRAFT',
      raw_data: data.raw_data || {},
    });

    return NextResponse.json({ success: true, expense });
  } catch (error) {
    console.error('POST expense error:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}

// PATCH update expense
export async function PATCH(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Expense ID is required' },
        { status: 400 }
      );
    }

    const expense = await updateExpense(id, updates);
    return NextResponse.json({ success: true, expense });
  } catch (error) {
    console.error('PATCH expense error:', error);
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    );
  }
}

// DELETE expense
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Expense ID is required' },
        { status: 400 }
      );
    }

    await deleteExpense(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE expense error:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    );
  }
}
