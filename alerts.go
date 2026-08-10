package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/smtp"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"
)

// MaskBetween keeps the start and end of a string and masks the middle
func MaskBetween(value string, keepStart, keepEnd int) string {
	if len(value) <= keepStart+keepEnd {
		return value
	}
	start := value[:keepStart]
	end := value[len(value)-keepEnd:]
	middleLen := len(value) - keepStart - keepEnd
	middle := strings.Repeat("x", middleLen)
	return fmt.Sprintf("%s%s%s", start, middle, end)
}

// MaskUkPhoneNumber masks the middle section of a UK phone number
func MaskUkPhoneNumber(phone string) string {
	trimmed := strings.TrimSpace(phone)
	if trimmed == "" {
		return ""
	}

	reg, _ := regexp.Compile(`\D`)

	if strings.HasPrefix(trimmed, "+") {
		digits := reg.ReplaceAllString(trimmed[1:], "")
		if strings.HasPrefix(digits, "44") && len(digits) >= 11 {
			local := digits[2:] // drop country code
			return fmt.Sprintf("+44 %s", MaskBetween(local, 2, 2))
		}
		return fmt.Sprintf("+%s", MaskBetween(digits, 2, 2))
	}

	digitsOnly := reg.ReplaceAllString(trimmed, "")
	if len(digitsOnly) >= 5 {
		return MaskBetween(digitsOnly, 3, 2)
	}

	return strings.Repeat("x", len(trimmed))
}

// SendEmailNotification sends an email using standard SMTP configurations in env
func SendEmailNotification(to, subject, body string) error {
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")
	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASS")
	fromEmail := os.Getenv("NOTIFICATION_FROM_EMAIL")

	if fromEmail == "" {
		fromEmail = "noreply@myapproved.com"
	}

	// If SMTP is not fully configured, log and return (so local dev doesn't crash)
	if smtpHost == "" || smtpPort == "" || smtpUser == "" || smtpPass == "" {
		fmt.Printf("[Local Email Log] To: %s\nSubject: %s\nBody: %s\n", to, subject, body)
		return nil
	}

	msg := []byte(fmt.Sprintf("To: %s\r\n"+
		"From: %s\r\n"+
		"Subject: %s\r\n"+
		"MIME-Version: 1.0\r\n"+
		"Content-Type: text/html; charset=UTF-8\r\n"+
		"\r\n"+
		"%s\r\n", to, fromEmail, subject, body))

	auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)
	addr := fmt.Sprintf("%s:%s", smtpHost, smtpPort)

	return smtp.SendMail(addr, auth, fromEmail, []string{to}, msg)
}

// RegisterSupabaseLeadPurchase inserts a row in Supabase REST API
func RegisterSupabaseLeadPurchase(ctx context.Context, jobID, tradespersonID string, pricePence int) (string, error) {
	supabaseURL := os.Getenv("NEXT_PUBLIC_SUPABASE_URL")
	if supabaseURL == "" {
		supabaseURL = "https://jismdkfjkngwbpddhomx.supabase.co"
	}
	supabaseKey := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")
	if supabaseKey == "" {
		supabaseKey = os.Getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
	}

	url := fmt.Sprintf("%s/rest/v1/lead_purchases", supabaseURL)
	payload := map[string]interface{}{
		"job_id":             jobID,
		"tradesperson_id":    tradespersonID,
		"lead_price_pence":   pricePence,
		"status":             "offered",
	}

	jsonBytes, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewReader(jsonBytes))
	if err != nil {
		return "", err
	}

	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", supabaseKey))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Prefer", "return=representation")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	// If insertion fails (e.g. unique constraint of job_id + tradesperson_id),
	// query the existing record to get its ID
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return QueryExistingLeadPurchase(ctx, jobID, tradespersonID)
	}

	var results []struct {
		ID interface{} `json:"id"`
	}
	if err := json.Unmarshal(body, &results); err != nil {
		return "", err
	}

	if len(results) > 0 {
		return fmt.Sprintf("%v", results[0].ID), nil
	}

	return "", nil
}

// QueryExistingLeadPurchase fetches an existing lead purchase row
func QueryExistingLeadPurchase(ctx context.Context, jobID, tradespersonID string) (string, error) {
	supabaseURL := os.Getenv("NEXT_PUBLIC_SUPABASE_URL")
	if supabaseURL == "" {
		supabaseURL = "https://jismdkfjkngwbpddhomx.supabase.co"
	}
	supabaseKey := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")
	if supabaseKey == "" {
		supabaseKey = os.Getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
	}

	url := fmt.Sprintf("%s/rest/v1/lead_purchases?job_id=eq.%s&tradesperson_id=eq.%s&select=id", supabaseURL, jobID, tradespersonID)
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return "", err
	}

	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", supabaseKey))

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	var results []struct {
		ID interface{} `json:"id"`
	}
	if err := json.Unmarshal(body, &results); err != nil {
		return "", err
	}

	if len(results) > 0 {
		return fmt.Sprintf("%v", results[0].ID), nil
	}

	return "", fmt.Errorf("no lead purchase row found")
}

