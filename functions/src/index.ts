import { onCall } from 'firebase-functions/v2/https';
import { onRequest } from 'firebase-functions/v2/https';
import { beforeUserCreated } from 'firebase-functions/v2/identity';
import { onDocumentCreated, onDocumentUpdated, onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { setupUserCollections } from './setupCollections';

// Initialize Firebase Admin
initializeApp();

const db = getFirestore();

interface UserData {
  email: string;
  name: string;
  businessName: string;
  // Add other fields as needed
}

// Export the setupUserCollections function
export { setupUserCollections };

// Legacy function - keeping for reference but not using
export const createUserProfile = beforeUserCreated(async (event) => {
  try {
    const { email, uid } = event.data;
    const timestamp = new Date();
    
    // Create user document only
    await db.collection('users').doc(uid).set({
      email,
      createdAt: timestamp,
      role: 'coach',
      status: 'active'
    });

    return { customClaims: { role: 'coach' } };

  } catch (error) {
    console.error('Error creating user profile:', error);
    throw new Error('Failed to create user profile');
  }
});

// Process application for new coaches
export const processApplication = onCall<UserData>(async (request) => {
  try {
    if (!request.auth) {
      throw new Error('Must be logged in');
    }

    const { email, name, businessName } = request.data;

    await db.collection('applications').add({
      userId: request.auth.uid,
      email,
      name,
      businessName,
      status: 'pending',
      submittedAt: new Date()
    });

    return { success: true };

  } catch (error) {
    console.error('Error processing application:', error);
    throw new Error('Failed to process application');
  }
});

// Example function
export const helloWorld = onRequest((request, response) => {
  response.send("Hello from Firebase!");
});

// Update revenue stats when transactions change
export const updateRevenueStats = onDocumentCreated('transactions/{transactionId}', async (event) => {
  try {
    const snapshot = event.data;
    if (!snapshot) {
      console.log('No data associated with the event');
      return;
    }

    const transaction = snapshot.data();
    const { coachId } = transaction;

    if (!coachId) {
      console.log('No coachId found in transaction');
      return;
    }

    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Get all transactions for this coach
    const transactionsSnapshot = await db.collection('transactions')
      .where('coachId', '==', coachId)
      .get();
    
    if (transactionsSnapshot.empty) {
      console.log('No transactions found for coach');
      return;
    }

    // Calculate stats
    let totalRevenue = 0;
    let monthlyRecurring = 0;
    let activeSubscriptions = new Set();
    
    // Previous month data for growth calculation
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    let lastMonthRevenue = 0;
    let currentMonthRevenue = 0;
    let lastMonthRecurring = 0;
    let currentMonthRecurring = 0;
    let lastMonthSubscriptions = new Set();
    let currentMonthSubscriptions = new Set();

    transactionsSnapshot.forEach(doc => {
      const data = doc.data();
      
      // Skip if not paid
      if (data.status !== 'paid') return;
      
      // Add to total revenue
      totalRevenue += data.amount || 0;
      
      // Check if transaction date exists and is a Firestore timestamp
      if (data.date) {
        const date = data.date.toDate ? data.date.toDate() : new Date(data.date);
        const month = date.getMonth();
        const year = date.getFullYear();
        
        // Current month revenue
        if (month === currentMonth && year === currentYear) {
          currentMonthRevenue += data.amount || 0;
          
          // Add to current month subscriptions if subscription
          if (data.type === 'subscription') {
            currentMonthRecurring += data.amount || 0;
            currentMonthSubscriptions.add(data.clientId || data.clientName);
          }
        }
        
        // Last month revenue
        if (month === lastMonth && year === lastMonthYear) {
          lastMonthRevenue += data.amount || 0;
          
          // Add to last month subscriptions if subscription
          if (data.type === 'subscription') {
            lastMonthRecurring += data.amount || 0;
            lastMonthSubscriptions.add(data.clientId || data.clientName);
          }
        }
      }
      
      // Add to monthly recurring if subscription
      if (data.type === 'subscription') {
        monthlyRecurring += data.amount || 0;
        activeSubscriptions.add(data.clientId || data.clientName);
      }
    });
    
    // Calculate revenue growth as percentage
    const revenueGrowth = lastMonthRevenue > 0 
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : currentMonthRevenue > 0 ? 100 : 0;
    
    // Calculate monthly recurring growth
    const recurringGrowth = lastMonthRecurring > 0
      ? ((currentMonthRecurring - lastMonthRecurring) / lastMonthRecurring) * 100
      : currentMonthRecurring > 0 ? 100 : 0;
    
    // Calculate subscription growth
    const subscriptionGrowth = lastMonthSubscriptions.size > 0
      ? ((currentMonthSubscriptions.size - lastMonthSubscriptions.size) / lastMonthSubscriptions.size) * 100
      : currentMonthSubscriptions.size > 0 ? 100 : 0;
    
    // Update or create stats document
    const statsRef = db.collection('revenueStats').doc(coachId);
    await statsRef.set({
      coachId,
      totalRevenue,
      monthlyRecurring,
      activeSubscriptions: activeSubscriptions.size,
      revenueGrowth,
      recurringGrowth,
      subscriptionGrowth,
      currentMonthRevenue,
      lastMonthRevenue,
      lastUpdated: now
    }, { merge: true });
    
    console.log(`Updated revenue stats for coach ${coachId}`);
    
  } catch (error) {
    console.error('Error updating revenue stats:', error);
  }
});

// Also update stats when transactions are updated
export const updateRevenueStatsOnUpdate = onDocumentUpdated('transactions/{transactionId}', async (event) => {
  try {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();
    
    // Skip if no data or coachId hasn't changed
    if (!beforeData || !afterData || beforeData.coachId !== afterData.coachId) {
      return;
    }
    
    const { coachId } = afterData;
    
    // Trigger the same logic as the onCreate function
    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Get all transactions for this coach
    const transactionsSnapshot = await db.collection('transactions')
      .where('coachId', '==', coachId)
      .get();
    
    if (transactionsSnapshot.empty) {
      console.log('No transactions found for coach');
      return;
    }

    // Calculate stats
    let totalRevenue = 0;
    let monthlyRecurring = 0;
    let activeSubscriptions = new Set();
    
    // Previous month data for growth calculation
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    let lastMonthRevenue = 0;
    let currentMonthRevenue = 0;
    let lastMonthRecurring = 0;
    let currentMonthRecurring = 0;
    let lastMonthSubscriptions = new Set();
    let currentMonthSubscriptions = new Set();

    transactionsSnapshot.forEach(doc => {
      const data = doc.data();
      
      // Skip if not paid
      if (data.status !== 'paid') return;
      
      // Add to total revenue
      totalRevenue += data.amount || 0;
      
      // Check if transaction date exists and is a Firestore timestamp
      if (data.date) {
        const date = data.date.toDate ? data.date.toDate() : new Date(data.date);
        const month = date.getMonth();
        const year = date.getFullYear();
        
        // Current month revenue
        if (month === currentMonth && year === currentYear) {
          currentMonthRevenue += data.amount || 0;
          
          // Add to current month subscriptions if subscription
          if (data.type === 'subscription') {
            currentMonthRecurring += data.amount || 0;
            currentMonthSubscriptions.add(data.clientId || data.clientName);
          }
        }
        
        // Last month revenue
        if (month === lastMonth && year === lastMonthYear) {
          lastMonthRevenue += data.amount || 0;
          
          // Add to last month subscriptions if subscription
          if (data.type === 'subscription') {
            lastMonthRecurring += data.amount || 0;
            lastMonthSubscriptions.add(data.clientId || data.clientName);
          }
        }
      }
      
      // Add to monthly recurring if subscription
      if (data.type === 'subscription') {
        monthlyRecurring += data.amount || 0;
        activeSubscriptions.add(data.clientId || data.clientName);
      }
    });
    
    // Calculate revenue growth as percentage
    const revenueGrowth = lastMonthRevenue > 0 
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : currentMonthRevenue > 0 ? 100 : 0;
    
    // Calculate monthly recurring growth
    const recurringGrowth = lastMonthRecurring > 0
      ? ((currentMonthRecurring - lastMonthRecurring) / lastMonthRecurring) * 100
      : currentMonthRecurring > 0 ? 100 : 0;
    
    // Calculate subscription growth
    const subscriptionGrowth = lastMonthSubscriptions.size > 0
      ? ((currentMonthSubscriptions.size - lastMonthSubscriptions.size) / lastMonthSubscriptions.size) * 100
      : currentMonthSubscriptions.size > 0 ? 100 : 0;
    
    // Update or create stats document
    const statsRef = db.collection('revenueStats').doc(coachId);
    await statsRef.set({
      coachId,
      totalRevenue,
      monthlyRecurring,
      activeSubscriptions: activeSubscriptions.size,
      revenueGrowth,
      recurringGrowth,
      subscriptionGrowth,
      currentMonthRevenue,
      lastMonthRevenue,
      lastUpdated: now
    }, { merge: true });
    
    console.log(`Updated revenue stats for coach ${coachId} after transaction update`);
    
  } catch (error) {
    console.error('Error updating revenue stats on transaction update:', error);
  }
});

// Also update stats when transactions are deleted
export const updateRevenueStatsOnDelete = onDocumentDeleted('transactions/{transactionId}', async (event) => {
  try {
    const deletedData = event.data?.data();
    
    if (!deletedData || !deletedData.coachId) {
      return;
    }
    
    const { coachId } = deletedData;
    
    // Trigger the same logic as the onCreate function
    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Get all transactions for this coach
    const transactionsSnapshot = await db.collection('transactions')
      .where('coachId', '==', coachId)
      .get();
    
    // Calculate stats
    let totalRevenue = 0;
    let monthlyRecurring = 0;
    let activeSubscriptions = new Set();
    
    // Previous month data for growth calculation
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    let lastMonthRevenue = 0;
    let currentMonthRevenue = 0;
    let lastMonthRecurring = 0;
    let currentMonthRecurring = 0;
    let lastMonthSubscriptions = new Set();
    let currentMonthSubscriptions = new Set();

    transactionsSnapshot.forEach(doc => {
      const data = doc.data();
      
      // Skip if not paid
      if (data.status !== 'paid') return;
      
      // Add to total revenue
      totalRevenue += data.amount || 0;
      
      // Check if transaction date exists and is a Firestore timestamp
      if (data.date) {
        const date = data.date.toDate ? data.date.toDate() : new Date(data.date);
        const month = date.getMonth();
        const year = date.getFullYear();
        
        // Current month revenue
        if (month === currentMonth && year === currentYear) {
          currentMonthRevenue += data.amount || 0;
          
          // Add to current month subscriptions if subscription
          if (data.type === 'subscription') {
            currentMonthRecurring += data.amount || 0;
            currentMonthSubscriptions.add(data.clientId || data.clientName);
          }
        }
        
        // Last month revenue
        if (month === lastMonth && year === lastMonthYear) {
          lastMonthRevenue += data.amount || 0;
          
          // Add to last month subscriptions if subscription
          if (data.type === 'subscription') {
            lastMonthRecurring += data.amount || 0;
            lastMonthSubscriptions.add(data.clientId || data.clientName);
          }
        }
      }
      
      // Add to monthly recurring if subscription
      if (data.type === 'subscription') {
        monthlyRecurring += data.amount || 0;
        activeSubscriptions.add(data.clientId || data.clientName);
      }
    });
    
    // Calculate revenue growth as percentage
    const revenueGrowth = lastMonthRevenue > 0 
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : currentMonthRevenue > 0 ? 100 : 0;
    
    // Calculate monthly recurring growth
    const recurringGrowth = lastMonthRecurring > 0
      ? ((currentMonthRecurring - lastMonthRecurring) / lastMonthRecurring) * 100
      : currentMonthRecurring > 0 ? 100 : 0;
    
    // Calculate subscription growth
    const subscriptionGrowth = lastMonthSubscriptions.size > 0
      ? ((currentMonthSubscriptions.size - lastMonthSubscriptions.size) / lastMonthSubscriptions.size) * 100
      : currentMonthSubscriptions.size > 0 ? 100 : 0;
    
    // Update or create stats document
    const statsRef = db.collection('revenueStats').doc(coachId);
    await statsRef.set({
      coachId,
      totalRevenue,
      monthlyRecurring,
      activeSubscriptions: activeSubscriptions.size,
      revenueGrowth,
      recurringGrowth,
      subscriptionGrowth,
      currentMonthRevenue,
      lastMonthRevenue,
      lastUpdated: now
    }, { merge: true });
    
    console.log(`Updated revenue stats for coach ${coachId} after transaction deletion`);
    
  } catch (error) {
    console.error('Error updating revenue stats on transaction deletion:', error);
  }
}); 