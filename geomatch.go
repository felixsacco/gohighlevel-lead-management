package main

import (
	"context"
	"fmt"
	"math"
	"regexp"
	"strings"
)

// PostcodeRegions maps UK postcode prefixes to regions
var PostcodeRegions = map[string]string{
	// London
	"E":  "London",
	"EC": "London",
	"N":  "London",
	"NW": "London",
	"SE": "London",
	"SW": "London",
	"W":  "London",
	"WC": "London",

	// South East
	"BN": "South East",
	"BR": "South East",
	"CR": "South East",
	"CT": "South East",
	"DA": "South East",
	"GU": "South East",
	"HA": "South East",
	"HP": "South East",
	"KT": "South East",
	"ME": "South East",
	"OX": "South East",
	"PO": "South East",
	"RG": "South East",
	"RH": "South East",
	"SL": "South East",
	"SM": "South East",
	"SO": "South East",
	"TN": "South East",
	"TW": "South East",
	"UB": "South East",
	"WD": "South East",

	// South West
	"BA": "South West",
	"BH": "South West",
	"BS": "South West",
	"DT": "South West",
	"EX": "South West",
	"GL": "South West",
	"PL": "South West",
	"SN": "South West",
	"SP": "South West",
	"TA": "South West",
	"TQ": "South West",
	"TR": "South West",

	// East of England
	"AL": "East of England",
	"CB": "East of England",
	"CM": "East of England",
	"CO": "East of England",
	"EN": "East of England",
	"IG": "East of England",
	"IP": "East of England",
	"LU": "East of England",
	"NR": "East of England",
	"PE": "East of England",
	"RM": "East of England",
	"SG": "East of England",
	"SS": "East of England",

	// West Midlands
	"B":  "West Midlands",
	"CV": "West Midlands",
	"DY": "West Midlands",
	"HR": "West Midlands",
	"ST": "West Midlands",
	"WS": "West Midlands",
	"WV": "West Midlands",

	// East Midlands
	"DE": "East Midlands",
	"LE": "East Midlands",
	"NG": "East Midlands",
	"NN": "East Midlands",
	"S":  "East Midlands",

	// Yorkshire and the Humber
	"BD": "Yorkshire and the Humber",
	"DN": "Yorkshire and the Humber",
	"HD": "Yorkshire and the Humber",
	"HG": "Yorkshire and the Humber",
	"HU": "Yorkshire and the Humber",
	"HX": "Yorkshire and the Humber",
	"LS": "Yorkshire and the Humber",
	"WF": "Yorkshire and the Humber",
	"YO": "Yorkshire and the Humber",

	// North West
	"BB": "North West",
	"BL": "North West",
	"CA": "North West",
	"CH": "North West",
	"CW": "North West",
	"FY": "North West",
	"L":  "North West",
	"LA": "North West",
	"M":  "North West",
	"OL": "North West",
	"PR": "North West",
	"SK": "North West",
	"WA": "North West",
	"WN": "North West",

	// North East
	"DH": "North East",
	"DL": "North East",
	"NE": "North East",
	"SR": "North East",
	"TS": "North East",

	// Scotland
	"AB": "Scotland",
	"DD": "Scotland",
	"DG": "Scotland",
	"EH": "Scotland",
	"FK": "Scotland",
	"G":  "Scotland",
	"HS": "Scotland",
	"IV": "Scotland",
	"KA": "Scotland",
	"KW": "Scotland",
	"KY": "Scotland",
	"ML": "Scotland",
	"PA": "Scotland",
	"PH": "Scotland",
	"TD": "Scotland",
	"ZE": "Scotland",

	// Wales
	"CF": "Wales",
	"LD": "Wales",
	"LL": "Wales",
	"NP": "Wales",
	"SA": "Wales",
	"SY": "Wales",

	// Northern Ireland
	"BT": "Northern Ireland",
}

// AdjacentRegions maps region names to their geographical neighbors
var AdjacentRegions = map[string][]string{
	"London":                   {"South East", "East of England"},
	"South East":               {"London", "South West", "East of England"},
	"South West":               {"South East", "West Midlands"},
	"East of England":          {"London", "South East", "East Midlands"},
	"West Midlands":            {"South West", "East Midlands", "Wales"},
	"East Midlands":            {"East of England", "West Midlands", "Yorkshire and the Humber"},
	"Yorkshire and the Humber": {"East Midlands", "North West", "North East"},
	"North West":               {"Yorkshire and the Humber", "North East"},
	"North East":               {"Yorkshire and the Humber", "North West"},
}

// Tradesperson represents simplified db model for matching
type Tradesperson struct {
	ID               string `json:"id"`
	FirstName        string `json:"first_name"`
	LastName         string `json:"last_name"`
	Email            string `json:"email"`
	Phone            string `json:"phone"`
	Trade            string `json:"trade"`
	Postcode         string `json:"postcode"`
	City             string `json:"city"`
	SubscriptionPlan string `json:"subscription_plan"`
	Verified         bool   `json:"is_verified"`
}