// AlertMatchedTradespeople filters, registers, and alerts all matching tradespeople for a job
func AlertMatchedTradespeople(ctx context.Context, job JobSyncRequest) error {
	candidates, err := FetchSupabaseTradespeople(ctx)
	if err != nil {
		return fmt.Errorf("failed to fetch tradespeople to alert: %v", err)
	}

	matched := MatchTradespeople(ctx, job.Trade, job.Location, candidates)
	if len(matched) == 0 {
		fmt.Printf("No tradespeople matched for Job ID %s (Trade: %s, Location: %s)\n", job.ID, job.Trade, job.Location)
		return nil
	}

	fmt.Printf("Alerting %d matched tradespeople for Job ID %s...\n", len(matched), job.ID)

	appURL := os.Getenv("NEXT_PUBLIC_APP_URL")
	if appURL == "" {
		appURL = "https://myapproved.com"
	}

	leadPricePence := 499 // £4.99 lead price as requested

	for _, tp := range matched {
		// Determine if the tradesperson has an active subscription that unlocks leads automatically
		isUnlimited := tp.SubscriptionPlan == "unlimited_monthly" || tp.SubscriptionPlan == "pro" || tp.SubscriptionPlan == "premium"

		var subject, body string
		if isUnlimited {
			// Unlimited subscribers get the client details immediately
			subject = fmt.Sprintf("New Lead Match: %s in %s", job.Trade, job.Location)
			body = fmt.Sprintf(`
				<h2>New Live Job Match!</h2>
				<p>Hello %s %s,</p>
				<p>A new job matching your trade is live in your area!</p>
				<p><strong>Trade:</strong> %s</p>
				<p><strong>Description:</strong> %s</p>
				<p><strong>Location:</strong> %s</p>
				<p><strong>Client Phone:</strong> %s</p>
				<p><strong>Client Email:</strong> %s</p>
				<br/>
				<p><a href="%s/leads/%s" style="padding:10px 20px;background-color:#1A3A8A;color:white;text-decoration:none;border-radius:5px;">View Job Details</a></p>
			`, tp.FirstName, tp.LastName, job.Trade, job.JobDescription, job.Location, job.ClientPhone, reqClientEmail(job.ClientEmail), appURL, job.ID)
		} else {
			// Pay-per-lead path
			purchaseID, err := RegisterSupabaseLeadPurchase(ctx, job.ID, tp.ID, leadPricePence)
			if err != nil {
				fmt.Printf("Failed to register lead purchase offer for tradesperson %s: %v\n", tp.ID, err)
				continue
			}

			maskedPhone := MaskUkPhoneNumber(job.ClientPhone)
			unlockURL := fmt.Sprintf("%s/leads/%s", appURL, purchaseID)

			subject = fmt.Sprintf("New Job Alert: %s in %s (£%s)", job.Trade, job.Location, strconv.FormatFloat(float64(leadPricePence)/100, 'f', 2, 64))
			body = fmt.Sprintf(`
				<h2>New Job Leads Available!</h2>
				<p>Hello %s %s,</p>
				<p>A new job matches your trade and region!</p>
				<p><strong>Trade:</strong> %s</p>
				<p><strong>Description:</strong> %s</p>
				<p><strong>Location:</strong> %s</p>
				<p><strong>Phone:</strong> %s (Masked - Unlock required)</p>
				<br/>
				<p>Unlock this lead's full contact details for only <strong>£%s</strong>.</p>
				<p><a href="%s" style="padding:10px 20px;background-color:#FFB800;color:black;font-weight:bold;text-decoration:none;border-radius:5px;">Unlock Customer Details</a></p>
			`, tp.FirstName, tp.LastName, job.Trade, job.JobDescription, job.Location, maskedPhone, strconv.FormatFloat(float64(leadPricePence)/100, 'f', 2, 64), unlockURL)
		}

		err = SendEmailNotification(tp.Email, subject, body)
		if err != nil {
			fmt.Printf("Failed to send email alert to %s: %v\n", tp.Email, err)
		}
	}

	return nil
}

func reqClientEmail(email string) string {
	if email == "" {
		return "N/A"
	}
	return email
}
