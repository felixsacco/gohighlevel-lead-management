/**
 * MyApproved SEO Data Configuration
 * Centralised data for programmatic SEO page generation
 * Supports 10,000+ pages for trade + location combinations
 */

// UK Major Cities and Towns - Targeting 150+ locations initially
export const LOCATIONS = [
  // Major Cities (Tier 1 - Highest Search Volume)
  { name: "London", region: "Greater London", population: 8982000, priority: 1, postcodes: ["SW1A", "EC1A", "W1A", "N1", "E1", "SE1"] },
  { name: "Manchester", region: "Greater Manchester", population: 552858, priority: 1, postcodes: ["M1", "M2", "M3"] },
  { name: "Birmingham", region: "West Midlands", population: 1141800, priority: 1, postcodes: ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "B10", "B11", "B12", "B13", "B14", "B15", "B16", "B17", "B18", "B19", "B20", "B21", "B22", "B23", "B24", "B25", "B26", "B27", "B28", "B29", "B30", "B31", "B32", "B33", "B34", "B35", "B36", "B37", "B38", "B40", "B42", "B43", "B44", "B45", "B46", "B47", "B48", "B60", "B61", "B62", "B63", "B64", "B65", "B66", "B67", "B68", "B69", "B70", "B71", "B72", "B73", "B74", "B75", "B76", "B77", "B78", "B79", "B80", "B90", "B91", "B92", "B93", "B94", "B95", "B96", "B97", "B98"] },
  { name: "Leeds", region: "West Yorkshire", population: 812000, priority: 1, postcodes: ["LS1", "LS2", "LS3"] },
  { name: "Glasgow", region: "Scotland", population: 635130, priority: 1, postcodes: ["G1", "G2", "G3"] },
  { name: "Liverpool", region: "Merseyside", population: 498042, priority: 1, postcodes: ["L1", "L2", "L3"] },
  { name: "Newcastle", region: "Tyne and Wear", population: 302820, priority: 1, postcodes: ["NE1", "NE2", "NE3"] },
  { name: "Sheffield", region: "South Yorkshire", population: 556500, priority: 1, postcodes: ["S1", "S2", "S3"] },
  { name: "Bristol", region: "South West", population: 467099, priority: 1, postcodes: ["BS1", "BS2", "BS3"] },
  { name: "Nottingham", region: "East Midlands", population: 321500, priority: 1, postcodes: ["NG1", "NG2", "NG3"] },
  
  // Large Towns (Tier 2 - High Search Volume)
  { name: "Leicester", region: "East Midlands", population: 329300, priority: 2, postcodes: ["LE1", "LE2"] },
  { name: "Coventry", region: "West Midlands", population: 325949, priority: 2, postcodes: ["CV1", "CV2"] },
  { name: "Bradford", region: "West Yorkshire", population: 299310, priority: 2, postcodes: ["BD1", "BD2"] },
  { name: "Cardiff", region: "Wales", population: 362751, priority: 2, postcodes: ["CF10", "CF11"] },
  { name: "Belfast", region: "Northern Ireland", population: 343542, priority: 2, postcodes: ["BT1", "BT2"] },
  { name: "Stoke-on-Trent", region: "Staffordshire", population: 259000, priority: 2, postcodes: ["ST1", "ST2", "ST3", "ST4"] },
  { name: "Wolverhampton", region: "West Midlands", population: 250558, priority: 2, postcodes: ["WV1", "WV2"] },
  { name: "Solihull", region: "West Midlands", population: 126577, priority: 2, postcodes: ["B90", "B91", "B92"] },
  { name: "Dudley", region: "West Midlands", population: 79379, priority: 2, postcodes: ["DY1", "DY2"] },
  { name: "Walsall", region: "West Midlands", population: 67759, priority: 2, postcodes: ["WS1", "WS2"] },
  { name: "West Bromwich", region: "West Midlands", population: 77140, priority: 2, postcodes: ["B70", "B71"] },
  { name: "Sutton Coldfield", region: "West Midlands", population: 95107, priority: 2, postcodes: ["B72", "B73", "B74", "B75"] },
  { name: "Stourbridge", region: "West Midlands", population: 63298, priority: 2, postcodes: ["DY8", "DY9"] },
  { name: "Halesowen", region: "West Midlands", population: 58270, priority: 2, postcodes: ["B62", "B63"] },
  { name: "Derby", region: "Derbyshire", population: 248752, priority: 2, postcodes: ["DE1", "DE22"] },
  { name: "Southampton", region: "Hampshire", population: 252400, priority: 2, postcodes: ["SO14", "SO15"] },
  { name: "Portsmouth", region: "Hampshire", population: 238137, priority: 2, postcodes: ["PO1", "PO2"] },
  { name: "Aberdeen", region: "Scotland", population: 224190, priority: 2, postcodes: ["AB10", "AB11"] },
  { name: "Swansea", region: "Wales", population: 246466, priority: 2, postcodes: ["SA1", "SA2"] },
  { name: "Middlesbrough", region: "North Yorkshire", population: 148300, priority: 2, postcodes: ["TS1", "TS2"] },
  { name: "Northampton", region: "Northamptonshire", population: 212069, priority: 2, postcodes: ["NN1", "NN2"] },
  { name: "Swindon", region: "Wiltshire", population: 182001, priority: 2, postcodes: ["SN1", "SN2"] },
  { name: "Reading", region: "Berkshire", population: 218705, priority: 2, postcodes: ["RG1", "RG2"] },
  { name: "Luton", region: "Bedfordshire", population: 213052, priority: 2, postcodes: ["LU1", "LU2"] },
  { name: "York", region: "North Yorkshire", population: 208400, priority: 2, postcodes: ["YO1", "YO23"] },
  { name: "Blackpool", region: "Lancashire", population: 139446, priority: 2, postcodes: ["FY1", "FY2"] },
  { name: "Plymouth", region: "Devon", population: 264100, priority: 2, postcodes: ["PL1", "PL2"] },
  
  // Medium Towns (Tier 3 - Medium Search Volume)
  { name: "Oxford", region: "Oxfordshire", population: 152000, priority: 3, postcodes: ["OX1", "OX2"] },
  { name: "Cambridge", region: "Cambridgeshire", population: 145000, priority: 3, postcodes: ["CB1", "CB2"] },
  { name: "Norwich", region: "Norfolk", population: 195000, priority: 3, postcodes: ["NR1", "NR2"] },
  { name: "Exeter", region: "Devon", population: 131405, priority: 3, postcodes: ["EX1", "EX2"] },
  { name: "Ipswich", region: "Suffolk", population: 144957, priority: 3, postcodes: ["IP1", "IP2"] },
  { name: "Peterborough", region: "Cambridgeshire", population: 194000, priority: 3, postcodes: ["PE1", "PE2"] },
  { name: "Sunderland", region: "Tyne and Wear", population: 277417, priority: 3, postcodes: ["SR1", "SR2"] },
  { name: "Gloucester", region: "Gloucestershire", population: 118555, priority: 3, postcodes: ["GL1", "GL2"] },
  { name: "Cheltenham", region: "Gloucestershire", population: 116447, priority: 3, postcodes: ["GL50", "GL51"] },
  { name: "Watford", region: "Hertfordshire", population: 131325, priority: 3, postcodes: ["WD17", "WD18"] },
  { name: "Colchester", region: "Essex", population: 121859, priority: 3, postcodes: ["CO1", "CO2"] },
  { name: "Milton Keynes", region: "Buckinghamshire", population: 229941, priority: 3, postcodes: ["MK9", "MK10"] },
  { name: "St Albans", region: "Hertfordshire", population: 147022, priority: 3, postcodes: ["AL1", "AL2"] },
  { name: "Harrogate", region: "North Yorkshire", population: 75070, priority: 3, postcodes: ["HG1", "HG2"] },
  { name: "Chester", region: "Cheshire", population: 87593, priority: 3, postcodes: ["CH1", "CH2"] },
  { name: "Carlisle", region: "Cumbria", population: 75300, priority: 3, postcodes: ["CA1", "CA2"] },
  { name: "Dundee", region: "Scotland", population: 148280, priority: 3, postcodes: ["DD1", "DD2"] },
  { name: "Edinburgh", region: "Scotland", population: 524930, priority: 3, postcodes: ["EH1", "EH2"] },
  { name: "Inverness", region: "Scotland", population: 70000, priority: 3, postcodes: ["IV1", "IV2"] },
  { name: "Hull", region: "East Yorkshire", population: 260200, priority: 3, postcodes: ["HU1", "HU2"] },
] as const;

