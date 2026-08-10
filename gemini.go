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

	"google.golang.org/genai"
)

// QuoteEstimate represents the JSON structure returned to the frontend
type QuoteEstimate struct {
	Estimate   string            `json:"estimate"`
	ExactPrice float64           `json:"exactPrice"`
	Min        float64           `json:"min"`
	Max        float64           `json:"max"`
	Indicative bool              `json:"indicative"`
	Disclaimer string            `json:"disclaimer"`
	Breakdown  EstimateBreakdown `json:"breakdown"`
}

type EstimateBreakdown struct {
	BasePrice  float64        `json:"basePrice"`
	Region     RegionInfo     `json:"region"`
	Complexity ComplexityInfo `json:"complexity"`
	Trade      TradeInfo      `json:"trade"`
	Urgency    UrgencyInfo    `json:"urgency"`
}

type RegionInfo struct {
	Name string `json:"name"`
}

type ComplexityInfo struct {
	Level string `json:"level"`
}

type TradeInfo struct {
	Name string `json:"name"`
}

type UrgencyInfo struct {
	Level string `json:"level"`
}

// Request payload from frontend
type EstimateRequest struct {
	Description string `json:"description"`
	Trade       string `json:"trade"`
	Postcode    string `json:"postcode"`
	Urgency     string `json:"urgency"`
}

// getPrompt formats the custom instruction prompt for the model
func getPrompt(req EstimateRequest) string {
	return fmt.Sprintf(`
You are an expert UK trades estimator. Calculate a realistic price estimate in GBP (£) for a job with the following parameters:
- Trade: %s
- Job Description: %s
- Postcode / Location: %s
- Urgency: %s

You MUST return a strict JSON object with NO markdown formatting, NO backticks (e.g. do not wrap in markdown code blocks), and NO extra whitespace. The JSON must match this structure exactly:
{
  "estimate": "£[Min] - £[Max]",
  "exactPrice": [Middle Value],
  "min": [Min Value],
  "max": [Max Value],
  "indicative": true,
  "disclaimer": "This is an AI-generated indicative estimate. Actual quotes from local tradespeople may vary.",
  "breakdown": {
    "basePrice": [Base labor cost],
    "region": {
      "name": "[Inferred UK Region from postcode, e.g. London, West Midlands, North West]"
    },
    "complexity": {
      "level": "[Low, Medium, or High, inferred from description]"
    },
    "trade": {
      "name": "%s"
    },
    "urgency": {
      "level": "%s"
    }
  }
}
All price values (exactPrice, min, max, basePrice) must be numbers, not strings. Be realistic for UK rates (e.g. London postcodes have higher baseline labor costs, emergencies carry a premium surcharge).
`, req.Trade, req.Description, req.Postcode, req.Urgency, req.Trade, req.Urgency)
}

// GenerateEstimate handles the AI estimation logic
func GenerateEstimate(ctx context.Context, req EstimateRequest) (*QuoteEstimate, error) {
	apiKey := os.Getenv("GEMINI_API_KEY")
	// Use Gemini if configured and not placeholder
	if apiKey != "" && apiKey != "your_gemini_api_key_here" {
		prompt := getPrompt(req)
		estimate, err := generateWithSDK(ctx, apiKey, prompt)
		if err == nil {
			return estimate, nil
		}

		fmt.Printf("GenAI SDK call failed, trying direct REST API fallback: %v\n", err)
		return generateWithREST(ctx, apiKey, prompt)
	}

	// Use DeepSeek as fallback if live key is available
	deepseekKey := os.Getenv("DEEPSEEK_API_KEY")
	if deepseekKey != "" && deepseekKey != "your_deepseek_api_key_here" {
		fmt.Println("GEMINI_API_KEY not configured. Automatically routing to DEEPSEEK_API_KEY...")
		prompt := getPrompt(req)
		return generateWithDeepSeek(ctx, deepseekKey, prompt)
	}

	return nil, fmt.Errorf("neither GEMINI_API_KEY nor DEEPSEEK_API_KEY is configured with a valid key")
}

