import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

// Define interfaces for the report data
export interface PerformanceMetric {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down';
  period: string;
}

export interface ClientProgress {
  weightGoals: number;
  strengthGoals: number;
  cardioGoals: number;
}

export interface ClientEngagement {
  workoutCompletionRate: number;
  sessionAttendance: number;
  appUsage: number;
}

export interface ReportsData {
  performanceMetrics: PerformanceMetric[];
  clientProgress: ClientProgress;
  clientEngagement: ClientEngagement;
  lastUpdated: Date | null;
}

export const useReportsData = (dateRange: string = 'last-7-days') => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportsData, setReportsData] = useState<ReportsData>({
    performanceMetrics: [
      {
        title: 'Client Retention Rate',
        value: '0%',
        change: 0,
        trend: 'up',
        period: 'vs last week'
      },
      {
        title: 'Average Session Rating',
        value: '0/5',
        change: 0,
        trend: 'up',
        period: 'vs last week'
      },
      {
        title: 'Client Goal Achievement',
        value: '0%',
        change: 0,
        trend: 'up',
        period: 'vs last week'
      },
      {
        title: 'Active Programs',
        value: '0',
        change: 0,
        trend: 'up',
        period: 'vs last week'
      }
    ],
    clientProgress: {
      weightGoals: 0,
      strengthGoals: 0,
      cardioGoals: 0
    },
    clientEngagement: {
      workoutCompletionRate: 0,
      sessionAttendance: 0,
      appUsage: 0
    },
    lastUpdated: null
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
      const period = 'vs last week'; // Default period text
      
      switch (dateRange) {
        case 'last-7-days':
          startDate.setDate(startDate.getDate() - 7);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'last-30-days':
          startDate.setDate(startDate.getDate() - 30);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'last-90-days':
          startDate.setDate(startDate.getDate() - 90);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'year-to-date':
          startDate.setMonth(0);
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7);
          startDate.setHours(0, 0, 0, 0);
      }
      
      return { startDate, endDate: now, period };
    };

    const { startDate, endDate, period } = getDateRange();

    // Fetch reports data from Firestore
    const fetchReportsData = async () => {
      try {
        // First check if we have a reports document for this coach
        const reportsRef = doc(db, 'reports', user.uid);
        const reportsDoc = await getDoc(reportsRef);
        
        // Get all clients for this coach to calculate progress
        const clientsQuery = query(
          collection(db, 'clients'),
          where('coachId', '==', user.uid),
          where('isTemplate', '!=', true)
        );
        const clientsSnapshot = await getDocs(clientsQuery);
        
        // Initialize progress counters
        let weightGoalTotal = 0;
        let weightGoalCount = 0;
        let strengthGoalTotal = 0;
        let strengthGoalCount = 0;
        let cardioGoalTotal = 0;
        let cardioGoalCount = 0;
        
        // Process each client's goals
        clientsSnapshot.forEach(clientDoc => {
          const clientData = clientDoc.data();
          
          // Check if client has goals
          if (clientData.goals && Array.isArray(clientData.goals)) {
            clientData.goals.forEach(goal => {
              // Check goal type and add to appropriate counter
              if (goal.type && goal.progress !== undefined) {
                const goalType = goal.type.toLowerCase();
                const progress = typeof goal.progress === 'number' ? goal.progress : parseFloat(goal.progress);
                
                if (!isNaN(progress)) {
                  if (goalType.includes('weight')) {
                    weightGoalTotal += progress;
                    weightGoalCount++;
                  } else if (goalType.includes('strength')) {
                    strengthGoalTotal += progress;
                    strengthGoalCount++;
                  } else if (goalType.includes('cardio')) {
                    cardioGoalTotal += progress;
                    cardioGoalCount++;
                  }
                }
              }
            });
          }
          
          // Check if client has progress object with specific goal types
          if (clientData.progress) {
            // Check for weight goals
            if (clientData.progress.weight !== undefined) {
              const progress = typeof clientData.progress.weight === 'number' 
                ? clientData.progress.weight 
                : parseFloat(clientData.progress.weight);
              
              if (!isNaN(progress)) {
                weightGoalTotal += progress;
                weightGoalCount++;
              }
            }
            
            // Check for strength goals
            if (clientData.progress.strength !== undefined) {
              const progress = typeof clientData.progress.strength === 'number' 
                ? clientData.progress.strength 
                : parseFloat(clientData.progress.strength);
              
              if (!isNaN(progress)) {
                strengthGoalTotal += progress;
                strengthGoalCount++;
              }
            }
            
            // Check for cardio goals
            if (clientData.progress.cardio !== undefined) {
              const progress = typeof clientData.progress.cardio === 'number' 
                ? clientData.progress.cardio 
                : parseFloat(clientData.progress.cardio);
              
              if (!isNaN(progress)) {
                cardioGoalTotal += progress;
                cardioGoalCount++;
              }
            }
          }
        });
        
        // Calculate average progress for each goal type
        const weightGoalsProgress = weightGoalCount > 0 ? Math.round(weightGoalTotal / weightGoalCount) : 0;
        const strengthGoalsProgress = strengthGoalCount > 0 ? Math.round(strengthGoalTotal / strengthGoalCount) : 0;
        const cardioGoalsProgress = cardioGoalCount > 0 ? Math.round(cardioGoalTotal / cardioGoalCount) : 0;
        
        // Client progress based on actual data
        const clientProgress = {
          weightGoals: weightGoalsProgress,
          strengthGoals: strengthGoalsProgress,
          cardioGoals: cardioGoalsProgress
        };
        
        if (reportsDoc.exists()) {
          const reportsData = reportsDoc.data();
          
          // Parse the string percentages into numbers for calculations
          const clientRetentionRate = parseFloat(reportsData.clientRetentionRate) || 0;
          const avgSessionRating = parseFloat(reportsData.avgSessionRating) || 0;
          const clientGoalAchievement = parseFloat(reportsData.clientGoalAchievement) || 0;
          
          // Get engagement metrics
          const workoutCompletionRate = parseFloat(reportsData.engagementMetrics?.workoutCompletionRate) || 0;
          const sessionAttendance = parseFloat(reportsData.engagementMetrics?.sessionAttendance) || 0;
          const appUsage = parseFloat(reportsData.engagementMetrics?.appUsage) || 0;
          
          // Calculate active programs
          const programsQuery = query(
            collection(db, 'programs'),
            where('coachId', '==', user.uid),
            where('isTemplate', '!=', true)
          );
          const programsSnapshot = await getDocs(programsQuery);
          const activePrograms = programsSnapshot.size;
          
          // Get trend percentages from the reports document
          const retentionChange = parseFloat(reportsData.trends?.retentionChange) || 0;
          const ratingChange = parseFloat(reportsData.trends?.ratingChange) || 0;
          const goalChange = parseFloat(reportsData.trends?.goalChange) || 0;
          const programsChange = parseFloat(reportsData.trends?.programsChange) || 0;
          
          setReportsData({
            performanceMetrics: [
              {
                title: 'Client Retention Rate',
                value: `${clientRetentionRate}%`,
                change: retentionChange,
                trend: retentionChange >= 0 ? 'up' : 'down',
                period
              },
              {
                title: 'Average Session Rating',
                value: `${avgSessionRating}/5`,
                change: ratingChange,
                trend: ratingChange >= 0 ? 'up' : 'down',
                period
              },
              {
                title: 'Client Goal Achievement',
                value: `${clientGoalAchievement}%`,
                change: goalChange,
                trend: goalChange >= 0 ? 'up' : 'down',
                period
              },
              {
                title: 'Active Programs',
                value: activePrograms,
                change: programsChange,
                trend: programsChange >= 0 ? 'up' : 'down',
                period
              }
            ],
            clientProgress,
            clientEngagement: {
              workoutCompletionRate,
              sessionAttendance,
              appUsage
            },
            lastUpdated: reportsData.lastUpdated ? reportsData.lastUpdated.toDate() : new Date()
          });
        } else {
          // If no reports document exists, calculate from scratch
          // This would involve aggregating data from clients, sessions, etc.
          // For now, we'll use placeholder data for performance metrics but real data for client progress
          
          setReportsData({
            performanceMetrics: [
              {
                title: 'Client Retention Rate',
                value: '92%',
                change: 5.2,
                trend: 'up',
                period
              },
              {
                title: 'Average Session Rating',
                value: '4.8/5',
                change: 0.3,
                trend: 'up',
                period
              },
              {
                title: 'Client Goal Achievement',
                value: '78%',
                change: -2.1,
                trend: 'down',
                period
              },
              {
                title: 'Active Programs',
                value: '24',
                change: 4,
                trend: 'up',
                period
              }
            ],
            clientProgress,
            clientEngagement: {
              workoutCompletionRate: 87,
              sessionAttendance: 92,
              appUsage: 85
            },
            lastUpdated: new Date()
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching reports data:', err);
        setError('Failed to fetch reports data');
        setLoading(false);
      }
    };

    fetchReportsData();
  }, [user, dateRange]);

  return { reportsData, loading, error };
}; 