// Trade Categories with SEO-optimised data
export const TRADES = [
  // Core Building Trades (Highest Demand)
  {
    slug: "plumber",
    name: "Plumber",
    plural: "Plumbers",
    category: "Building & Construction",
    description: "Professional plumbing services including repairs, installations, and emergency call-outs",
    services: ["Leak Repairs", "Boiler Installation", "Bathroom Fitting", "Pipe Repairs", "Emergency Plumbing", "Central Heating", "Tap Installation", "Toilet Repairs", "Shower Installation", "Radiator Repairs"],
    keywords: ["plumber", "plumbing", "emergency plumber", "local plumber", "boiler repair", "leak detection"],
    hourlyRate: "£40-£70",
    priority: 1
  },
  {
    slug: "electrician",
    name: "Electrician",
    plural: "Electricians",
    category: "Building & Construction",
    description: "Qualified electrical contractors for domestic and commercial installations and repairs",
    services: ["Rewiring", "Socket Installation", "Fuse Box Upgrades", "Lighting Installation", "Emergency Electrics", "PAT Testing", "Outdoor Lighting", "EV Charger Installation", "Fault Finding", "Security Systems"],
    keywords: ["electrician", "electrical", "emergency electrician", "local electrician", "rewiring", "fuse box"],
    hourlyRate: "£45-£75",
    priority: 1
  },
  {
    slug: "builder",
    name: "Builder",
    plural: "Builders",
    category: "Building & Construction",
    description: "General building contractors for extensions, renovations, and construction projects",
    services: ["House Extensions", "Loft Conversions", "Garage Conversions", "Renovations", "Structural Work", "New Builds", "Garden Rooms", "Porches", "Conservatories", "Driveways"],
    keywords: ["builder", "building contractor", "extension builder", "renovation", "loft conversion"],
    hourlyRate: "£35-£60",
    priority: 1
  },
  {
    slug: "roofer",
    name: "Roofer",
    plural: "Roofers",
    category: "Building & Construction",
    description: "Expert roofing services for repairs, replacements, and new installations",
    services: ["Roof Repairs", "New Roofs", "Flat Roofing", "Tile Replacement", "Guttering", "Chimney Repairs", "Lead Work", "Fascias & Soffits", "Emergency Roofing", "Roof Inspections"],
    keywords: ["roofer", "roofing", "roof repair", "new roof", "emergency roofer", "guttering"],
    hourlyRate: "£35-£55",
    priority: 1
  },
  {
    slug: "carpenter",
    name: "Carpenter",
    plural: "Carpenters",
    category: "Building & Construction",
    description: "Skilled carpentry and joinery services for bespoke woodwork and installations",
    services: ["Bespoke Furniture", "Kitchen Fitting", "Door Hanging", "Floor Laying", "Staircase Repairs", "Skirting Boards", "Window Frames", "Decking", "Partition Walls", "Built-in Storage"],
    keywords: ["carpenter", "carpentry", "joiner", "bespoke furniture", "kitchen fitting"],
    hourlyRate: "£35-£55",
    priority: 1
  },
  
  // Home Improvement Trades
  {
    slug: "painter-decorator",
    name: "Painter & Decorator",
    plural: "Painters & Decorators",
    category: "Home Improvement",
    description: "Professional painting and decorating for interior and exterior projects",
    services: ["Interior Painting", "Exterior Painting", "Wallpaper Hanging", "Coving", "Plastering", "Spray Painting", "Floor Painting", "Fence Painting", "Wallpaper Removal", "Colour Consultation"],
    keywords: ["painter", "decorator", "painting", "wallpaper", "interior painting", "exterior painting"],
    hourlyRate: "£25-£45",
    priority: 2
  },
  {
    slug: "kitchen-fitter",
    name: "Kitchen Fitter",
    plural: "Kitchen Fitters",
    category: "Home Improvement",
    description: "Specialist kitchen installation and fitting services",
    services: ["Kitchen Installation", "Worktop Fitting", "Appliance Installation", "Plumbing", "Electrical Work", "Tiling", "Cabinet Fitting", "Kitchen Design", "Kitchen Refurbishment", "Kitchen Repairs"],
    keywords: ["kitchen fitter", "kitchen installation", "new kitchen", "kitchen design"],
    hourlyRate: "£35-£55",
    priority: 2
  },
  {
    slug: "bathroom-fitter",
    name: "Bathroom Fitter",
    plural: "Bathroom Fitters",
    category: "Home Improvement",
    description: "Complete bathroom installation and renovation services",
    services: ["Bathroom Installation", "Wet Rooms", "En-suites", "Shower Installation", "Bath Fitting", "Tiling", "Plumbing", "Underfloor Heating", "Bathroom Design", "Bathroom Repairs"],
    keywords: ["bathroom fitter", "bathroom installation", "new bathroom", "wet room"],
    hourlyRate: "£35-£55",
    priority: 2
  },
  {
    slug: "tiler",
    name: "Tiler",
    plural: "Tilers",
    category: "Home Improvement",
    description: "Professional tiling services for floors, walls, and specialist projects",
    services: ["Wall Tiling", "Floor Tiling", "Bathroom Tiling", "Kitchen Tiling", "Mosaic Work", "Natural Stone", "Underfloor Heating", "Tile Repairs", "Grouting", "Sealing"],
    keywords: ["tiler", "tiling", "floor tiling", "wall tiling", "bathroom tiles"],
    hourlyRate: "£30-£50",
    priority: 2
  },
  {
    slug: "flooring",
    name: "Flooring Specialist",
    plural: "Flooring Specialists",
    category: "Home Improvement",
    description: "Expert flooring installation for all types of domestic and commercial floors",
    services: ["Hardwood Flooring", "Laminate Flooring", "Carpet Fitting", "Vinyl Flooring", "Engineered Wood", "Floor Sanding", "Floor Repairs", "Skirting", "Underlay", "Commercial Flooring"],
    keywords: ["flooring", "floor fitter", "carpet fitter", "wood flooring", "laminate"],
    hourlyRate: "£25-£45",
    priority: 2
  },
  
  // Specialist Trades
  {
    slug: "gas-engineer",
    name: "Gas Engineer",
    plural: "Gas Engineers",
    category: "Specialist",
    description: "Gas Safe registered engineers for boiler and heating system work",
    services: ["Boiler Repairs", "Boiler Servicing", "Boiler Installation", "Gas Safety Certificates", "Central Heating", "Gas Leaks", "Cooker Installation", "Fire Installation", "Landlord Certificates", "Emergency Repairs"],
    keywords: ["gas engineer", "gas safe", "boiler repair", "boiler service", "gas certificate"],
    hourlyRate: "£60-£100",
    priority: 1
  },
  {
    slug: "plasterer",
    name: "Plasterer",
    plural: "Plasterers",
    category: "Specialist",
    description: "Professional plastering and rendering for smooth, quality finishes",
    services: ["Skimming", "Plastering", "Rendering", "Dry Lining", "Coving", "Artex Removal", "External Rendering", "Internal Plastering", "Patch Repairs", "Soundproofing"],
    keywords: ["plasterer", "plastering", "rendering", "skimming", "dry lining"],
    hourlyRate: "£30-£50",
    priority: 2
  },
  {
    slug: "locksmith",
    name: "Locksmith",
    plural: "Locksmiths",
    category: "Specialist",
    description: "24/7 locksmith services for emergencies, security upgrades, and lock repairs",
    services: ["Emergency Entry", "Lock Repairs", "Lock Replacement", "UPVC Locks", "Digital Locks", "Key Cutting", "Security Surveys", "Burglary Repairs", "Safe Opening", "Master Key Systems"],
    keywords: ["locksmith", "emergency locksmith", "lock repair", "24 hour locksmith"],
    hourlyRate: "£60-£120",
    priority: 1
  },
  {
    slug: "window-fitter",
    name: "Window Fitter",
    plural: "Window Fitters",
    category: "Specialist",
    description: "Window and door installation including double glazing and repairs",
    services: ["Window Installation", "Door Installation", "Double Glazing", "Triple Glazing", "UPVC Windows", "Composite Doors", "French Doors", "Bi-fold Doors", "Conservatory Doors", "Repairs"],
    keywords: ["window fitter", "double glazing", "window installation", "door fitter"],
    hourlyRate: "£35-£55",
    priority: 2
  },
  {
    slug: "heating-engineer",
    name: "Heating Engineer",
    plural: "Heating Engineers",
    category: "Specialist",
    description: "Heating system specialists for installation, repairs, and servicing",
    services: ["Central Heating", "Boiler Repairs", "Radiator Installation", "Underfloor Heating", "Heat Pumps", "Smart Thermostats", "Power Flushing", "System Upgrades", "Emergency Repairs", "Annual Servicing"],
    keywords: ["heating engineer", "central heating", "boiler repair", "radiator repair"],
    hourlyRate: "£50-£80",
    priority: 1
  },
  
  // Outdoor & Garden Trades
  {
    slug: "gardener",
    name: "Gardener",
    plural: "Gardeners",
    category: "Outdoor",
    description: "Professional garden maintenance and landscaping services",
    services: ["Garden Maintenance", "Lawn Care", "Hedge Trimming", "Tree Surgery", "Landscaping", "Patio Cleaning", "Planting", "Garden Design", "Weed Control", "Seasonal Clearance"],
    keywords: ["gardener", "garden maintenance", "landscaping", "lawn care", "tree surgeon"],
    hourlyRate: "£25-£40",
    priority: 2
  },
  {
    slug: "landscaper",
    name: "Landscaper",
    plural: "Landscapers",
    category: "Outdoor",
    description: "Complete garden transformation and hard landscaping services",
    services: ["Garden Design", "Patio Installation", "Decking", "Fencing", "Driveways", "Turfing", "Water Features", "Garden Lighting", "Retaining Walls", "Garden Rooms"],
    keywords: ["landscaper", "landscaping", "garden design", "patio", "decking"],
    hourlyRate: "£30-£50",
    priority: 2
  },
  {
    slug: "fencer",
    name: "Fencer",
    plural: "Fencers",
    category: "Outdoor",
    description: "Fencing installation and repairs for all types of boundaries",
    services: ["Fence Installation", "Fence Repairs", "Gate Installation", "Panel Fencing", "Close Board Fencing", "Picket Fencing", "Security Fencing", "Garden Gates", "Fence Treatment", "Post Replacement"],
    keywords: ["fencer", "fencing", "fence repair", "garden fence", "gate installation"],
    hourlyRate: "£25-£40",
    priority: 2
  },
  {
    slug: "driveway-specialist",
    name: "Driveway Specialist",
    plural: "Driveway Specialists",
    category: "Outdoor",
    description: "Driveway installation and surfacing for all materials and styles",
    services: ["Block Paving", "Tarmac", "Resin Bound", "Gravel Driveways", "Concrete Driveways", "Pattern Imprinted Concrete", "Driveway Repairs", "Driveway Cleaning", "Sealing", "Edging"],
    keywords: ["driveway specialist", "block paving", "tarmac driveway", "resin driveway"],
    hourlyRate: "£30-£50",
    priority: 2
  },
  
  // Cleaning & Maintenance
  {
    slug: "cleaner",
    name: "Cleaner",
    plural: "Cleaners",
    category: "Cleaning",
    description: "Professional domestic and commercial cleaning services",
    services: ["Domestic Cleaning", "Deep Cleaning", "End of Tenancy", "Office Cleaning", "Carpet Cleaning", "Upholstery Cleaning", "Window Cleaning", "Oven Cleaning", "After Builders", "Regular Cleaning"],
    keywords: ["cleaner", "cleaning service", "domestic cleaner", "deep clean", "end of tenancy"],
    hourlyRate: "£15-£25",
    priority: 3
  },
  {
    slug: "waste-removal",
    name: "Waste Removal",
    plural: "Waste Removal",
    category: "Cleaning",
    description: "Rubbish clearance and waste disposal services",
    services: ["House Clearance", "Garden Waste", "Builder's Waste", "Furniture Removal", "Rubbish Clearance", "Skip Hire Alternative", "Garage Clearance", "Loft Clearance", "Commercial Waste", "Recycling"],
    keywords: ["waste removal", "rubbish clearance", "house clearance", "waste disposal"],
    hourlyRate: "£150-£400 per load",
    priority: 3
  },
  {
    slug: "carpet-cleaner",
    name: "Carpet Cleaner",
    plural: "Carpet Cleaners",
    category: "Cleaning",
    description: "Professional carpet and upholstery cleaning services",
    services: ["Carpet Cleaning", "Rug Cleaning", "Upholstery Cleaning", "Stain Removal", "Deodorising", "Scotchgard Protection", "Commercial Carpets", "Steam Cleaning", "Dry Cleaning", "Leather Cleaning"],
    keywords: ["carpet cleaner", "carpet cleaning", "upholstery cleaning", "stain removal"],
    hourlyRate: "£80-£200 per room",
    priority: 3
  },
  
  // Security & Emergency
  {
    slug: "security-installer",
    name: "Security Installer",
    plural: "Security Installers",
    category: "Security",
    description: "Home and business security system installation",
    services: ["CCTV Installation", "Alarm Systems", "Access Control", "Intercoms", "Smart Security", "Motion Sensors", "Door Entry Systems", "Security Lighting", "Safe Installation", "Maintenance"],
    keywords: ["security installer", "CCTV installation", "alarm installation", "security systems"],
    hourlyRate: "£50-£80",
    priority: 2
  },
  {
    slug: "pest-control",
    name: "Pest Control",
    plural: "Pest Control",
    category: "Specialist",
    description: "Professional pest removal and prevention services",
    services: ["Rat Control", "Mouse Control", "Wasp Nest Removal", "Ant Treatment", "Cockroach Control", "Bed Bug Treatment", "Flea Treatment", "Moth Control", "Bird Control", "Prevention"],
    keywords: ["pest control", "wasp nest removal", "rat control", "pest removal"],
    hourlyRate: "£80-£200",
    priority: 2
  },
  {
    slug: "damp-specialist",
    name: "Damp Specialist",
    plural: "Damp Specialists",
    category: "Specialist",
    description: "Damp proofing and timber treatment specialists",
    services: ["Damp Surveys", "Damp Proofing", "Rising Damp", "Condensation Control", "Penetrating Damp", "Timber Treatment", "Woodworm Treatment", "Dry Rot", "Cellar Tanking", "Cavity Wall"],
    keywords: ["damp specialist", "damp proofing", "rising damp", "timber treatment"],
    hourlyRate: "£45-£75",
    priority: 2
  },
  {
    slug: "scaffolder",
    name: "Scaffolder",
    plural: "Scaffolders",
    category: "Specialist",
    description: "Scaffolding hire and erection for construction and maintenance",
    services: ["Scaffolding Erection", "Scaffold Hire", "Domestic Scaffolding", "Commercial Scaffolding", "Access Towers", "Temporary Roofing", "Safety Inspections", "Scaffold Design", "Dismantling", "Emergency Scaffolding"],
    keywords: ["scaffolder", "scaffolding", "scaffold hire", "access towers"],
    hourlyRate: "£250-£800 per week",
    priority: 3
  },
  {
    slug: "chimney-sweep",
    name: "Chimney Sweep",
    plural: "Chimney Sweeps",
    category: "Specialist",
    description: "Professional chimney sweeping and inspection services",
    services: ["Chimney Sweeping", "Chimney Inspections", "CCTV Surveys", "Bird Nest Removal", "Cowls & Caps", "Smoke Testing", "Certificate Issuing", "Stove Installation", "Chimney Repairs", "Maintenance"],
    keywords: ["chimney sweep", "chimney sweeping", "chimney inspection", "stove installation"],
    hourlyRate: "£60-£120",
    priority: 3
  },
  {
    slug: "loft-insulation",
    name: "Loft Insulation",
    plural: "Loft Insulation",
    category: "Specialist",
    description: "Professional loft insulation installation and upgrades",
    services: ["Loft Insulation", "Cavity Wall Insulation", "Solid Wall Insulation", "Draught Proofing", "Energy Surveys", "Insulation Removal", "Boarding", "Storage Solutions", "Grant Applications", "Soundproofing"],
    keywords: ["loft insulation", "cavity wall insulation", "insulation grants", "energy efficiency"],
    hourlyRate: "£400-£800",
    priority: 3
  },
  
  // Additional High-Value Trades
  {
    slug: "air-conditioning",
    name: "Air Conditioning",
    plural: "Air Conditioning",
    category: "Specialist",
    description: "Air conditioning installation, repairs, and servicing",
    services: ["AC Installation", "AC Repairs", "AC Servicing", "Heat Pumps", "Split Systems", "Commercial AC", "Domestic AC", "Maintenance", "Gas Recharge", "Fault Finding"],
    keywords: ["air conditioning", "AC installation", "air con repair", "heat pump"],
    hourlyRate: "£60-£100",
    priority: 2
  },
  {
    slug: "solar-panel-installer",
    name: "Solar Panel Installer",
    plural: "Solar Panel Installers",
    category: "Specialist",
    description: "Solar panel and renewable energy system installation",
    services: ["Solar PV", "Solar Thermal", "Battery Storage", "Inverters", "EV Chargers", "MCS Certification", "Maintenance", "Repairs", "System Upgrades", "Monitoring"],
    keywords: ["solar panel installer", "solar PV", "battery storage", "renewable energy"],
    hourlyRate: "£500-£1500 per day",
    priority: 2
  },
  {
    slug: "handyman",
    name: "Handyman",
    plural: "Handymen",
    category: "Home Improvement",
    description: "General handyman services for odd jobs and repairs",
    services: ["General Repairs", "Flat Pack Assembly", "Picture Hanging", "Shelf Installation", "Curtain Rails", "TV Mounting", "Minor Plumbing", "Minor Electrics", "Garden Maintenance", "Odd Jobs"],
    keywords: ["handyman", "handyman services", "odd jobs", "home repairs"],
    hourlyRate: "£25-£40",
    priority: 3
  },
  {
    slug: "loft-conversion",
    name: "Loft Conversion Specialist",
    plural: "Loft Conversion Specialists",
    category: "Building & Construction",
    description: "Complete loft conversion design and build services",
    services: ["Dormer Lofts", "Mansard Lofts", "Hip-to-Gable", "Velux Lofts", "Structural Work", "Staircases", "Insulation", "Windows", "Planning Permission", "Building Regulations"],
    keywords: ["loft conversion", "loft extension", "dormer loft", "attic conversion"],
    hourlyRate: "£35,000-£60,000",
    priority: 1
  },
  {
    slug: "conservatory",
    name: "Conservatory Installer",
    plural: "Conservatory Installers",
    category: "Building & Construction",
    description: "Conservatory and orangery installation services",
    services: ["Conservatory Installation", "Orangeries", "Glass Extensions", "Conservatory Repairs", "Roof Replacements", "Heating", "Lighting", "Planning", "Bases", "Design"],
    keywords: ["conservatory installer", "conservatory installation", "orangery", "glass extension"],
    hourlyRate: "£15,000-£40,000",
    priority: 2
  },
] as const;

