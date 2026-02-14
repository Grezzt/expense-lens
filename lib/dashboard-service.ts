import { supabase } from './supabase';

export interface DashboardStats {
  totalExpense: number;
  dailyAverage: number;
  pendingCount: number;
  flaggedCount: number;
  totalChange: number;
}

export interface SpendingTrendData {
  date: string;
  amount: number;
}

export interface CategoryAllocation {
  name: string;
  value: number;
  color: string;
}

export async function getDashboardStats(
  organizationId: string,
  dateFilter: 'today' | 'week' | 'month' | 'quarter'
): Promise<DashboardStats> {
  try {
    const { startDate, endDate } = getDateRange(dateFilter);

    // Get total expense for current period
    const { data: currentExpenses, error: currentError } = await supabase
      .from('expenses')
      .select('amount')
      .eq('organization_id', organizationId)
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString());

    if (currentError) throw currentError;

    const totalExpense = currentExpenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;

    // Get previous period for comparison
    const { startDate: prevStart, endDate: prevEnd } = getPreviousPeriod(dateFilter);
    const { data: prevExpenses } = await supabase
      .from('expenses')
      .select('amount')
      .eq('organization_id', organizationId)
      .gte('date', prevStart.toISOString())
      .lte('date', prevEnd.toISOString());

    const prevTotal = prevExpenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
    const totalChange = prevTotal > 0 ? ((totalExpense - prevTotal) / prevTotal) * 100 : 0;

    // Calculate daily average
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const dailyAverage = days > 0 ? totalExpense / days : 0;

    // Get pending count
    const { count: pendingCount } = await supabase
      .from('expenses')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('status', 'DRAFT');

    // Get flagged count (you'll need to add a flagged field or use a different logic)
    const { count: flaggedCount } = await supabase
      .from('expenses')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('status', 'FLAGGED');

    return {
      totalExpense,
      dailyAverage,
      pendingCount: pendingCount || 0,
      flaggedCount: flaggedCount || 0,
      totalChange: Math.round(totalChange * 10) / 10,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}

export async function getSpendingTrend(
  organizationId: string,
  dateFilter: 'today' | 'week' | 'month' | 'quarter'
): Promise<SpendingTrendData[]> {
  try {
    const { startDate, endDate } = getDateRange(dateFilter);

    const { data, error } = await supabase
      .from('expenses')
      .select('date, amount')
      .eq('organization_id', organizationId)
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .order('date', { ascending: true });

    if (error) throw error;

    // Group by date
    const grouped = data?.reduce((acc: Record<string, number>, exp) => {
      const date = new Date(exp.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      acc[date] = (acc[date] || 0) + exp.amount;
      return acc;
    }, {});

    return Object.entries(grouped || {}).map(([date, amount]) => ({
      date,
      amount,
    }));
  } catch (error) {
    console.error('Error fetching spending trend:', error);
    return [];
  }
}

export async function getCategoryAllocation(
  organizationId: string,
  dateFilter: 'today' | 'week' | 'month' | 'quarter'
): Promise<CategoryAllocation[]> {
  try {
    const { startDate, endDate } = getDateRange(dateFilter);

    const { data, error } = await supabase
      .from('expenses')
      .select(`
        amount,
        category_id,
        categories:category_id (
          name
        )
      `)
      .eq('organization_id', organizationId)
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString());

    if (error) throw error;

    // Group by category
    const grouped = data?.reduce((acc: Record<string, number>, exp: any) => {
      const categoryName = exp.categories?.name || exp.category || 'Others';
      acc[categoryName] = (acc[categoryName] || 0) + exp.amount;
      return acc;
    }, {});

    // Color palette for categories
    const colors = [
      '#022C22', // primary
      '#BFD852', // secondary
      '#3B82F6', // blue
      '#F59E0B', // yellow
      '#10B981', // green
      '#8B5CF6', // purple
      '#EF4444', // red
      '#EC4899', // pink
    ];

    return Object.entries(grouped || {}).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length],
    }));
  } catch (error) {
    console.error('Error fetching category allocation:', error);
    return [];
  }
}

function getDateRange(filter: 'today' | 'week' | 'month' | 'quarter') {
  const endDate = new Date();
  const startDate = new Date();

  switch (filter) {
    case 'today':
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'quarter':
      startDate.setMonth(startDate.getMonth() - 3);
      break;
  }

  return { startDate, endDate };
}

function getPreviousPeriod(filter: 'today' | 'week' | 'month' | 'quarter') {
  const { startDate, endDate } = getDateRange(filter);
  const diff = endDate.getTime() - startDate.getTime();

  const prevEnd = new Date(startDate.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - diff);

  return { startDate: prevStart, endDate: prevEnd };
}