// JobMatchRequest payload for geo-matching endpoint
type JobMatchRequest struct {
	Trade    string `json:"trade"`
	Postcode string `json:"postcode"`
}

// CleanPostcode normalizes spacing and case
func CleanPostcode(pc string) string {
	pc = strings.TrimSpace(pc)
	pc = strings.ToUpper(pc)
	// Remove all internal whitespace
	pc = strings.ReplaceAll(pc, " ", "")
	pc = strings.ReplaceAll(pc, "\t", "")
	return pc
}

// ExtractPostcodeArea pulls the area prefix (1-2 letters followed by numbers)
func ExtractPostcodeArea(pc string) string {
	cleaned := CleanPostcode(pc)
	if cleaned == "" {
		return ""
	}

	re := regexp.MustCompile(`^([A-Z]{1,2})`)
	match := re.FindStringSubmatch(cleaned)
	if len(match) > 1 {
		return match[1]
	}
	return ""
}

// GetPostcodeRegion fetches regional placement
func GetPostcodeRegion(pc string) string {
	area := ExtractPostcodeArea(pc)
	if area == "" {
		return ""
	}
	return PostcodeRegions[area]
}

// AreInSameRegion checks regional bounds
func AreInSameRegion(pc1, pc2 string) bool {
	r1 := GetPostcodeRegion(pc1)
	r2 := GetPostcodeRegion(pc2)
	return r1 != "" && r2 != "" && r1 == r2
}

// CalculatePostcodeProximity grades proximity (0-100)
func CalculatePostcodeProximity(pc1, pc2 string) int {
	n1 := CleanPostcode(pc1)
	n2 := CleanPostcode(pc2)
	if n1 == "" || n2 == "" {
		return 0
	}

	// Exact match
	if n1 == n2 {
		return 100
	}

	area1 := ExtractPostcodeArea(pc1)
	area2 := ExtractPostcodeArea(pc2)

	if area1 != "" && area2 != "" {
		if area1 == area2 {
			return 100
		}
		if AreInSameRegion(pc1, pc2) {
			return 75
		}

		r1 := GetPostcodeRegion(pc1)
		r2 := GetPostcodeRegion(pc2)

		if r1 != "" && r2 != "" {
			for _, adj := range AdjacentRegions[r1] {
				if adj == r2 {
					return 50
				}
			}
		}
		return 25
	}

	// Fallback prefix numeric match (for international or other codes)
	minLen := int(math.Min(float64(len(n1)), float64(len(n2))))
	if minLen >= 5 && n1[:5] == n2[:5] {
		return 100
	}
	if minLen >= 4 && n1[:4] == n2[:4] {
		return 75
	}
	if minLen >= 3 && n1[:3] == n2[:3] {
		return 50
	}
	if minLen >= 2 && n1[:2] == n2[:2] {
		return 25
	}

	return 0
}

// IsPostcodeWithinRange asserts if score satisfies threshold
func IsPostcodeWithinRange(pc1, pc2 string, minScore int) bool {
	return CalculatePostcodeProximity(pc1, pc2) >= minScore
}

// LocationMatchesJob correlates job location with tradesperson settings
func LocationMatchesJob(jobPc, tpPc, tpCity string) bool {
	jobPc = CleanPostcode(jobPc)
	tpPc = CleanPostcode(tpPc)

	if jobPc != "" && tpPc != "" && jobPc == tpPc {
		return true
	}

	if jobPc != "" && tpPc != "" {
		if IsPostcodeWithinRange(jobPc, tpPc, 50) {
			return true
		}
	}

	if jobPc == "" || (tpPc == "" && tpCity == "") {
		return false
	}

	jl := strings.ToLower(jobPc)
	tpLoc := strings.ToLower(fmt.Sprintf("%s %s", tpPc, tpCity))

	return strings.Contains(jl, tpLoc) || strings.Contains(tpLoc, jl)
}

// MatchTradespeople executes geo-matching on candidate list
func MatchTradespeople(ctx context.Context, jobTrade, jobPostcode string, candidates []Tradesperson) []Tradesperson {
	var matched []Tradesperson

	for _, tp := range candidates {
		if !tp.Verified {
			continue
		}

		// Normalize trade categories for matching
		tradeMatch := strings.EqualFold(tp.Trade, jobTrade) ||
			strings.Contains(strings.ToLower(tp.Trade), strings.ToLower(jobTrade)) ||
			strings.Contains(strings.ToLower(jobTrade), strings.ToLower(tp.Trade))

		if !tradeMatch {
			continue
		}

		// Check location bounds
		if LocationMatchesJob(jobPostcode, tp.Postcode, tp.City) {
			matched = append(matched, tp)
		}
	}

	return matched
}