// Service modifiers for long-tail keywords
export const SERVICE_MODIFIERS = [
  "Emergency",
  "24 Hour",
  "Local",
  "Cheap",
  "Affordable",
  "Best",
  "Checked",
  "Gas Safe",
  "NIC EIC",
  "FENSA",
  "Which Trusted Trader",
  "Checkatrade",
  "Same Day",
  "Next Day",
  "Weekend",
  "Evening",
  "Commercial",
  "Domestic",
  "Industrial"
] as const;

// Content templates for programmatic pages
export const CONTENT_TEMPLATES = {
  tradePage: {
    intro: (trade: string, location: string) => `Looking for a trusted ${trade.toLowerCase()} in ${location}? MyApproved connects you with identity-checked, ${location}-based ${trade.toLowerCase()}s whose public liability insurance is confirmed and monitored.`,
    whyChoose: (trade: string) => `Why choose MyApproved ${trade}s?`,
    services: (trade: string, location: string) => `Popular ${trade} services in ${location}`,
    areas: (trade: string, location: string) => `${trade} services available across ${location} and surrounding areas`,
    faq: (trade: string, location: string) => `Common questions about hiring a ${trade.toLowerCase()} in ${location}`,
    cta: (trade: string, location: string) => `Ready to find your ${trade.toLowerCase()} in ${location}?`,
  },
  
  locationPage: {
    intro: (location: string) => `Find trusted local tradespeople in ${location}. MyApproved connects you with identity-checked professionals across ${location} whose public liability insurance is confirmed and ready to help with your home improvement projects.`,
    popularTrades: (location: string) => `Most popular trades in ${location}`,
    whyLocal: (location: string) => `Why choose local ${location} tradespeople?`,
    areas: (location: string) => `Areas we cover in and around ${location}`,
    cta: (location: string) => `Ready to find a tradesperson in ${location}?`,
  }
};

