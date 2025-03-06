import { onSchedule } from 'firebase-functions/v2/scheduler';
import { ScheduledEvent } from 'firebase-functions/v2/scheduler';
import { db } from './admin';

// Weekly scheduled function to update reports data
export const weeklyReportsUpdate = onSchedule({
  schedule: 'every monday 00:00',
  timeZone: 'UTC',
  retryCount: 3,
  maxRetrySeconds: 60
}, async (event: ScheduledEvent): Promise<void> => {
  try {
    console.log('Starting weekly reports update');
    
    // Get all coaches
    const coachesSnapshot = await db.collection('coaches').get();
    
    for (const coachDoc of coachesSnapshot.docs) {
      const coachId = coachDoc.id;
      console.log(`Processing reports for coach: ${coachId}`);
      
      // Get current date and date ranges
      const now = new Date();
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      // Get all clients for this coach
      const clientsSnapshot = await db.collection('clients')
        .where('coachId', '==', coachId)
        .where('isTemplate', '!=', true)
        .get();
      
      if (clientsSnapshot.empty) {
        console.log(`No clients found for coach: ${coachId}`);
        continue;
      }
      
      // Calculate client retention rate
      const totalClients = clientsSnapshot.size;
      let activeClients = 0;
      let clientsWithGoals = 0;
      let goalsAchieved = 0;
      
      clientsSnapshot.forEach(doc => {
        const clientData = doc.data();
        
        // Count active clients
        if (clientData.status === 'active') {
          activeClients++;
        }
        
        // Count goals achieved (simplified example)
        if (clientData.progress && clientData.progress.goals) {
          clientsWithGoals++;
          if (clientData.progress.goals.achieved) {
            goalsAchieved++;
          }
        }
      });
      
      // Calculate client retention rate
      const clientRetentionRate = totalClients > 0 
        ? Math.round((activeClients / totalClients) * 100) 
        : 0;
      
      // Calculate goal achievement rate
      const clientGoalAchievement = clientsWithGoals > 0 
        ? Math.round((goalsAchieved / clientsWithGoals) * 100) 
        : 0;
      
      // Get all sessions for this coach in the last month
      const sessionsSnapshot = await db.collection('sessions')
        .where('coachId', '==', coachId)
        .where('date', '>=', oneMonthAgo)
        .get();
      
      // Calculate average session rating
      let totalRating = 0;
      let ratedSessions = 0;
      let completedSessions = 0;
      let totalSessions = 0;
      
      sessionsSnapshot.forEach(doc => {
        const sessionData = doc.data();
        
        // Skip template sessions
        if (sessionData.isTemplate) return;
        
        totalSessions++;
        
        // Count completed sessions
        if (sessionData.completed) {
          completedSessions++;
        }
        
        // Sum ratings
        if (sessionData.rating && sessionData.rating > 0) {
          totalRating += sessionData.rating;
          ratedSessions++;
        }
      });
      
      // Calculate average session rating
      const avgSessionRating = ratedSessions > 0 
        ? (totalRating / ratedSessions).toFixed(1) 
        : "0";
      
      // Calculate session attendance
      const sessionAttendance = totalSessions > 0 
        ? Math.round((completedSessions / totalSessions) * 100) 
        : 0;
      
      // Get all workouts for this coach in the last month
      const workoutsSnapshot = await db.collection('workouts')
        .where('coachId', '==', coachId)
        .where('date', '>=', oneMonthAgo)
        .get();
      
      // Calculate workout completion rate
      let completedWorkouts = 0;
      let totalWorkouts = 0;
      
      workoutsSnapshot.forEach(doc => {
        const workoutData = doc.data();
        
        // Skip template workouts
        if (workoutData.isTemplate) return;
        
        totalWorkouts++;
        
        // Count completed workouts
        if (workoutData.completed) {
          completedWorkouts++;
        }
      });
      
      // Calculate workout completion rate
      const workoutCompletionRate = totalWorkouts > 0 
        ? Math.round((completedWorkouts / totalWorkouts) * 100) 
        : 0;
      
      // Calculate app usage (simplified example - in a real app, you'd track user logins)
      // Here we're assuming 85% app usage as a placeholder
      const appUsage = 85;
      
      // Update the reports document
      const reportsRef = db.collection('reports').doc(coachId);
      await reportsRef.set({
        coachId,
        clientRetentionRate: `${clientRetentionRate}%`,
        avgSessionRating: `${avgSessionRating}/5`,
        clientGoalAchievement: `${clientGoalAchievement}%`,
        engagementMetrics: {
          workoutCompletionRate: `${workoutCompletionRate}%`,
          sessionAttendance: `${sessionAttendance}%`,
          appUsage: `${appUsage}%`
        },
        lastUpdated: now
      }, { merge: true });
      
      console.log(`Updated reports for coach: ${coachId}`);
    }
    
    console.log('Weekly reports update completed successfully');
    return;
  } catch (error) {
    console.error('Error updating reports:', error);
    throw new Error('Failed to update reports');
  }
}); 