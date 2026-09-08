/**
 * MyApproved SEO Data Configuration
 * Centralised data for programmatic SEO page generation
 * Supports 10,000+ pages for trade + location combinations
 */

// UK Major Cities and Towns - Targeting 150+ locations initially
export const LOCATIONS = [
  // Major Cities (Tier 1 - Highest Search Volume)
  { name: "London", region: "Greater London", population: 8982000, priority: 1, postcodes: ["SW1A", "EC1A", "W1A", "N1", "E1", "SE1"] },
  { name: "Manchester", region: "Greater Manchester", population: 552858, priority: 1, postcodes: ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9", "M11", "M12", "M13", "M14", "M15", "M16", "M17", "M18", "M19", "M20", "M21", "M22", "M23", "M24", "M25", "M26", "M27", "M28", "M29", "M30", "M31", "M32", "M33", "M34", "M35", "M38", "M40", "M41", "M43", "M44", "M45", "M46", "M50", "M90"] },
  { name: "Birmingham", region: "West Midlands", population: 1141800, priority: 1, postcodes: ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "B10", "B11", "B12", "B13", "B14", "B15", "B16", "B17", "B18", "B19", "B20", "B21", "B22", "B23", "B24", "B25", "B26", "B27", "B28", "B29", "B30", "B31", "B32", "B33", "B34", "B35", "B36", "B37", "B38", "B40", "B42", "B43", "B44", "B45", "B46", "B47", "B48", "B60", "B61", "B62", "B63", "B64", "B65", "B66", "B67", "B68", "B69", "B70", "B71", "B72", "B73", "B74", "B75", "B76", "B77", "B78", "B79", "B80", "B90", "B91", "B92", "B93", "B94", "B95", "B96", "B97", "B98"] },
  { name: "Leeds", region: "West Yorkshire", population: 812000, priority: 1, postcodes: ["LS1", "LS2", "LS3", "LS4", "LS5", "LS6", "LS7", "LS8", "LS9", "LS10", "LS11", "LS12", "LS13", "LS14", "LS15", "LS16", "LS17", "LS18", "LS19", "LS20", "LS21", "LS22", "LS23", "LS24", "LS25", "LS26", "LS27", "LS28", "LS29"] },
  { name: "Glasgow", region: "Scotland", population: 635130, priority: 1, postcodes: ["G1", "G2", "G3", "G4", "G5", "G11", "G12", "G13", "G14", "G15", "G20", "G21", "G22", "G23", "G31", "G32", "G33", "G34", "G40", "G41", "G42", "G43", "G44", "G45", "G46", "G51", "G52", "G53", "G60", "G61", "G62", "G63", "G64", "G65", "G66", "G67", "G68", "G69", "G71", "G72", "G73", "G74", "G75", "G76", "G77", "G78", "G81", "G82", "G83", "G84"] },
  { name: "Liverpool", region: "Merseyside", population: 498042, priority: 1, postcodes: ["L1", "L2", "L3", "L4", "L5", "L6", "L7", "L8", "L9", "L10", "L11", "L12", "L13", "L14", "L15", "L16", "L17", "L18", "L19", "L20", "L21", "L22", "L23", "L24", "L25", "L26", "L27", "L28", "L29", "L30", "L31", "L32", "L33", "L34", "L35", "L36", "L37", "L38", "L39", "L40"] },
  { name: "Newcastle", region: "Tyne and Wear", population: 302820, priority: 1, postcodes: ["NE1", "NE2", "NE3", "NE4", "NE5", "NE6", "NE7", "NE8", "NE9", "NE10", "NE11", "NE12", "NE13", "NE15", "NE16", "NE17", "NE18", "NE19", "NE20", "NE21", "NE22", "NE23", "NE24", "NE25", "NE26", "NE27", "NE28", "NE29", "NE30", "NE31", "NE32", "NE33", "NE34", "NE35", "NE36", "NE37", "NE38", "NE39", "NE40", "NE41", "NE42", "NE43", "NE44", "NE45", "NE46", "NE47", "NE48", "NE49", "NE61", "NE62", "NE63", "NE64", "NE65", "NE66", "NE67", "NE68", "NE69", "NE70", "NE71"] },
  { name: "Sheffield", region: "South Yorkshire", population: 556500, priority: 1, postcodes: ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10", "S11", "S12", "S13", "S14", "S17", "S18", "S20", "S21", "S25", "S26", "S32", "S33", "S35", "S36", "S40", "S41", "S42", "S43", "S44", "S45", "S60", "S61", "S62", "S63", "S64", "S65", "S66", "S70", "S71", "S72", "S73", "S74", "S75", "S80", "S81"] },
  { name: "Bristol", region: "South West", population: 467099, priority: 1, postcodes: ["BS1", "BS2", "BS3", "BS4", "BS5", "BS6", "BS7", "BS8", "BS9", "BS10", "BS11", "BS13", "BS14", "BS15", "BS16", "BS20", "BS21", "BS22", "BS23", "BS24", "BS25", "BS26", "BS27", "BS28", "BS29", "BS30", "BS31", "BS32", "BS34", "BS35", "BS36", "BS37", "BS39", "BS40", "BS41", "BS48", "BS49"] },
  { name: "Nottingham", region: "East Midlands", population: 321500, priority: 1, postcodes: ["NG1", "NG2", "NG3", "NG4", "NG5", "NG6", "NG7", "NG8", "NG9", "NG10", "NG11", "NG12", "NG13", "NG14", "NG15", "NG16", "NG17", "NG18", "NG19", "NG20", "NG21", "NG22", "NG23", "NG24", "NG25", "NG31", "NG32", "NG33", "NG34"] },

  // Large Towns (Tier 2 - High Search Volume)
  { name: "Leicester", region: "East Midlands", population: 329300, priority: 2, postcodes: ["LE1", "LE2", "LE3", "LE4", "LE5", "LE6", "LE7", "LE8", "LE9", "LE10", "LE11", "LE12", "LE13", "LE14", "LE15", "LE16", "LE17", "LE18", "LE19", "LE65", "LE67"] },
  { name: "Coventry", region: "West Midlands", population: 325949, priority: 2, postcodes: ["CV1", "CV2", "CV3", "CV4", "CV5", "CV6", "CV7", "CV8", "CV9", "CV10", "CV11", "CV12", "CV13", "CV21", "CV22", "CV23", "CV31", "CV32", "CV33", "CV34", "CV35", "CV36", "CV37", "CV47"] },
  { name: "Bradford", region: "West Yorkshire", population: 299310, priority: 2, postcodes: ["BD1", "BD2", "BD3", "BD4", "BD5", "BD6", "BD7", "BD8", "BD9", "BD10", "BD11", "BD12", "BD13", "BD14", "BD15", "BD16", "BD17", "BD18", "BD19", "BD20", "BD21", "BD22", "BD23", "BD24"] },
  { name: "Cardiff", region: "Wales", population: 362751, priority: 2, postcodes: ["CF3", "CF5", "CF10", "CF11", "CF14", "CF15", "CF23", "CF24", "CF31", "CF32", "CF33", "CF34", "CF35", "CF36", "CF37", "CF38", "CF39", "CF40", "CF41", "CF42", "CF43", "CF44", "CF45", "CF46", "CF47", "CF48", "CF61", "CF62", "CF63", "CF64", "CF71", "CF72", "CF81", "CF82", "CF83"] },
  { name: "Belfast", region: "Northern Ireland", population: 343542, priority: 2, postcodes: ["BT1", "BT2", "BT3", "BT4", "BT5", "BT6", "BT7", "BT8", "BT9", "BT10", "BT11", "BT12", "BT13", "BT14", "BT15", "BT16", "BT17", "BT18", "BT19", "BT20", "BT21", "BT22", "BT23", "BT24", "BT25", "BT26", "BT27", "BT28", "BT29", "BT30", "BT31", "BT32", "BT33", "BT34", "BT35", "BT36", "BT37", "BT38", "BT39", "BT40", "BT41", "BT42", "BT43", "BT44", "BT45", "BT46", "BT47", "BT48", "BT49", "BT51", "BT52", "BT53", "BT54", "BT55", "BT56", "BT57", "BT60", "BT61", "BT62", "BT63", "BT64", "BT65", "BT66", "BT67", "BT68", "BT69", "BT70", "BT71", "BT74", "BT75", "BT76", "BT77", "BT78", "BT79", "BT80", "BT81", "BT82", "BT92", "BT93", "BT94"] },
  { name: "Stoke-on-Trent", region: "Staffordshire", population: 259000, priority: 2, postcodes: ["ST1", "ST2", "ST3", "ST4", "ST5", "ST6", "ST7", "ST8", "ST9", "ST10", "ST11", "ST12", "ST13", "ST14", "ST15", "ST16", "ST17", "ST18", "ST19", "ST20", "ST21"] },
  { name: "Wolverhampton", region: "West Midlands", population: 250558, priority: 2, postcodes: ["WV1", "WV2", "WV3", "WV4", "WV5", "WV6", "WV7", "WV8", "WV9", "WV10", "WV11", "WV12", "WV13", "WV14", "WV15", "WV16"] },
  { name: "Solihull", region: "West Midlands", population: 126577, priority: 2, postcodes: ["B90", "B91", "B92"] },
  { name: "Dudley", region: "West Midlands", population: 79379, priority: 2, postcodes: ["DY1", "DY2", "DY3", "DY4", "DY5", "DY6", "DY7", "DY8", "DY9", "DY10", "DY11", "DY12", "DY13", "DY14"] },
  { name: "Walsall", region: "West Midlands", population: 67759, priority: 2, postcodes: ["WS1", "WS2", "WS3", "WS4", "WS5", "WS6", "WS7", "WS8", "WS9", "WS10", "WS11", "WS12", "WS13", "WS14", "WS15"] },
  { name: "West Bromwich", region: "West Midlands", population: 77140, priority: 2, postcodes: ["B70", "B71"] },
  { name: "Sutton Coldfield", region: "West Midlands", population: 95107, priority: 2, postcodes: ["B72", "B73", "B74", "B75"] },
  { name: "Stourbridge", region: "West Midlands", population: 63298, priority: 2, postcodes: ["DY1", "DY2", "DY3", "DY4", "DY5", "DY6", "DY7", "DY8", "DY9", "DY10", "DY11", "DY12", "DY13", "DY14"] },
  { name: "Halesowen", region: "West Midlands", population: 58270, priority: 2, postcodes: ["B62", "B63"] },
  { name: "Derby", region: "Derbyshire", population: 248752, priority: 2, postcodes: ["DE1", "DE3", "DE4", "DE5", "DE6", "DE7", "DE11", "DE12", "DE13", "DE14", "DE15", "DE21", "DE22", "DE23", "DE24", "DE45", "DE55", "DE56", "DE65", "DE72", "DE73", "DE74", "DE75"] },
  { name: "Southampton", region: "Hampshire", population: 252400, priority: 2, postcodes: ["SO14", "SO15", "SO16", "SO17", "SO18", "SO19", "SO20", "SO21", "SO22", "SO23", "SO24", "SO30", "SO31", "SO32", "SO40", "SO41", "SO42", "SO43", "SO45", "SO50", "SO51", "SO52", "SO53"] },
  { name: "Portsmouth", region: "Hampshire", population: 238137, priority: 2, postcodes: ["PO1", "PO2", "PO3", "PO4", "PO5", "PO6", "PO7", "PO8", "PO9", "PO10", "PO11", "PO12", "PO13", "PO14", "PO15", "PO16", "PO17", "PO18", "PO19", "PO20", "PO21", "PO22", "PO30", "PO31", "PO32", "PO33", "PO34", "PO35", "PO36", "PO37", "PO38", "PO39", "PO40", "PO41"] },
  { name: "Aberdeen", region: "Scotland", population: 224190, priority: 2, postcodes: ["AB10", "AB11", "AB12", "AB13", "AB14", "AB15", "AB16", "AB21", "AB22", "AB23", "AB24", "AB25", "AB30", "AB31", "AB32", "AB33", "AB34", "AB35", "AB36", "AB37", "AB38", "AB39", "AB41", "AB42", "AB43", "AB44", "AB45", "AB51", "AB52", "AB53", "AB54", "AB55", "AB56"] },
  { name: "Swansea", region: "Wales", population: 246466, priority: 2, postcodes: ["SA1", "SA2", "SA3", "SA4", "SA5", "SA6", "SA7", "SA8", "SA9", "SA10", "SA11", "SA12", "SA13", "SA14", "SA15", "SA16", "SA17", "SA18", "SA19", "SA20", "SA31", "SA32", "SA33", "SA34", "SA35", "SA36", "SA37", "SA38", "SA39", "SA40", "SA41", "SA42", "SA43", "SA44", "SA45", "SA46", "SA47", "SA48", "SA61", "SA62", "SA63", "SA64", "SA65", "SA66", "SA67", "SA68", "SA69", "SA70", "SA71", "SA72", "SA73"] },
  { name: "Middlesbrough", region: "North Yorkshire", population: 148300, priority: 2, postcodes: ["TS1", "TS2", "TS3", "TS4", "TS5", "TS6", "TS7", "TS8", "TS9", "TS10", "TS11", "TS12", "TS13", "TS14", "TS15", "TS16", "TS17", "TS18", "TS19", "TS20", "TS21", "TS22", "TS23", "TS24", "TS25", "TS26", "TS27", "TS28", "TS29"] },
  { name: "Northampton", region: "Northamptonshire", population: 212069, priority: 2, postcodes: ["NN1", "NN2", "NN3", "NN4", "NN5", "NN6", "NN7", "NN8", "NN9", "NN10", "NN11", "NN12", "NN13", "NN14", "NN15", "NN16", "NN17", "NN18", "NN29"] },
  { name: "Swindon", region: "Wiltshire", population: 182001, priority: 2, postcodes: ["SN1", "SN2", "SN3", "SN4", "SN5", "SN6", "SN7", "SN8", "SN9", "SN10", "SN11", "SN12", "SN13", "SN14", "SN15", "SN16", "SN25", "SN26", "SN80"] },
  { name: "Reading", region: "Berkshire", population: 218705, priority: 2, postcodes: ["RG1", "RG2", "RG4", "RG5", "RG6", "RG7", "RG8", "RG9", "RG10", "RG12", "RG14", "RG17", "RG18", "RG19", "RG20", "RG21", "RG22", "RG23", "RG24", "RG25", "RG26", "RG27", "RG28", "RG29", "RG30", "RG31", "RG40", "RG41", "RG42", "RG45"] },
  { name: "Luton", region: "Bedfordshire", population: 213052, priority: 2, postcodes: ["LU1", "LU2", "LU3", "LU4", "LU5", "LU6", "LU7"] },
  { name: "York", region: "North Yorkshire", population: 208400, priority: 2, postcodes: ["YO1", "YO7", "YO8", "YO10", "YO11", "YO12", "YO13", "YO14", "YO15", "YO16", "YO17", "YO18", "YO19", "YO21", "YO22", "YO23", "YO24", "YO25", "YO26", "YO30", "YO31", "YO32", "YO41", "YO42", "YO43", "YO51", "YO60", "YO61", "YO62"] },
  { name: "Blackpool", region: "Lancashire", population: 139446, priority: 2, postcodes: ["FY1", "FY2", "FY3", "FY4", "FY5", "FY6", "FY7", "FY8"] },
  { name: "Plymouth", region: "Devon", population: 264100, priority: 2, postcodes: ["PL1", "PL2", "PL3", "PL4", "PL5", "PL6", "PL7", "PL8", "PL9", "PL10", "PL11", "PL12", "PL13", "PL14", "PL15", "PL16", "PL17", "PL18", "PL19", "PL20", "PL21", "PL22", "PL23", "PL24", "PL25", "PL26", "PL27", "PL28", "PL29", "PL30", "PL31", "PL32", "PL33", "PL34", "PL35"] },

  // Medium Towns (Tier 3 - Medium Search Volume)
  { name: "Oxford", region: "Oxfordshire", population: 152000, priority: 3, postcodes: ["OX1", "OX2", "OX3", "OX4", "OX5", "OX7", "OX9", "OX10", "OX11", "OX12", "OX13", "OX14", "OX15", "OX16", "OX17", "OX18", "OX20", "OX25", "OX26", "OX27", "OX28", "OX29", "OX33", "OX39", "OX44", "OX49"] },
  { name: "Cambridge", region: "Cambridgeshire", population: 145000, priority: 3, postcodes: ["CB1", "CB2", "CB3", "CB4", "CB5", "CB6", "CB7", "CB8", "CB9", "CB10", "CB11", "CB21", "CB22", "CB23", "CB24", "CB25"] },
  { name: "Norwich", region: "Norfolk", population: 195000, priority: 3, postcodes: ["NR1", "NR2", "NR3", "NR4", "NR5", "NR6", "NR7", "NR8", "NR9", "NR10", "NR11", "NR12", "NR13", "NR14", "NR15", "NR16", "NR17", "NR18", "NR19", "NR20", "NR21", "NR22", "NR23", "NR24", "NR25", "NR26", "NR27", "NR28", "NR29", "NR30", "NR31", "NR32", "NR33", "NR34", "NR35"] },
  { name: "Exeter", region: "Devon", population: 131405, priority: 3, postcodes: ["EX1", "EX2", "EX3", "EX4", "EX5", "EX6", "EX7", "EX8", "EX9", "EX10", "EX11", "EX12", "EX13", "EX14", "EX15", "EX16", "EX17", "EX18", "EX19", "EX20", "EX21", "EX22", "EX23", "EX24", "EX31", "EX32", "EX33", "EX34", "EX35", "EX36", "EX37", "EX38", "EX39"] },
  { name: "Ipswich", region: "Suffolk", population: 144957, priority: 3, postcodes: ["IP1", "IP2", "IP3", "IP4", "IP5", "IP6", "IP7", "IP8", "IP9", "IP10", "IP11", "IP12", "IP13", "IP14", "IP15", "IP16", "IP17", "IP18", "IP19", "IP20", "IP21", "IP22", "IP23", "IP24", "IP25", "IP26", "IP27", "IP28", "IP29", "IP30", "IP31", "IP32", "IP33"] },
  { name: "Peterborough", region: "Cambridgeshire", population: 194000, priority: 3, postcodes: ["PE1", "PE2", "PE3", "PE4", "PE5", "PE6", "PE7", "PE8", "PE9", "PE10", "PE11", "PE12", "PE13", "PE14", "PE15", "PE16", "PE19", "PE20", "PE21", "PE22", "PE23", "PE24", "PE25", "PE26", "PE27", "PE28", "PE29", "PE30", "PE31", "PE32", "PE33", "PE34", "PE35", "PE36", "PE37", "PE38"] },
  { name: "Sunderland", region: "Tyne and Wear", population: 277417, priority: 3, postcodes: ["SR1", "SR2", "SR3", "SR4", "SR5", "SR6", "SR7", "SR8"] },
  { name: "Gloucester", region: "Gloucestershire", population: 118555, priority: 3, postcodes: ["GL1", "GL2", "GL3", "GL4", "GL5", "GL6", "GL7", "GL8", "GL9", "GL10", "GL11", "GL12", "GL13", "GL14", "GL15", "GL16", "GL17", "GL18", "GL19", "GL20", "GL50", "GL51", "GL52", "GL53", "GL54", "GL55", "GL56"] },
  { name: "Cheltenham", region: "Gloucestershire", population: 116447, priority: 3, postcodes: ["GL1", "GL2", "GL3", "GL4", "GL5", "GL6", "GL7", "GL8", "GL9", "GL10", "GL11", "GL12", "GL13", "GL14", "GL15", "GL16", "GL17", "GL18", "GL19", "GL20", "GL50", "GL51", "GL52", "GL53", "GL54", "GL55", "GL56"] },
  { name: "Watford", region: "Hertfordshire", population: 131325, priority: 3, postcodes: ["WD3", "WD4", "WD5", "WD6", "WD7", "WD17", "WD18", "WD19", "WD23", "WD24", "WD25"] },
  { name: "Colchester", region: "Essex", population: 121859, priority: 3, postcodes: ["CO1", "CO2", "CO3", "CO4", "CO5", "CO6", "CO7", "CO8", "CO9", "CO10", "CO11", "CO12", "CO13", "CO14", "CO15", "CO16"] },
  { name: "Milton Keynes", region: "Buckinghamshire", population: 229941, priority: 3, postcodes: ["MK1", "MK2", "MK3", "MK4", "MK5", "MK6", "MK7", "MK8", "MK9", "MK10", "MK11", "MK12", "MK13", "MK14", "MK15", "MK16", "MK17", "MK18", "MK19", "MK40", "MK41", "MK42", "MK43", "MK44", "MK45", "MK46"] },
  { name: "St Albans", region: "Hertfordshire", population: 147022, priority: 3, postcodes: ["AL1", "AL2", "AL3", "AL4", "AL5", "AL6", "AL7", "AL8", "AL9", "AL10"] },
  { name: "Harrogate", region: "North Yorkshire", population: 75070, priority: 3, postcodes: ["HG1", "HG2", "HG3", "HG4", "HG5"] },
  { name: "Chester", region: "Cheshire", population: 87593, priority: 3, postcodes: ["CH1", "CH2", "CH3", "CH4", "CH5", "CH6", "CH7", "CH8", "CH41", "CH42", "CH43", "CH44", "CH45", "CH46", "CH47", "CH48", "CH49", "CH60", "CH61", "CH62", "CH63", "CH64", "CH65", "CH66"] },
  { name: "Carlisle", region: "Cumbria", population: 75300, priority: 3, postcodes: ["CA1", "CA2", "CA3", "CA4", "CA5", "CA6", "CA7", "CA8", "CA9", "CA10", "CA11", "CA12", "CA13", "CA14", "CA15", "CA16", "CA17", "CA18", "CA19", "CA20", "CA21", "CA22", "CA23", "CA24", "CA25", "CA26", "CA27", "CA28"] },
  { name: "Dundee", region: "Scotland", population: 148280, priority: 3, postcodes: ["DD1", "DD2", "DD3", "DD4", "DD5", "DD6", "DD7", "DD8", "DD9", "DD10", "DD11"] },
  { name: "Edinburgh", region: "Scotland", population: 524930, priority: 3, postcodes: ["EH1", "EH2", "EH3", "EH4", "EH5", "EH6", "EH7", "EH8", "EH9", "EH10", "EH11", "EH12", "EH13", "EH14", "EH15", "EH16", "EH17", "EH18", "EH19", "EH20", "EH21", "EH22", "EH23", "EH24", "EH25", "EH26", "EH27", "EH28", "EH29", "EH30", "EH31", "EH32", "EH33", "EH34", "EH35", "EH36", "EH37", "EH38", "EH39", "EH40", "EH41", "EH42", "EH43", "EH44", "EH45", "EH46", "EH47", "EH48", "EH49", "EH51", "EH52", "EH53", "EH54", "EH55"] },
  { name: "Inverness", region: "Scotland", population: 70000, priority: 3, postcodes: ["IV1", "IV2", "IV3", "IV4", "IV5", "IV6", "IV7", "IV8", "IV9", "IV10", "IV11", "IV12", "IV13", "IV14", "IV15", "IV16", "IV17", "IV18", "IV19", "IV20", "IV21", "IV22", "IV23", "IV24", "IV25", "IV26", "IV27", "IV28", "IV30", "IV31", "IV32", "IV36", "IV40", "IV41", "IV42", "IV43", "IV44", "IV45", "IV46", "IV47", "IV48", "IV49", "IV51", "IV52", "IV53", "IV54", "IV55", "IV56", "IV63"] },
  { name: "Hull", region: "East Yorkshire", population: 260200, priority: 3, postcodes: ["HU1", "HU2", "HU3", "HU4", "HU5", "HU6", "HU7", "HU8", "HU9", "HU10", "HU11", "HU12", "HU13", "HU14", "HU15", "HU16", "HU17", "HU18", "HU19", "HU20"] },
] as const;

// ── Shared slug helper ───────────────────────────────────────────────────────────
export function toSlug(str: string): string {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

// ── Hyper-local neighbourhood / postal-district matrix ───────────────────────────
// Maps parent-city slugs to a list of well-known neighbourhoods and districts
// within that city. These seed hyper-local "near me" landing pages so coverage
// is evenly distributed across the major UK regional city targets rather than
// siloed around any single (e.g. Stoke-on-Trent/Staffordshire/Cheshire) area.
// Each entry carries a real UK postal district for that neighbourhood.
export const NEIGHBORHOODS: Record<
  string,
  { parent: string; name: string; postalDistrict: string }[]
> = {
  // ── Greater Manchester ──
  "manchester": [
    { parent: "Manchester", name: "Salford", postalDistrict: "M5" },
    { parent: "Manchester", name: "Stockport", postalDistrict: "SK1" },
    { parent: "Manchester", name: "Bolton", postalDistrict: "BL1" },
    { parent: "Manchester", name: "Oldham", postalDistrict: "OL1" },
    { parent: "Manchester", name: "Rochdale", postalDistrict: "OL11" },
    { parent: "Manchester", name: "Bury", postalDistrict: "BL9" },
    { parent: "Manchester", name: "Trafford", postalDistrict: "M16" },
    { parent: "Manchester", name: "Wigan", postalDistrict: "WN1" },
    { parent: "Manchester", name: "Tameside", postalDistrict: "OL6" },
    { parent: "Manchester", name: "Didsbury", postalDistrict: "M20" },
    { parent: "Manchester", name: "Chorlton", postalDistrict: "M21" },
    { parent: "Manchester", name: "Salford Quays", postalDistrict: "M50" },
  ],

  // ── West Midlands (Birmingham + surrounding boroughs) ──
  "birmingham": [
    { parent: "Birmingham", name: "Edgbaston", postalDistrict: "B15" },
    { parent: "Birmingham", name: "Moseley", postalDistrict: "B13" },
    { parent: "Birmingham", name: "Harborne", postalDistrict: "B17" },
    { parent: "Birmingham", name: "Handsworth", postalDistrict: "B21" },
    { parent: "Birmingham", name: "Aston", postalDistrict: "B6" },
    { parent: "Birmingham", name: "Erdington", postalDistrict: "B23" },
    { parent: "Birmingham", name: "Kings Heath", postalDistrict: "B14" },
    { parent: "Birmingham", name: "Selly Oak", postalDistrict: "B29" },
    { parent: "Birmingham", name: "Yardley", postalDistrict: "B25" },
    { parent: "Birmingham", name: "Acocks Green", postalDistrict: "B27" },
    { parent: "Birmingham", name: "Perry Barr", postalDistrict: "B42" },
    { parent: "Birmingham", name: "Northfield", postalDistrict: "B31" },
  ],

  // ── Greater London boroughs ──
  "london": [
    { parent: "London", name: "Camden", postalDistrict: "NW1" },
    { parent: "London", name: "Islington", postalDistrict: "N1" },
    { parent: "London", name: "Hackney", postalDistrict: "E8" },
    { parent: "London", name: "Tower Hamlets", postalDistrict: "E14" },
    { parent: "London", name: "Lambeth", postalDistrict: "SW9" },
    { parent: "London", name: "Southwark", postalDistrict: "SE1" },
    { parent: "London", name: "Wandsworth", postalDistrict: "SW18" },
    { parent: "London", name: "Kensington & Chelsea", postalDistrict: "W8" },
    { parent: "London", name: "Westminster", postalDistrict: "SW1A" },
    { parent: "London", name: "Brent", postalDistrict: "NW6" },
    { parent: "London", name: "Ealing", postalDistrict: "W5" },
    { parent: "London", name: "Croydon", postalDistrict: "CR0" },
    { parent: "London", name: "Greenwich", postalDistrict: "SE10" },
    { parent: "London", name: "Haringey", postalDistrict: "N15" },
    { parent: "London", name: "Newham", postalDistrict: "E15" },
  ],

  // ── Leeds / West Yorkshire ──
  "leeds": [
    { parent: "Leeds", name: "Headingley", postalDistrict: "LS6" },
    { parent: "Leeds", name: "Chapeltown", postalDistrict: "LS7" },
    { parent: "Leeds", name: "Roundhay", postalDistrict: "LS8" },
    { parent: "Leeds", name: "Pudsey", postalDistrict: "LS28" },
    { parent: "Leeds", name: "Morley", postalDistrict: "LS27" },
    { parent: "Leeds", name: "Otley", postalDistrict: "LS21" },
  ],

  // ── Glasgow / Strathclyde ──
  "glasgow": [
    { parent: "Glasgow", name: "West End", postalDistrict: "G12" },
    { parent: "Glasgow", name: "Southside", postalDistrict: "G42" },
    { parent: "Glasgow", name: "East End", postalDistrict: "G31" },
    { parent: "Glasgow", name: "Partick", postalDistrict: "G11" },
    { parent: "Glasgow", name: "Shawlands", postalDistrict: "G41" },
    { parent: "Glasgow", name: "Bearsden", postalDistrict: "G61" },
  ],

  // ── Liverpool / Merseyside ──
  "liverpool": [
    { parent: "Liverpool", name: "Toxteth", postalDistrict: "L8" },
    { parent: "Liverpool", name: "Aigburth", postalDistrict: "L17" },
    { parent: "Liverpool", name: "Anfield", postalDistrict: "L4" },
    { parent: "Liverpool", name: "Allerton", postalDistrict: "L18" },
    { parent: "Liverpool", name: "Walton", postalDistrict: "L9" },
  ],

  // ── Newcastle / Tyne and Wear ──
  "newcastle": [
    { parent: "Newcastle", name: "Jesmond", postalDistrict: "NE2" },
    { parent: "Newcastle", name: "Gosforth", postalDistrict: "NE3" },
    { parent: "Newcastle", name: "Heaton", postalDistrict: "NE6" },
    { parent: "Newcastle", name: "Byker", postalDistrict: "NE6" },
    { parent: "Newcastle", name: "Gateshead", postalDistrict: "NE8" },
    { parent: "Newcastle", name: "Tynemouth", postalDistrict: "NE30" },
  ],

  // ── Sheffield / South Yorkshire ──
  "sheffield": [
    { parent: "Sheffield", name: "Ecclesall", postalDistrict: "S11" },
    { parent: "Sheffield", name: "Broomhill", postalDistrict: "S10" },
    { parent: "Sheffield", name: "Hillsborough", postalDistrict: "S6" },
    { parent: "Sheffield", name: "Attercliffe", postalDistrict: "S9" },
    { parent: "Sheffield", name: "Totley", postalDistrict: "S17" },
    { parent: "Sheffield", name: "Darnall", postalDistrict: "S9" },
  ],

  // ── Bristol / South West ──
  "bristol": [
    { parent: "Bristol", name: "Clifton", postalDistrict: "BS8" },
    { parent: "Bristol", name: "Redland", postalDistrict: "BS6" },
    { parent: "Bristol", name: "Bedminster", postalDistrict: "BS3" },
    { parent: "Bristol", name: "Southville", postalDistrict: "BS3" },
    { parent: "Bristol", name: "St Pauls", postalDistrict: "BS2" },
    { parent: "Bristol", name: "Kingswood", postalDistrict: "BS15" },
  ],

  // ── Nottingham / East Midlands ──
  "nottingham": [
    { parent: "Nottingham", name: "West Bridgford", postalDistrict: "NG2" },
    { parent: "Nottingham", name: "Beeston", postalDistrict: "NG9" },
    { parent: "Nottingham", name: "Wollaton", postalDistrict: "NG8" },
    { parent: "Nottingham", name: "Sherwood", postalDistrict: "NG5" },
    { parent: "Nottingham", name: "Mapperley", postalDistrict: "NG3" },
  ],

  // ── Stoke-on-Trent / Staffordshire (migrated matrix) ──
  "stoke-on-trent": [
    { parent: "Stoke-on-Trent", name: "Hanley", postalDistrict: "ST1" },
    { parent: "Stoke-on-Trent", name: "Burslem", postalDistrict: "ST6" },
    { parent: "Stoke-on-Trent", name: "Tunstall", postalDistrict: "ST6" },
    { parent: "Stoke-on-Trent", name: "Fenton", postalDistrict: "ST4" },
    { parent: "Stoke-on-Trent", name: "Longton", postalDistrict: "ST3" },
    { parent: "Stoke-on-Trent", name: "Stoke", postalDistrict: "ST4" },
    { parent: "Stoke-on-Trent", name: "Bentilee", postalDistrict: "ST2" },
    { parent: "Stoke-on-Trent", name: "Meir", postalDistrict: "ST3" },
    { parent: "Stoke-on-Trent", name: "Abbey Hulton", postalDistrict: "ST2" },
    { parent: "Stoke-on-Trent", name: "Newcastle-under-Lyme", postalDistrict: "ST5" },
  ],

  // ── Edinburgh / Lothian (broadening beyond England) ──
  "edinburgh": [
    { parent: "Edinburgh", name: "Leith", postalDistrict: "EH6" },
    { parent: "Edinburgh", name: "Morningside", postalDistrict: "EH10" },
    { parent: "Edinburgh", name: "Stockbridge", postalDistrict: "EH3" },
    { parent: "Edinburgh", name: "Portobello", postalDistrict: "EH15" },
    { parent: "Edinburgh", name: "Corstorphine", postalDistrict: "EH12" },
  ],

  // ── Cardiff / Wales ──
  "cardiff": [
    { parent: "Cardiff", name: "Roath", postalDistrict: "CF24" },
    { parent: "Cardiff", name: "Canton", postalDistrict: "CF5" },
    { parent: "Cardiff", name: "Llandaff", postalDistrict: "CF5" },
    { parent: "Cardiff", name: "Penarth", postalDistrict: "CF64" },
    { parent: "Cardiff", name: "Whitchurch", postalDistrict: "CF14" },
  ],
};

// ── Resolve a location slug to a canonical location descriptor ───────────────────
// Returns a Location-like object so downstream consumers can treat a city and a
// neighbourhood uniformly. A neighbourhood slug resolves to its parent city for
// `region`/`postcodes` (so schema, canonical breadcrumbs and the "nearby towns"
// / "other cities" sections stay correct) but surfaces its own `name` for the
// page's primary heading and the single postal district for the coverage block.
export function resolveLocation(slug: string) {
  const city = LOCATIONS.find((l) => toSlug(l.name) === slug);
  if (city) {
    return { kind: "city" as const, ...city };
  }

  for (const [parentSlug, entries] of Object.entries(NEIGHBORHOODS)) {
    const match = entries.find((e) => toSlug(e.name) === slug);
    if (match) {
      const parentCity = LOCATIONS.find((l) => toSlug(l.name) === parentSlug);
      if (!parentCity) continue;
      return {
        kind: "neighbourhood" as const,
        name: match.name,
        region: parentCity.region,
        // A neighbourhood page serves the parent city's catchment, so its
        // population stat truthfully reflects the surrounding area.
        population: parentCity.population,
        priority: null,
        postcodes: [match.postalDistrict],
        parent: match.parent,
      };
    }
  }

  return null;
}

// Flattened list of all neighbourhood slugs, for static-param generation and
// sitemap coverage without re-deriving from the map each call.
export const ALL_NEIGHBORHOOD_SLUGS: string[] = Object.values(NEIGHBORHOODS)
  .flat()
  .map((e) => toSlug(e.name));

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

// ── Pricing data ─────────────────────────────────────────────────────────────
// Single pricing source for programmatic trade/location pages. Every `TRADES`
// slug must have an entry here, and `unit` must reflect how that trade actually
// quotes — never a blanket "per hour" for fixed/lump-sum trades.
export const TRADE_PRICING: Record<
  string,
  { low: string; high: string; unit: string; typical: string }
> = {
  plumber:               { low: "£40",     high: "£70",     unit: "per hour",        typical: "£150 to £400 for most jobs"              },
  electrician:           { low: "£45",     high: "£75",     unit: "per hour",        typical: "£200 to £800 for most jobs"              },
  "gas-engineer":        { low: "£60",     high: "£100",    unit: "per hour",        typical: "£80 to £120 for a boiler service"        },
  builder:               { low: "£35",     high: "£60",     unit: "per hour",        typical: "£20,000 to £80,000 for extensions"       },
  roofer:                { low: "£35",     high: "£55",     unit: "per hour",        typical: "£150 to £1,500 for repairs"              },
  carpenter:             { low: "£35",     high: "£55",     unit: "per hour",        typical: "£300 to £2,000 for most jobs"            },
  cleaner:               { low: "£15",     high: "£25",     unit: "per hour",        typical: "£100 to £300 for a deep clean"           },
  plasterer:             { low: "£30",     high: "£50",     unit: "per hour",        typical: "£200 to £600 per room"                   },
  "painter-decorator":   { low: "£25",     high: "£45",     unit: "per hour",        typical: "£400 to £1,200 per room"                 },
  painter:               { low: "£25",     high: "£45",     unit: "per hour",        typical: "£400 to £1,200 per room"                 },
  handyman:              { low: "£25",     high: "£40",     unit: "per hour",        typical: "£50 to £200 for most odd jobs"           },
  locksmith:             { low: "£60",     high: "£120",    unit: "per hour",        typical: "£75 to £200 for most jobs"               },
  landscaper:            { low: "£30",     high: "£50",     unit: "per hour",        typical: "£1,500 to £15,000 for garden design"     },
  gardener:              { low: "£25",     high: "£40",     unit: "per hour",        typical: "£50 to £200 for regular maintenance"     },
  "window-fitter":       { low: "£35",     high: "£55",     unit: "per hour",        typical: "£400 to £800 per window installed"       },
  "heating-engineer":    { low: "£50",     high: "£80",     unit: "per hour",        typical: "£150 to £800 for most repairs"           },
  "air-conditioning":    { low: "£60",     high: "£100",    unit: "per hour",        typical: "£1,500 to £5,000 for installation"       },
  "kitchen-fitter":      { low: "£35",     high: "£55",     unit: "per hour",        typical: "£1,000 to £5,000 for fitting only"       },
  "bathroom-fitter":     { low: "£35",     high: "£55",     unit: "per hour",        typical: "£2,000 to £8,000 for a full bathroom"    },
  tiler:                 { low: "£30",     high: "£50",     unit: "per hour",        typical: "£300 to £800 per bathroom"               },
  flooring:              { low: "£25",     high: "£45",     unit: "per hour",        typical: "£300 to £1,500 per room"                 },
  "damp-specialist":     { low: "£45",     high: "£75",     unit: "per hour",        typical: "£300 to £2,500 for treatment"            },
  "pest-control":        { low: "£80",     high: "£200",    unit: "per visit",       typical: "£80 to £300 per treatment"               },
  "security-installer":  { low: "£50",     high: "£80",     unit: "per hour",        typical: "£400 to £2,500 for installation"         },
  "solar-panel-installer": { low: "£500", high: "£1,500",  unit: "per day",         typical: "£5,000 to £15,000 for a full system"     },
  "loft-conversion":     { low: "£35,000", high: "£60,000", unit: "full project",   typical: "£35,000 to £60,000 for a dormer"         },
  conservatory:          { low: "£15,000", high: "£40,000", unit: "full project",   typical: "£15,000 to £40,000 for most conservatory projects" },
  "driveway-specialist": { low: "£30",    high: "£50",     unit: "per hour",        typical: "£2,000 to £8,000 for a full driveway"    },
  scaffolder:            { low: "£250",   high: "£800",    unit: "per week",        typical: "£500 to £3,000 for most projects"        },
  "chimney-sweep":       { low: "£60",    high: "£120",    unit: "per visit",       typical: "£60 to £120 per sweep"                   },
  "loft-insulation":     { low: "£400",   high: "£800",    unit: "full project",    typical: "£400 to £800 for standard loft"          },
  fencer:                { low: "£25",    high: "£40",     unit: "per hour",        typical: "£500 to £3,000 for a full garden fence"  },
  "waste-removal":       { low: "£150",   high: "£400",    unit: "per load",        typical: "£150 to £600 per clearance"              },
  "carpet-cleaner":      { low: "£80",    high: "£200",    unit: "per room",        typical: "£80 to £300 for a full house"            },
};

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

// Generate schema for trade + location
export function generateTradeLocationSchema(tradeSlug: string, locationSlug: string) {
  const trade = TRADES.find(t => t.slug === tradeSlug);
  const location = resolveLocation(locationSlug);

  if (!trade || !location) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `${trade.name} Services in ${location.name}`,
    "description": `Professional ${trade.name.toLowerCase()} services in ${location.name}. Verified, public liability insured, and reviewed by real customers.`,
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