// Generate dynamic metadata for trade + location pages
export function generateTradeLocationMetadata(tradeSlug: string, locationSlug: string) {
  const trade = TRADES.find(t => t.slug === tradeSlug);
  const location = LOCATIONS.find(l => l.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') === locationSlug);
  
  if (!trade || !location) return null;
  
  const tradeName = trade.name;
  const locationName = location.name;
  
  return {
    title: `${tradeName} in ${locationName} | Identity-Checked ${trade.plural} - Get Free Quotes | MyApproved™`,
    description: `Find identity-checked ${tradeName.toLowerCase()}s in ${locationName}. Compare ${trade.plural.toLowerCase()}, read reviews, and get free quotes. All ${tradeName.toLowerCase()}s are identity-checked and their public liability insurance is confirmed and monitored. Book your ${locationName} ${tradeName.toLowerCase()} today.`,
    openGraph: {
      title: `${tradeName}s in ${locationName} | Get Free Quotes from Identity-Checked ${trade.plural}`,
      description: `Connect with identity-checked ${tradeName.toLowerCase()}s in ${locationName}. Free quotes, customer reviews, same-day service available.`,
    }
  };
}

// Generate schema for trade + location
export function generateTradeLocationSchema(tradeSlug: string, locationSlug: string) {
  const trade = TRADES.find(t => t.slug === tradeSlug);
  const location = LOCATIONS.find(l => l.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') === locationSlug);
  
  if (!trade || !location) return null;
  
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `${trade.name} Services in ${location.name}`,
    "description": `Professional ${trade.name.toLowerCase()} services in ${location.name}. Identity-checked, public liability insured, and reviewed by real customers.`,
    "provider": {
      "@type": "LocalBusiness",
      "name": `MyApproved ${trade.name}s`,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": location.name,
        "addressRegion": location.region,
        "addressCountry": "GB"
      },
      "areaServed": {
        "@type": "City",
        "name": location.name
      }
    },
    "serviceType": trade.name,
    "areaServed": {
      "@type": "City",
      "name": location.name
    }
  };
}

// Type exports
export type Trade = typeof TRADES[number];
export type Location = typeof LOCATIONS[number];
export type ServiceModifier = typeof SERVICE_MODIFIERS[number];