func generateWithSDK(ctx context.Context, apiKey, prompt string) (*QuoteEstimate, error) {
	// Create client with official SDK configuration
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey: apiKey,
	})
	if err != nil {
		return nil, err
	}

	// Request content generation using gemini-2.5-flash
	config := &genai.GenerateContentConfig{
		ResponseMIMEType: "application/json",
	}
	resp, err := client.Models.GenerateContent(ctx, "gemini-2.5-flash", genai.Text(prompt), config)
	if err != nil {
		return nil, err
	}

	// Extract response text using official helper method
	jsonText, err := resp.Text()
	if err != nil {
		return nil, fmt.Errorf("failed to extract text from Gemini response: %v", err)
	}

	// Parse JSON
	var estimate QuoteEstimate
	cleanedJSON := cleanJSONResponse(jsonText)
	if err := json.Unmarshal([]byte(cleanedJSON), &estimate); err != nil {
		return nil, fmt.Errorf("failed to unmarshal SDK JSON response: %v, raw text: %s", err, jsonText)
	}

	return &estimate, nil
}

func generateWithREST(ctx context.Context, apiKey, prompt string) (*QuoteEstimate, error) {
	url := "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey

	payload := map[string]interface{}{
		"contents": []interface{}{
			map[string]interface{}{
				"parts": []interface{}{
					map[string]interface{}{
						"text": prompt,
					},
				},
			},
		},
		"generationConfig": map[string]interface{}{
			"responseMimeType": "application/json",
		},
	}

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonPayload))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("gemini REST API returned status %d: %s", resp.StatusCode, string(body))
	}

	var restResp struct {
		Candidates []struct {
			Content struct {
				Parts []struct {
					Text string `json:"text"`
				} `json:"parts"`
			} `json:"content"`
		} `json:"candidates"`
	}

	if err := json.Unmarshal(body, &restResp); err != nil {
		return nil, err
	}

	if len(restResp.Candidates) == 0 || len(restResp.Candidates[0].Content.Parts) == 0 {
		return nil, fmt.Errorf("no content generated from Gemini REST fallback")
	}

	jsonText := restResp.Candidates[0].Content.Parts[0].Text
	cleanedJSON := cleanJSONResponse(jsonText)

	var estimate QuoteEstimate
	if err := json.Unmarshal([]byte(cleanedJSON), &estimate); err != nil {
		return nil, fmt.Errorf("failed to parse REST JSON: %v, content: %s", err, jsonText)
	}

	return &estimate, nil
}

func generateWithDeepSeek(ctx context.Context, apiKey, prompt string) (*QuoteEstimate, error) {
	url := "https://api.deepseek.com/chat/completions"

	payload := map[string]interface{}{
		"model": "deepseek-chat",
		"messages": []interface{}{
			map[string]interface{}{
				"role":    "user",
				"content": prompt,
			},
		},
		"response_format": map[string]interface{}{
			"type": "json_object",
		},
	}

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonPayload))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	client := &http.Client{Timeout: 20 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("deepseek REST API returned status %d: %s", resp.StatusCode, string(body))
	}

	var dsResp struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}

	if err := json.Unmarshal(body, &dsResp); err != nil {
		return nil, err
	}

	if len(dsResp.Choices) == 0 {
		return nil, fmt.Errorf("no choices returned from DeepSeek response")
	}

	jsonText := dsResp.Choices[0].Message.Content
	cleanedJSON := cleanJSONResponse(jsonText)

	var estimate QuoteEstimate
	if err := json.Unmarshal([]byte(cleanedJSON), &estimate); err != nil {
		return nil, fmt.Errorf("failed to parse DeepSeek JSON: %v, content: %s", err, jsonText)
	}

	return &estimate, nil
}

// cleanJSONResponse strips any markdown formatting or bad wrapping that models occasionally include
func cleanJSONResponse(s string) string {
	s = strings.TrimSpace(s)
	if strings.HasPrefix(s, "```") {
		lines := strings.Split(s, "\n")
		if len(lines) > 2 {
			// Strip the first line (e.g. ```json) and the last line (```)
			s = strings.Join(lines[1:len(lines)-1], "\n")
		}
	}
	return strings.TrimSpace(s)
}
