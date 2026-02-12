import ExcelJS from 'exceljs';
import { Expense } from './supabase';

/**
 * Generate Excel report from expenses
 */
export async function generateExcelReport(expenses: Expense[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Expenses Report');

  // Set column headers
  worksheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Merchant', key: 'merchant_name', width: 30 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Amount (IDR)', key: 'amount', width: 15 },
    { header: 'Status', key: 'status', width: 12 },
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true, size: 12 };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0EA5E9' },
  };
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  // Add data rows
  expenses.forEach((expense) => {
    worksheet.addRow({
      date: new Date(expense.date).toLocaleDateString('id-ID'),
      merchant_name: expense.merchant_name,
      category: expense.category,
      amount: expense.amount,
      status: expense.status,
    });
  });

  // Add total row
  const totalRow = worksheet.addRow({
    date: '',
    merchant_name: '',
    category: 'TOTAL',
    amount: expenses.reduce((sum, e) => sum + e.amount, 0),
    status: '',
  });
  totalRow.font = { bold: true };
  totalRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0F2FE' },
  };

  // Format amount column as currency
  worksheet.getColumn('amount').numFmt = '#,##0';

  // Auto-fit columns
  worksheet.columns.forEach((column) => {
    if (column.header) {
      column.alignment = { vertical: 'middle', horizontal: 'left' };
    }
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * Get summary statistics for expenses
 */
export function getExpenseSummary(expenses: Expense[]) {
  const verified = expenses.filter((e) => e.status === 'VERIFIED');
  const draft = expenses.filter((e) => e.status === 'DRAFT');

  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalExpenses: expenses.length,
    verifiedCount: verified.length,
    draftCount: draft.length,
    totalAmount: expenses.reduce((sum, e) => sum + e.amount, 0),
    verifiedAmount: verified.reduce((sum, e) => sum + e.amount, 0),
    categoryBreakdown: categoryTotals,
  };
}
