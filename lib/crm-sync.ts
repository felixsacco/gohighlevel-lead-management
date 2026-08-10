// CRM Sync Utility Functions
// This module provides utilities for syncing job submissions to CRM systems

interface JobSubmissionData {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  trade: string;
  jobDescription: string;
  location: string;
  budget?: number;
  budgetType?: string;
  preferredDate?: string;
  status: string;
  createdAt: string;
}

interface CRMSyncResult {
  success: boolean;
  contactId?: string;
  opportunityId?: string;
  error?: string;
  message: string;
}

// Sync job submission to CRM
export async function syncJobToCRM(jobData: JobSubmissionData): Promise<CRMSyncResult> {
  try {
    console.log('Starting CRM sync for job:', jobData.id);

    // Call the CRM sync API endpoint
    const response = await fetch('/api/crm/sync-job', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobData),
    });

    const result = await response.json();

    if (result.success) {
      console.log('CRM sync successful:', result);
      return {
        success: true,
        contactId: result.data?.contactId,
        opportunityId: result.data?.opportunityId,
        message: result.message
      };
    } else {
      console.error('CRM sync failed:', result);
      return {
        success: false,
        error: result.error,
        message: result.message
      };
    }

  } catch (error) {
    console.error('CRM sync error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to sync job submission to CRM'
    };
  }
}

// Test CRM connection
export async function testCRMConnection(): Promise<CRMSyncResult> {
  try {
    console.log('Testing CRM connection...');

    const response = await fetch('/api/crm/sync-job', {
      method: 'GET',
    });

    const result = await response.json();

    if (result.success) {
      console.log('CRM connection test successful:', result);
      return {
        success: true,
        message: result.message
      };
    } else {
      console.error('CRM connection test failed:', result);
      return {
        success: false,
        error: result.error,
        message: result.message
      };
    }

  } catch (error) {
    console.error('CRM connection test error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to test CRM connection'
    };
  }
}

// Retry CRM sync with exponential backoff
export async function retryCRMSync(
  jobData: JobSubmissionData, 
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<CRMSyncResult> {
  let lastError: string = '';

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`CRM sync attempt ${attempt}/${maxRetries} for job:`, jobData.id);
      
      const result = await syncJobToCRM(jobData);
      
      if (result.success) {
        console.log(`CRM sync successful on attempt ${attempt}`);
        return result;
      }

      lastError = result.error || 'Unknown error';
      
      // If this is not the last attempt, wait before retrying
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
        console.log(`CRM sync failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error(`CRM sync attempt ${attempt} failed:`, error);
      
      // If this is not the last attempt, wait before retrying
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  console.error(`CRM sync failed after ${maxRetries} attempts`);
  return {
    success: false,
    error: lastError,
    message: `Failed to sync job submission to CRM after ${maxRetries} attempts`
  };
}

// Queue job for CRM sync (for background processing)
export function queueJobForCRMSync(jobData: JobSubmissionData): void {
  try {
    // Store job data in a queue (you can use Redis, database, or in-memory queue)
    // For now, we'll use a simple approach with localStorage for demo purposes
    const queueKey = 'crm_sync_queue';
    const existingQueue = JSON.parse(localStorage.getItem(queueKey) || '[]');
    
    existingQueue.push({
      ...jobData,
      queuedAt: new Date().toISOString(),
      retryCount: 0
    });
    
    localStorage.setItem(queueKey, JSON.stringify(existingQueue));
    
    console.log('Job queued for CRM sync:', jobData.id);
    
    // Process queue in background
    processCRMSyncQueue();
    
  } catch (error) {
    console.error('Failed to queue job for CRM sync:', error);
  }
}

// Process CRM sync queue
async function processCRMSyncQueue(): Promise<void> {
  try {
    const queueKey = 'crm_sync_queue';
    const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
    
    if (queue.length === 0) {
      return;
    }

    console.log(`Processing ${queue.length} jobs from CRM sync queue`);

    for (let i = queue.length - 1; i >= 0; i--) {
      const job = queue[i];
      
      try {
        const result = await syncJobToCRM(job);
        
        if (result.success) {
          // Remove successful job from queue
          queue.splice(i, 1);
          console.log(`Successfully synced job ${job.id} to CRM`);
        } else {
          // Increment retry count
          job.retryCount = (job.retryCount || 0) + 1;
          
          // Remove job if max retries exceeded
          if (job.retryCount >= 3) {
            queue.splice(i, 1);
            console.error(`Removed job ${job.id} from queue after max retries`);
          }
        }
        
      } catch (error) {
        console.error(`Error processing job ${job.id} from queue:`, error);
        job.retryCount = (job.retryCount || 0) + 1;
        
        if (job.retryCount >= 3) {
          queue.splice(i, 1);
          console.error(`Removed job ${job.id} from queue after max retries`);
        }
      }
    }
    
    // Update queue
    localStorage.setItem(queueKey, JSON.stringify(queue));
    
  } catch (error) {
    console.error('Error processing CRM sync queue:', error);
  }
}

// Clear CRM sync queue
export function clearCRMSyncQueue(): void {
  try {
    localStorage.removeItem('crm_sync_queue');
    console.log('CRM sync queue cleared');
  } catch (error) {
    console.error('Failed to clear CRM sync queue:', error);
  }
}

// Get CRM sync queue status
export function getCRMSyncQueueStatus(): { count: number; jobs: any[] } {
  try {
    const queue = JSON.parse(localStorage.getItem('crm_sync_queue') || '[]');
    return {
      count: queue.length,
      jobs: queue
    };
  } catch (error) {
    console.error('Failed to get CRM sync queue status:', error);
    return { count: 0, jobs: [] };
  }
}


