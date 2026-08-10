package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

// LoadEnvFile is a simple parser for .env files to enable local development without extra deps
func LoadEnvFile(filename string) {
	bytes, err := os.ReadFile(filename)
	if err != nil {
		return // File does not exist, ignore
	}

	lines := strings.Split(string(bytes), "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		parts := strings.SplitN(line, "=", 2)
		if len(parts) == 2 {
			key := strings.TrimSpace(parts[0])
			val := strings.TrimSpace(parts[1])
			// Strip optional quotes
			if strings.HasPrefix(val, "\"") && strings.HasSuffix(val, "\"") {
				val = val[1 : len(val)-1]
			} else if strings.HasPrefix(val, "'") && strings.HasSuffix(val, "'") {
				val = val[1 : len(val)-1]
			}
			os.Setenv(key, val)
		}
	}
}

// LoggingMiddleware logs detailed info for every HTTP request
func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %s - %v", r.Method, r.RequestURI, r.RemoteAddr, time.Since(start))
	})
}

// CORSMiddleware handles cross-origin requests
func CORSMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Version, apikey")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	// 1. Try to load local environment files
	LoadEnvFile(".env")
	LoadEnvFile(".env.local")

	log.Println("Initializing MyApproved Go Backend API Platform...")

	mux := http.NewServeMux()

	// 2. Health check route
	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status": "healthy",
			"time":   time.Now().Format(time.RFC3339),
		})
	})

	// 3. AI Quote Calculator Route (Task 2.3)
	mux.HandleFunc("POST /api/calculate-quote", handleCalculateQuote)

	// 4. GoHighLevel Contact & Opportunity Sync Route (Task 2.1)
	mux.HandleFunc("POST /api/crm/sync-job", handleCRMSync)

	// 5. Tradespeople Geo-Matching Route (Task 2.2)
	mux.HandleFunc("POST /api/tradespeople/match", handleTradespeopleMatch)

	// 6. GHL Payment Completed Webhook Route (Task 2.2)
	mux.HandleFunc("POST /api/webhooks/ghl-payment", handleGHLPaymentWebhook)

	// Get configuration port
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Apply middleware chain
	handler := LoggingMiddleware(CORSMiddleware(mux))

	log.Printf("Server listening on port %s...", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("Server startup failed: %v", err)
	}
}

// handleCalculateQuote calls Gemini model to estimate quotes
func handleCalculateQuote(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req EstimateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Invalid request payload",
			"details": err.Error(),
		})
		return
	}

	if req.Trade == "" || req.Description == "" || req.Postcode == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Missing required estimate parameters: trade, description, and postcode are mandatory",
		})
		return
	}

	estimate, err := GenerateEstimate(r.Context(), req)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Failed to calculate quote via AI",
			"details": err.Error(),
		})
		return
	}

	json.NewEncoder(w).Encode(estimate)
}

// handleCRMSync routes contact details to GoHighLevel CRM
func handleCRMSync(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req JobSyncRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Invalid sync payload",
			"details": err.Error(),
		})
		return
	}

	contactID, opportunityID, err := SyncJobToGHL(r.Context(), req)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success":        false,
			"error":          err.Error(),
			"contactId":      contactID,
			"opportunityId":  opportunityID,
			"message":        "Partial sync completed with issues",
		})
		return
	}

	// Trigger local geo-matching and email/SMS alerts to tradespeople asynchronously
	go func() {
		if alertErr := AlertMatchedTradespeople(context.Background(), req); alertErr != nil {
			log.Printf("Background geo-matching and alert dispatcher error for Job %s: %v", req.ID, alertErr)
		}
	}()

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":       true,
		"contactId":     contactID,
		"opportunityId": opportunityID,
		"message":       "Job submission synced to GoHighLevel CRM successfully and matching alerts dispatched",
	})
}

// handleTradespeopleMatch executes the geo-matching lookup from Supabase
func handleTradespeopleMatch(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req JobMatchRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Invalid match request payload",
			"details": err.Error(),
		})
		return
	}

	if req.Trade == "" || req.Postcode == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Missing trade or postcode prefix parameters",
		})
		return
	}

	// Fetch candidates directly from real Supabase
	candidates, err := FetchSupabaseTradespeople(r.Context())
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Failed to fetch candidates from database",
			"details": err.Error(),
		})
		return
	}

	matched := MatchTradespeople(r.Context(), req.Trade, req.Postcode, candidates)

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"count":   len(matched),
		"results": matched,
	})
}

// handleGHLPaymentWebhook handles GoHighLevel native payment callback hooks
func handleGHLPaymentWebhook(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var hook GHLPaymentWebhook
	if err := json.NewDecoder(r.Body).Decode(&hook); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Invalid webhook body",
			"details": err.Error(),
		})
		return
	}

	if hook.LeadPurchaseID == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Missing lead_purchase_id custom parameter in GHL payload",
		})
		return
	}

	err := UpdateSupabaseLeadPurchase(r.Context(), hook.LeadPurchaseID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Failed to update lead purchase status in database",
			"details": err.Error(),
		})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Lead purchase unlocked successfully via GHL payment completion hook",
	})
}

// FetchSupabaseTradespeople fetches candidates directly from Supabase
func FetchSupabaseTradespeople(ctx context.Context) ([]Tradesperson, error) {
	supabaseURL := os.Getenv("NEXT_PUBLIC_SUPABASE_URL")
	if supabaseURL == "" {
		supabaseURL = "https://jismdkfjkngwbpddhomx.supabase.co"
	}
	supabaseKey := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")
	if supabaseKey == "" {
		supabaseKey = os.Getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
	}

	if supabaseKey == "" {
		return nil, fmt.Errorf("Supabase authorization keys are missing in env")
	}

	url := fmt.Sprintf("%s/rest/v1/tradespeople?is_verified=eq.true", supabaseURL)
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", supabaseKey))

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("Supabase fetch error (status %d): %s", resp.StatusCode, string(respBody))
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var candidates []Tradesperson
	if err := json.Unmarshal(body, &candidates); err != nil {
		return nil, err
	}

	return candidates, nil
}
