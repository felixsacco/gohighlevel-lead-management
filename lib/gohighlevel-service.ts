// GoHighLevel CRM Integration Service
// This service handles syncing job submissions to GoHighLevel CRM

interface GoHighLevelConfig {
  accessToken: string;
  locationId: string;
  baseUrl?: string;
}

// Support for both OAuth tokens and Private Integration tokens
interface PrivateIntegrationConfig {
  apiKey: string;
  locationId: string;
  baseUrl?: string;
}

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

interface GoHighLevelContact {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address1?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

interface GoHighLevelOpportunity {
  title: string;
  contactId: string;
  status: string;
  pipelineId?: string;
  stageId?: string;
  monetaryValue?: number;
  source?: string;
  customFields?: Record<string, any>;
}

export class GoHighLevelService {
  private config: GoHighLevelConfig | PrivateIntegrationConfig;
  private baseUrl: string;
  private isPrivateIntegration: boolean;

  constructor(config: GoHighLevelConfig | PrivateIntegrationConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || 'https://services.leadconnectorhq.com';
    // Check if it's a private integration token (starts with "pit-")
    this.isPrivateIntegration = 'apiKey' in config;
  }

  private async makeRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', data?: any) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {
      'Authorization': this.isPrivateIntegration 
        ? `Bearer ${(this.config as PrivateIntegrationConfig).apiKey}`
        : `Bearer ${(this.config as GoHighLevelConfig).accessToken}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28'
    };

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`GoHighLevel API Error: ${response.status} - ${errorData.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('GoHighLevel API Request Failed:', error);
      throw error;
    }
  }

  // Create or update contact in GoHighLevel
  async createOrUpdateContact(contactData: GoHighLevelContact) {
    try {
      // First, try to find existing contact by email
      const existingContact = await this.findContactByEmail(contactData.email);
      
      if (existingContact) {
        // Update existing contact
        return await this.updateContact(existingContact.id, contactData);
      } else {
        // Create new contact
        return await this.createContact(contactData);
      }
    } catch (error) {
      console.error('Error creating/updating contact:', error);
      throw error;
    }
  }

  // Find contact by email
  async findContactByEmail(email: string) {
    try {
      const response = await this.makeRequest(
        `/contacts/search?email=${encodeURIComponent(email)}&locationId=${this.config.locationId}`,
        'GET'
      );
      
      return response.contacts?.[0] || null;
    } catch (error) {
      console.error('Error finding contact by email:', error);
      return null;
    }
  }

  // Create new contact
  async createContact(contactData: GoHighLevelContact) {
    const payload = {
      ...contactData,
      locationId: this.config.locationId,
    };

    return await this.makeRequest('/contacts/', 'POST', payload);
  }

  // Update existing contact
  async updateContact(contactId: string, contactData: GoHighLevelContact) {
    const payload = {
      ...contactData,
      locationId: this.config.locationId,
    };

    return await this.makeRequest(`/contacts/${contactId}`, 'PUT', payload);
  }

  // Create opportunity for job submission
  async createOpportunity(opportunityData: GoHighLevelOpportunity) {
    const payload = {
      ...opportunityData,
      locationId: this.config.locationId,
    };

    return await this.makeRequest('/opportunities/', 'POST', payload);
  }

  // Sync job submission to GoHighLevel CRM
  async syncJobSubmission(jobData: JobSubmissionData) {
    try {
      console.log('Syncing job submission to GoHighLevel:', jobData);

      // Extract client name parts
      const nameParts = jobData.clientName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Create contact data
      const contactData: GoHighLevelContact = {
        firstName,
        lastName,
        email: jobData.clientEmail,
        phone: jobData.clientPhone,
        address1: jobData.location,
        tags: ['job-submission', `trade-${jobData.trade.toLowerCase()}`, `status-${jobData.status}`],
        customFields: {
          'job_id': jobData.id,
          'trade': jobData.trade,
          'job_description': jobData.jobDescription,
          'budget': jobData.budget?.toString() || '',
          'budget_type': jobData.budgetType || '',
          'preferred_date': jobData.preferredDate || '',
          'submission_date': jobData.createdAt,
        }
      };

      // Create or update contact
      const contact = await this.createOrUpdateContact(contactData);
      
      if (!contact || !contact.id) {
        throw new Error('Failed to create/update contact');
      }

      // Create opportunity
      const opportunityData: GoHighLevelOpportunity = {
        title: `${jobData.trade} Job - ${jobData.location}`,
        contactId: contact.id,
        status: this.mapJobStatusToOpportunityStatus(jobData.status),
        monetaryValue: jobData.budget,
        source: 'MyApproved Website',
        customFields: {
          'job_id': jobData.id,
          'trade': jobData.trade,
          'job_description': jobData.jobDescription,
          'location': jobData.location,
          'budget_type': jobData.budgetType || '',
          'preferred_date': jobData.preferredDate || '',
        }
      };

      const opportunity = await this.createOpportunity(opportunityData);

      console.log('Successfully synced job submission to GoHighLevel:', {
        contactId: contact.id,
        opportunityId: opportunity.id
      });

      return {
        success: true,
        contactId: contact.id,
        opportunityId: opportunity.id,
        message: 'Job submission synced to GoHighLevel CRM successfully'
      };

    } catch (error) {
      console.error('Failed to sync job submission to GoHighLevel:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to sync job submission to GoHighLevel CRM'
      };
    }
  }

  // Map job status to opportunity status
  private mapJobStatusToOpportunityStatus(jobStatus: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'New',
      'approved': 'Qualified',
      'in_progress': 'In Progress',
      'completed': 'Won',
      'cancelled': 'Lost',
      'rejected': 'Lost'
    };

    return statusMap[jobStatus] || 'New';
  }

  // Create a payment link (invoice) via GHL's Stripe integration
  async createPaymentLink(params: {
    contactId: string;
    amount: number; // in pence
    description: string;
    redirectUrl: string;
  }): Promise<{ invoiceId: string; paymentUrl: string; status: string } | null> {
    try {
      const payload = {
        locationId: this.config.locationId,
        contactId: params.contactId,
        amount: params.amount,
        currency: "gbp",
        description: params.description,
        redirectUrl: params.redirectUrl,
        altId: params.contactId,
        altType: "location",
      };

      const response = await this.makeRequest("/payments/invoices", "POST", payload);

      return {
        invoiceId: response.id || response.invoiceId,
        paymentUrl: response.paymentUrl || response.url || response.invoiceUrl,
        status: response.status || "draft",
      };
    } catch (error) {
      console.error("Failed to create GHL payment link:", error);
      return null;
    }
  }

  // Test API connection
  async testConnection() {
    try {
      const response = await this.makeRequest(
        `/locations/${this.config.locationId}`,
        'GET'
      );
      
      return {
        success: true,
        locationName: response.location?.name || 'Unknown',
        message: 'GoHighLevel API connection successful'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'GoHighLevel API connection failed'
      };
    }
  }
}

// Factory function to create GoHighLevel service instance (OAuth)
export function createGoHighLevelService(accessToken: string, locationId: string) {
  return new GoHighLevelService({
    accessToken,
    locationId,
  });
}

// Factory function for Private Integration tokens
export function createGoHighLevelPrivateService(apiKey: string, locationId: string) {
  return new GoHighLevelService({
    apiKey,
    locationId,
  });
}

// Default export
export default GoHighLevelService;
