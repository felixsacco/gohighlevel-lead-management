package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

// GHLConfig holds credentials for GoHighLevel API
type GHLConfig struct {
	APIKey     string
	LocationID string
	BaseURL    string
}

// GHLContactPayload represents GoHighLevel's contact schema
type GHLContactPayload struct {
	FirstName    string                 `json:"firstName,omitempty"`
	LastName     string                 `json:"lastName,omitempty"`
	Email        string                 `json:"email,omitempty"`
	Phone        string                 `json:"phone,omitempty"`
	Address1     string                 `json:"address1,omitempty"`
	LocationID   string                 `json:"locationId"`
	Tags         []string               `json:"tags,omitempty"`
	CustomFields map[string]interface{} `json:"customFields,omitempty"`
}

// GHLOpportunityPayload represents GoHighLevel's opportunity schema
type GHLOpportunityPayload struct {
	Title         string                 `json:"title"`
	ContactID     string                 `json:"contactId"`
	Status        string                 `json:"status"`
	PipelineID    string                 `json:"pipelineId,omitempty"`
	StageID       string                 `json:"stageId,omitempty"`
	MonetaryValue float64                `json:"monetaryValue,omitempty"`
	Source        string                 `json:"source,omitempty"`
	LocationID    string                 `json:"locationId"`
	CustomFields  map[string]interface{} `json:"customFields,omitempty"`
}

// JobSyncRequest matches NextJS job sync requests
type JobSyncRequest struct {
	ID             string  `json:"id"`
	ClientName     string  `json:"clientName"`
	ClientEmail    string  `json:"clientEmail"`
	ClientPhone    string  `json:"clientPhone,omitempty"`
	Trade          string  `json:"trade"`
	JobDescription string  `json:"jobDescription"`
	Location       string  `json:"location"`
	Budget         float64 `json:"budget,omitempty"`
	BudgetType     string  `json:"budgetType,omitempty"`
	PreferredDate  string  `json:"preferredDate,omitempty"`
	Status         string  `json:"status"`
	CreatedAt      string  `json:"createdAt"`
}

// GHLPaymentWebhook represents incoming payment signals from GHL
type GHLPaymentWebhook struct {
	LeadPurchaseID string `json:"lead_purchase_id"`
	CustomerID     string `json:"customer_id,omitempty"`
	Status         string `json:"status,omitempty"`
	AmountPence    int    `json:"amount_pence,omitempty"`
}

// GetGHLConfig retrieves configured keys with fallbacks
func GetGHLConfig() (*GHLConfig, error) {
	apiKey := os.Getenv("GHL_API_KEY")
	if apiKey == "" {
		apiKey = os.Getenv("GOHIGHLEVEL_API_KEY")
	}

	locationID := os.Getenv("GHL_LOCATION_ID")
	if locationID == "" {
		locationID = os.Getenv("GOHIGHLEVEL_LOCATION_ID")
	}

	if apiKey == "" || locationID == "" {
		return nil, fmt.Errorf("GoHighLevel configuration missing. Ensure GHL_API_KEY and GHL_LOCATION_ID are set.")
	}

	baseURL := os.Getenv("GHL_BASE_URL")
	if baseURL == "" {
		baseURL = "https://services.leadconnectorhq.com"
	}

	return &GHLConfig{
		APIKey:     apiKey,
		LocationID: locationID,
		BaseURL:    baseURL,
	}, nil
}

// makeGHLRequest handles the raw API execution
func makeGHLRequest(ctx context.Context, config *GHLConfig, endpoint, method string, body interface{}) ([]byte, int, error) {
	url := fmt.Sprintf("%s%s", config.BaseURL, endpoint)

	var reqBody io.Reader
	if body != nil {
		jsonBytes, err := json.Marshal(body)
		if err != nil {
			return nil, 0, err
		}
		reqBody = bytes.NewBuffer(jsonBytes)
	}

	req, err := http.NewRequestWithContext(ctx, method, url, reqBody)
	if err != nil {
		return nil, 0, err
	}

	// Set required headers for GoHighLevel API V2
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", config.APIKey))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Version", "2021-07-28")

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, 0, err
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, resp.StatusCode, err
	}

	return respBytes, resp.StatusCode, nil
}

// SearchContact queries standard V2 GHL search endpoint
func SearchContact(ctx context.Context, config *GHLConfig, email string) (string, error) {
	endpoint := fmt.Sprintf("/contacts/search?email=%s&locationId=%s", email, config.LocationID)
	respBytes, status, err := makeGHLRequest(ctx, config, endpoint, "GET", nil)
	if err != nil {
		return "", err
	}

	if status != http.StatusOK {
		return "", fmt.Errorf("GHL search contact error: status %d, body: %s", status, string(respBytes))
	}

	var result struct {
		Contacts []struct {
			ID string `json:"id"`
		} `json:"contacts"`
	}

	if err := json.Unmarshal(respBytes, &result); err != nil {
		return "", err
	}

	if len(result.Contacts) > 0 {
		return result.Contacts[0].ID, nil
	}

	return "", nil
}

// CreateContact creates a new contact record
func CreateContact(ctx context.Context, config *GHLConfig, payload GHLContactPayload) (string, error) {
	respBytes, status, err := makeGHLRequest(ctx, config, "/contacts/", "POST", payload)
	if err != nil {
		return "", err
	}

	if status != http.StatusOK && status != http.StatusCreated {
		return "", fmt.Errorf("GHL create contact error: status %d, body: %s", status, string(respBytes))
	}

	var result struct {
		Contact struct {
			ID string `json:"id"`
		} `json:"contact"`
	}

	if err := json.Unmarshal(respBytes, &result); err != nil {
		return "", err
	}

	return result.Contact.ID, nil
}

