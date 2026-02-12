import { NextRequest, NextResponse } from 'next/server';
import { getAllExpenses, getExpensesByStatus } from '@/lib/supabase';
import { generateExcelReport, getExpenseSummary } from '@/lib/export';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'VERIFIED' | 'DRAFT' | null;
    const format = searchParams.get('format') || 'excel';

    const expenses = status
      ? await getExpensesByStatus(status)
      : await getAllExpenses();

    if (format === 'excel') {
      const buffer = await generateExcelReport(expenses);

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="expense-report-${new Date().toISOString().split('T')[0]}.xlsx"`,
        },
      });
    }

    if (format === 'summary') {
      const summary = getExpenseSummary(expenses);
      return NextResponse.json({ success: true, summary });
    }

    return NextResponse.json(
      { error: 'Invalid format' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
