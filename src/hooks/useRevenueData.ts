import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

export interface Revenue {
  id: string;
  clientName: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'failed';
  type: 'subscription' | 'one-time' | 'package';
}

export interface RevenueStats {
  totalRevenue: number;
  monthlyRecurring: number;
  activeSubscriptions: number;
  revenueGrowth: number;
  recurringGrowth?: number;
  subscriptionGrowth?: number;
  currentMonthRevenue?: number;
  lastMonthRevenue?: number;
}

export const useRevenueData = (dateFilter: string = 'this-month') => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Revenue[]>([]);
  const [stats, setStats] = useState<RevenueStats>({
    totalRevenue: 0,
    monthlyRecurring: 0,
    activeSubscriptions: 0,
    revenueGrowth: 0,
    recurringGrowth: 0,
    subscriptionGrowth: 0,
    currentMonthRevenue: 0,
    lastMonthRevenue: 0
  });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Get date range based on filter
    const getDateRange = () => {
      const now = new Date();
      const startDate = new Date();
      
      switch (dateFilter) {
        case 'this-month':
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'last-month':
          startDate.setMonth(startDate.getMonth() - 1);
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          const endOfLastMonth = new Date();
          endOfLastMonth.setDate(0);
          endOfLastMonth.setHours(23, 59, 59, 999);
          return { startDate, endDate: endOfLastMonth };
        case '3-months':
          startDate.setMonth(startDate.getMonth() - 3);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'year':
          startDate.setMonth(0);
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          break;
        default:
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
      }
      
      return { startDate, endDate: now };
    };

    const { startDate, endDate } = getDateRange();

    // Fetch transactions
    let unsubscribe: Unsubscribe | undefined;
    
    const fetchTransactions = async () => {
      try {
        const transactionsQuery = query(
          collection(db, 'transactions'),
          where('coachId', '==', user.uid),
          where('date', '>=', startDate),
          where('date', '<=', endDate),
          orderBy('date', 'desc'),
          limit(50)
        );

        // Set up real-time listener for transactions
        unsubscribe = onSnapshot(transactionsQuery, (snapshot) => {
          const transactionsData: Revenue[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              clientName: data.clientName || 'Unknown Client',
              amount: data.amount || 0,
              date: data.date ? data.date.toDate().toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              status: data.status || 'pending',
              type: data.type || 'one-time'
            };
          });
          
          setTransactions(transactionsData);
          calculateStats(transactionsData);
          setLoading(false);
        }, (err) => {
          console.error('Error fetching transactions:', err);
          setError('Failed to load transactions. Please try again.');
          setLoading(false);
        });
      } catch (err) {
        console.error('Error setting up transactions listener:', err);
        setError('Failed to load transactions. Please try again.');
        setLoading(false);
      }
    };

    // Calculate stats based on transactions
    const calculateStats = (transactionsData: Revenue[]) => {
      try {
        // Get stats from Firestore if available
        const fetchStats = async () => {
          try {
            const statsDoc = await getDocs(query(
              collection(db, 'revenueStats'),
              where('coachId', '==', user.uid),
              limit(1)
            ));
            
            if (!statsDoc.empty) {
              const statsData = statsDoc.docs[0].data();
              setStats({
                totalRevenue: statsData.totalRevenue || 0,
                monthlyRecurring: statsData.monthlyRecurring || 0,
                activeSubscriptions: statsData.activeSubscriptions || 0,
                revenueGrowth: statsData.revenueGrowth || 0,
                recurringGrowth: statsData.recurringGrowth || 0,
                subscriptionGrowth: statsData.subscriptionGrowth || 0,
                currentMonthRevenue: statsData.currentMonthRevenue || 0,
                lastMonthRevenue: statsData.lastMonthRevenue || 0
              });
              return;
            }
          } catch (err) {
            console.error('Error fetching stats:', err);
          }
          
          // Calculate stats from transactions if Firestore stats not available
          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();
          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          
          // Filter transactions by month
          const currentMonthTransactions = transactionsData.filter(transaction => {
            const date = new Date(transaction.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
          });
          
          const lastMonthTransactions = transactionsData.filter(transaction => {
            const date = new Date(transaction.date);
            return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
          });
          
          // Calculate total revenue
          const totalRevenue = transactionsData
            .filter(t => t.status === 'paid')
            .reduce((sum, t) => sum + t.amount, 0);
          
          // Calculate current month revenue
          const currentMonthRevenue = currentMonthTransactions
            .filter(t => t.status === 'paid')
            .reduce((sum, t) => sum + t.amount, 0);
          
          // Calculate last month revenue
          const lastMonthRevenue = lastMonthTransactions
            .filter(t => t.status === 'paid')
            .reduce((sum, t) => sum + t.amount, 0);
          
          // Calculate subscriptions
          const subscriptions = transactionsData.filter(
            transaction => transaction.type === 'subscription' && transaction.status === 'paid'
          );
          
          // Calculate monthly recurring revenue
          const monthlyRecurring = subscriptions.reduce((sum, transaction) => sum + transaction.amount, 0);
          
          // Calculate current month recurring
          const currentMonthRecurring = currentMonthTransactions
            .filter(t => t.status === 'paid' && t.type === 'subscription')
            .reduce((sum, t) => sum + t.amount, 0);
          
          // Calculate last month recurring
          const lastMonthRecurring = lastMonthTransactions
            .filter(t => t.status === 'paid' && t.type === 'subscription')
            .reduce((sum, t) => sum + t.amount, 0);
          
          // Calculate active subscriptions
          const activeSubscriptions = new Set(
            subscriptions.map(transaction => transaction.clientName)
          ).size;
          
          // Calculate current month subscriptions
          const currentMonthSubscriptions = new Set(
            currentMonthTransactions
              .filter(t => t.status === 'paid' && t.type === 'subscription')
              .map(t => t.clientName)
          ).size;
          
          // Calculate last month subscriptions
          const lastMonthSubscriptions = new Set(
            lastMonthTransactions
              .filter(t => t.status === 'paid' && t.type === 'subscription')
              .map(t => t.clientName)
          ).size;
          
          // Calculate growth percentages
          const revenueGrowth = lastMonthRevenue > 0
            ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
            : currentMonthRevenue > 0 ? 100 : 0;
          
          const recurringGrowth = lastMonthRecurring > 0
            ? ((currentMonthRecurring - lastMonthRecurring) / lastMonthRecurring) * 100
            : currentMonthRecurring > 0 ? 100 : 0;
          
          const subscriptionGrowth = lastMonthSubscriptions > 0
            ? ((currentMonthSubscriptions - lastMonthSubscriptions) / lastMonthSubscriptions) * 100
            : currentMonthSubscriptions > 0 ? 100 : 0;
          
          setStats({
            totalRevenue,
            monthlyRecurring,
            activeSubscriptions,
            revenueGrowth,
            recurringGrowth,
            subscriptionGrowth,
            currentMonthRevenue,
            lastMonthRevenue
          });
        };
        
        fetchStats();
      } catch (err) {
        console.error('Error calculating stats:', err);
      }
    };

    fetchTransactions();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, dateFilter]);

  return { transactions, stats, loading, error };
}; 