// UpdateContact updates an existing contact
func UpdateContact(ctx context.Context, config *GHLConfig, contactID string, payload GHLContactPayload) error {
	endpoint := fmt.Sprintf("/contacts/%s", contactID)
	respBytes, status, err := makeGHLRequest(ctx, config, endpoint, "PUT", payload)
	if err != nil {
		return err
	}

	if status != http.StatusOK {
		return fmt.Errorf("GHL update contact error: status %d, body: %s", status, string(respBytes))
	}

	return nil
}

// CreateOpportunity maps opportunity inside location pipeline
func CreateOpportunity(ctx context.Context, config *GHLConfig, payload GHLOpportunityPayload) (string, error) {
	respBytes, status, err := makeGHLRequest(ctx, config, "/opportunities/", "POST", payload)
	if err != nil {
		return "", err
	}

	if status != http.StatusOK && status != http.StatusCreated {
		return "", fmt.Errorf("GHL create opportunity error: status %d, body: %s", status, string(respBytes))
	}

	var result struct {
		Opportunity struct {
			ID string `json:"id"`
		} `json:"opportunity"`
	}

	if err := json.Unmarshal(respBytes, &result); err != nil {
		return "", err
	}

	return result.Opportunity.ID, nil
}

// SyncJobToGHL coordinates GHL CRM Synchronization flow
func SyncJobToGHL(ctx context.Context, req JobSyncRequest) (string, string, error) {
	config, err := GetGHLConfig()
	if err != nil {
		return "", "", err
	}

	// Split full name cleanly
	nameParts := strings.Fields(req.ClientName)
	firstName := ""
	lastName := ""
	if len(nameParts) > 0 {
		firstName = nameParts[0]
	}
	if len(nameParts) > 1 {
		lastName = strings.Join(nameParts[1:], " ")
	}

	contactPayload := GHLContactPayload{
		FirstName:  firstName,
		LastName:   lastName,
		Email:      req.ClientEmail,
		Phone:      req.ClientPhone,
		Address1:   req.Location,
		LocationID: config.LocationID,
		Tags:       []string{"job-submission", fmt.Sprintf("trade-%s", strings.ToLower(req.Trade)), fmt.Sprintf("status-%s", req.Status)},
		CustomFields: map[string]interface{}{
			"job_id":           req.ID,
			"trade":            req.Trade,
			"job_description":  req.JobDescription,
			"budget":           fmt.Sprintf("%.2f", req.Budget),
			"budget_type":      req.BudgetType,
			"preferred_date":   req.PreferredDate,
			"submission_date":  req.CreatedAt,
		},
	}

	// 1. Search for existing contact by email
	contactID, err := SearchContact(ctx, config, contactPayload.Email)
	if err != nil {
		// Log warning but proceed to try creation
		fmt.Printf("GHL Contact lookup failed, attempting creation fallback: %v\n", err)
	}

	if contactID != "" {
		// Update existing contact
		err = UpdateContact(ctx, config, contactID, contactPayload)
		if err != nil {
			fmt.Printf("GHL Contact update error: %v\n", err)
		}
	} else {
		// Create new contact
		contactID, err = CreateContact(ctx, config, contactPayload)
		if err != nil {
			return "", "", fmt.Errorf("failed to sync contact to GHL: %v", err)
		}
	}

	// 2. Map Status to GHL Opportunity Status
	oppStatus := "New"
	switch strings.ToLower(req.Status) {
	case "pending":
		oppStatus = "New"
	case "approved", "live":
		oppStatus = "Qualified"
	case "in_progress":
		oppStatus = "In Progress"
	case "completed":
		oppStatus = "Won"
	case "cancelled", "rejected":
		oppStatus = "Lost"
	}

	opportunityPayload := GHLOpportunityPayload{
		Title:         fmt.Sprintf("%s Job - %s", req.Trade, req.Location),
		ContactID:     contactID,
		Status:        oppStatus,
		MonetaryValue: req.Budget,
		Source:        "MyApproved Website",
		LocationID:    config.LocationID,
		CustomFields: map[string]interface{}{
			"job_id":          req.ID,
			"trade":           req.Trade,
			"job_description": req.JobDescription,
			"location":        req.Location,
			"budget_type":     req.BudgetType,
			"preferred_date":  req.PreferredDate,
		},
	}

	opportunityID, err := CreateOpportunity(ctx, config, opportunityPayload)
	if err != nil {
		return contactID, "", fmt.Errorf("contact synced but opportunity failed: %v", err)
	}

	return contactID, opportunityID, nil
}

// UpdateSupabaseLeadPurchase marks a lead purchase as paid using REST API
func UpdateSupabaseLeadPurchase(ctx context.Context, purchaseID string) error {
	supabaseURL := os.Getenv("NEXT_PUBLIC_SUPABASE_URL")
	if supabaseURL == "" {
		supabaseURL = "https://jismdkfjkngwbpddhomx.supabase.co"
	}
	supabaseKey := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")
	if supabaseKey == "" {
		supabaseKey = os.Getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
	}

	if supabaseKey == "" {
		return fmt.Errorf("missing Supabase authorization keys")
	}

	url := fmt.Sprintf("%s/rest/v1/lead_purchases?id=eq.%s", supabaseURL, purchaseID)
	payload := map[string]interface{}{
		"status": "paid",
	}

	jsonBytes, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequestWithContext(ctx, "PATCH", url, bytes.NewReader(jsonBytes))
	if err != nil {
		return err
	}

	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", supabaseKey))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Prefer", "return=minimal")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusNoContent {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("Supabase API error (status %d): %s", resp.StatusCode, string(respBody))
	}

	return nil
}
