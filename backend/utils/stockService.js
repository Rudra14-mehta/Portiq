const axios = require('axios');

// Indian Stock symbols for Yahoo Finance (NSE: symbol.NS, BSE: symbol.BO)
const POPULAR_INDIAN_STOCKS = [
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd', sector: 'Energy' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services', sector: 'IT' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Ltd', sector: 'Banking' },
  { symbol: 'INFY.NS', name: 'Infosys Ltd', sector: 'IT' },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank Ltd', sector: 'Banking' },
  { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever Ltd', sector: 'FMCG' },
  { symbol: 'ITC.NS', name: 'ITC Ltd', sector: 'FMCG' },
  { symbol: 'SBIN.NS', name: 'State Bank of India', sector: 'Banking' },
  { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance Ltd', sector: 'Finance' },
  { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel Ltd', sector: 'Telecom' },
  { symbol: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank', sector: 'Banking' },
  { symbol: 'LT.NS', name: 'Larsen & Toubro Ltd', sector: 'Infrastructure' },
  { symbol: 'ASIANPAINT.NS', name: 'Asian Paints Ltd', sector: 'Paint' },
  { symbol: 'AXISBANK.NS', name: 'Axis Bank Ltd', sector: 'Banking' },
  { symbol: 'MARUTI.NS', name: 'Maruti Suzuki India Ltd', sector: 'Automobile' },
  { symbol: 'WIPRO.NS', name: 'Wipro Ltd', sector: 'IT' },
  { symbol: 'ULTRACEMCO.NS', name: 'UltraTech Cement Ltd', sector: 'Cement' },
  { symbol: 'TITAN.NS', name: 'Titan Company Ltd', sector: 'Consumer' },
  { symbol: 'NESTLEIND.NS', name: 'Nestle India Ltd', sector: 'FMCG' },
  { symbol: 'TECHM.NS', name: 'Tech Mahindra Ltd', sector: 'IT' },
  { symbol: 'SUNPHARMA.NS', name: 'Sun Pharmaceutical', sector: 'Pharma' },
  { symbol: 'HCLTECH.NS', name: 'HCL Technologies Ltd', sector: 'IT' },
  { symbol: 'POWERGRID.NS', name: 'Power Grid Corporation', sector: 'Power' },
  { symbol: 'NTPC.NS', name: 'NTPC Ltd', sector: 'Power' },
  { symbol: 'ONGC.NS', name: 'Oil & Natural Gas Corp', sector: 'Energy' },
  { symbol: 'ADANIENT.NS', name: 'Adani Enterprises Ltd', sector: 'Conglomerate' },
  { symbol: 'TATAMOTORS.NS', name: 'Tata Motors Ltd', sector: 'Automobile' },
  { symbol: 'JSWSTEEL.NS', name: 'JSW Steel Ltd', sector: 'Steel' },
  { symbol: 'TATASTEEL.NS', name: 'Tata Steel Ltd', sector: 'Steel' },
  { symbol: 'BAJAJFINSV.NS', name: 'Bajaj Finserv Ltd', sector: 'Finance' },
  { symbol: 'CESC.NS', name: 'CESC Ltd', sector: 'Power' },
  { symbol: 'TATAPOWER.NS', name: 'Tata Power Co Ltd', sector: 'Power' },
  { symbol: 'ADANIPOWER.NS', name: 'Adani Power Ltd', sector: 'Power' },
  { symbol: 'NHPC.NS', name: 'NHPC Ltd', sector: 'Power' },
  { symbol: 'IRFC.NS', name: 'Indian Railway Finance Corp', sector: 'Finance' },
  { symbol: 'ZOMATO.NS', name: 'Zomato Ltd', sector: 'Consumer' },
  { symbol: 'PAYTM.NS', name: 'One97 Communications', sector: 'Fintech' },
  { symbol: 'NYKAA.NS', name: 'FSN E-Commerce', sector: 'Retail' },
  // ===== NIFTY MIDCAP 100 =====
{ symbol: 'ABCAPITAL.NS', name: 'Aditya Birla Capital Ltd', sector: 'Finance' },
{ symbol: 'ABFRL.NS', name: 'Aditya Birla Fashion & Retail', sector: 'Retail' },
{ symbol: 'ASTRAL.NS', name: 'Astral Ltd', sector: 'Pipes' },
{ symbol: 'AUBANK.NS', name: 'AU Small Finance Bank', sector: 'Banking' },
{ symbol: 'BANDHANBNK.NS', name: 'Bandhan Bank Ltd', sector: 'Banking' },
{ symbol: 'BANKBARODA.NS', name: 'Bank of Baroda', sector: 'Banking' },
{ symbol: 'BEL.NS', name: 'Bharat Electronics Ltd', sector: 'Defence' },
{ symbol: 'BHARATFORG.NS', name: 'Bharat Forge Ltd', sector: 'Auto Parts' },
{ symbol: 'BHEL.NS', name: 'Bharat Heavy Electricals', sector: 'Engineering' },
{ symbol: 'BIOCON.NS', name: 'Biocon Ltd', sector: 'Pharma' },
{ symbol: 'CHOLAFIN.NS', name: 'Cholamandalam Investment', sector: 'Finance' },
{ symbol: 'COFORGE.NS', name: 'Coforge Ltd', sector: 'IT' },
{ symbol: 'CONCOR.NS', name: 'Container Corporation of India', sector: 'Logistics' },
{ symbol: 'CROMPTON.NS', name: 'Crompton Greaves Consumer', sector: 'Consumer' },
{ symbol: 'CUMMINSIND.NS', name: 'Cummins India Ltd', sector: 'Engineering' },
{ symbol: 'DAULATRAM.NS', name: 'Dalmia Bharat Ltd', sector: 'Cement' },
{ symbol: 'DEEPAKNTR.NS', name: 'Deepak Nitrite Ltd', sector: 'Chemicals' },
{ symbol: 'DELTACORP.NS', name: 'Delta Corp Ltd', sector: 'Gaming' },
{ symbol: 'DIXON.NS', name: 'Dixon Technologies India', sector: 'Electronics' },
{ symbol: 'DLF.NS', name: 'DLF Ltd', sector: 'Real Estate' },
{ symbol: 'ESCORTS.NS', name: 'Escorts Kubota Ltd', sector: 'Automobile' },
{ symbol: 'EXIDEIND.NS', name: 'Exide Industries Ltd', sector: 'Auto Parts' },
{ symbol: 'FEDERALBNK.NS', name: 'Federal Bank Ltd', sector: 'Banking' },
{ symbol: 'GLENMARK.NS', name: 'Glenmark Pharmaceuticals', sector: 'Pharma' },
{ symbol: 'GMRINFRA.NS', name: 'GMR Airports Infrastructure', sector: 'Infrastructure' },
{ symbol: 'GODREJCP.NS', name: 'Godrej Consumer Products', sector: 'FMCG' },
{ symbol: 'GODREJPROP.NS', name: 'Godrej Properties Ltd', sector: 'Real Estate' },
{ symbol: 'GRANULES.NS', name: 'Granules India Ltd', sector: 'Pharma' },
{ symbol: 'GSPL.NS', name: 'Gujarat State Petronet Ltd', sector: 'Energy' },
{ symbol: 'HAL.NS', name: 'Hindustan Aeronautics Ltd', sector: 'Defence' },
{ symbol: 'HDFCAMC.NS', name: 'HDFC Asset Management Co', sector: 'Finance' },
{ symbol: 'HINDPETRO.NS', name: 'Hindustan Petroleum Corp', sector: 'Energy' },
{ symbol: 'HONAUT.NS', name: 'Honeywell Automation India', sector: 'Engineering' },
{ symbol: 'HUDCO.NS', name: 'Housing & Urban Dev Corp', sector: 'Finance' },
{ symbol: 'IDFCFIRSTB.NS', name: 'IDFC First Bank Ltd', sector: 'Banking' },
{ symbol: 'IEX.NS', name: 'Indian Energy Exchange Ltd', sector: 'Energy' },
{ symbol: 'INDIAMART.NS', name: 'Indiamart Intermesh Ltd', sector: 'Technology' },
{ symbol: 'INDUSTOWER.NS', name: 'Indus Towers Ltd', sector: 'Telecom' },
{ symbol: 'IRCTC.NS', name: 'Indian Railway Catering & Tourism', sector: 'Tourism' },
{ symbol: 'JINDALSTEL.NS', name: 'Jindal Steel & Power Ltd', sector: 'Steel' },
{ symbol: 'JSL.NS', name: 'Jindal Stainless Ltd', sector: 'Steel' },
{ symbol: 'JUBLFOOD.NS', name: 'Jubilant Foodworks Ltd', sector: 'Food' },
{ symbol: 'KAJARIACER.NS', name: 'Kajaria Ceramics Ltd', sector: 'Ceramics' },
{ symbol: 'KPITTECH.NS', name: 'KPIT Technologies Ltd', sector: 'IT' },
{ symbol: 'LALPATHLAB.NS', name: 'Dr Lal Pathlabs Ltd', sector: 'Healthcare' },
{ symbol: 'LAURUSLABS.NS', name: 'Laurus Labs Ltd', sector: 'Pharma' },
{ symbol: 'LICHSGFIN.NS', name: 'LIC Housing Finance Ltd', sector: 'Finance' },
{ symbol: 'LTIM.NS', name: 'LTIMindtree Ltd', sector: 'IT' },
{ symbol: 'LTTS.NS', name: 'L&T Technology Services', sector: 'IT' },
{ symbol: 'LUPIN.NS', name: 'Lupin Ltd', sector: 'Pharma' },
{ symbol: 'M&MFIN.NS', name: 'Mahindra & Mahindra Financial', sector: 'Finance' },
{ symbol: 'MANAPPURAM.NS', name: 'Manappuram Finance Ltd', sector: 'Finance' },
{ symbol: 'MARICO.NS', name: 'Marico Ltd', sector: 'FMCG' },
{ symbol: 'MAXHEALTH.NS', name: 'Max Healthcare Institute', sector: 'Healthcare' },
{ symbol: 'METROPOLIS.NS', name: 'Metropolis Healthcare Ltd', sector: 'Healthcare' },
{ symbol: 'MFSL.NS', name: 'Max Financial Services Ltd', sector: 'Insurance' },
{ symbol: 'MGL.NS', name: 'Mahanagar Gas Ltd', sector: 'Energy' },
{ symbol: 'MOTHERSON.NS', name: 'Samvardhana Motherson Intl', sector: 'Auto Parts' },
{ symbol: 'MPHASIS.NS', name: 'Mphasis Ltd', sector: 'IT' },
{ symbol: 'MRF.NS', name: 'MRF Ltd', sector: 'Tyres' },
{ symbol: 'MUTHOOTFIN.NS', name: 'Muthoot Finance Ltd', sector: 'Finance' },
{ symbol: 'NATIONALUM.NS', name: 'National Aluminium Co', sector: 'Metals' },
{ symbol: 'NAVINFLUOR.NS', name: 'Navin Fluorine International', sector: 'Chemicals' },
{ symbol: 'NCC.NS', name: 'NCC Ltd', sector: 'Construction' },
{ symbol: 'NMDC.NS', name: 'NMDC Ltd', sector: 'Mining' },
{ symbol: 'OBEROIRLTY.NS', name: 'Oberoi Realty Ltd', sector: 'Real Estate' },
{ symbol: 'OIL.NS', name: 'Oil India Ltd', sector: 'Energy' },
{ symbol: 'PAGEIND.NS', name: 'Page Industries Ltd', sector: 'Textile' },
{ symbol: 'PERSISTENT.NS', name: 'Persistent Systems Ltd', sector: 'IT' },
{ symbol: 'PETRONET.NS', name: 'Petronet LNG Ltd', sector: 'Energy' },
{ symbol: 'PFC.NS', name: 'Power Finance Corporation', sector: 'Finance' },
{ symbol: 'PHOENIXLTD.NS', name: 'Phoenix Mills Ltd', sector: 'Real Estate' },
{ symbol: 'PIIND.NS', name: 'PI Industries Ltd', sector: 'Agrochemicals' },
{ symbol: 'POLYCAB.NS', name: 'Polycab India Ltd', sector: 'Electricals' },
{ symbol: 'POONAWALLA.NS', name: 'Poonawalla Fincorp Ltd', sector: 'Finance' },
{ symbol: 'PRICOL.NS', name: 'Pricol Ltd', sector: 'Auto Parts' },
{ symbol: 'PVRINOX.NS', name: 'PVR INOX Ltd', sector: 'Entertainment' },
{ symbol: 'RAMCOCEM.NS', name: 'Ramco Cements Ltd', sector: 'Cement' },
{ symbol: 'RECLTD.NS', name: 'REC Ltd', sector: 'Finance' },
{ symbol: 'SAIL.NS', name: 'Steel Authority of India', sector: 'Steel' },
{ symbol: 'SCHAEFFLER.NS', name: 'Schaeffler India Ltd', sector: 'Auto Parts' },
{ symbol: 'SRF.NS', name: 'SRF Ltd', sector: 'Chemicals' },
{ symbol: 'STARHEALTH.NS', name: 'Star Health & Allied Insurance', sector: 'Insurance' },
{ symbol: 'SUPREMEIND.NS', name: 'Supreme Industries Ltd', sector: 'Plastics' },
{ symbol: 'SUZLON.NS', name: 'Suzlon Energy Ltd', sector: 'Renewable Energy' },
{ symbol: 'TATACOMM.NS', name: 'Tata Communications Ltd', sector: 'Telecom' },
{ symbol: 'TATAELXSI.NS', name: 'Tata Elxsi Ltd', sector: 'IT' },
{ symbol: 'TRENT.NS', name: 'Trent Ltd', sector: 'Retail' },
{ symbol: 'TUBE.NS', name: 'Tube Investments of India', sector: 'Engineering' },
{ symbol: 'UBL.NS', name: 'United Breweries Ltd', sector: 'Beverages' },
{ symbol: 'UNITDSPR.NS', name: 'United Spirits Ltd', sector: 'Beverages' },
{ symbol: 'UPL.NS', name: 'UPL Ltd', sector: 'Agrochemicals' },
{ symbol: 'VARUNBEV.NS', name: 'Varun Beverages Ltd', sector: 'Beverages' },
{ symbol: 'VEDL.NS', name: 'Vedanta Ltd', sector: 'Metals' },
{ symbol: 'VOLTAS.NS', name: 'Voltas Ltd', sector: 'Consumer Durables' },
{ symbol: 'WHIRLPOOL.NS', name: 'Whirlpool of India Ltd', sector: 'Consumer Durables' },
{ symbol: 'ZYDUSLIFE.NS', name: 'Zydus Lifesciences Ltd', sector: 'Pharma' },

// ===== NIFTY SMALLCAP 100 =====
{ symbol: 'AARTIIND.NS', name: 'Aarti Industries Ltd', sector: 'Chemicals' },
{ symbol: 'ABBOTINDIA.NS', name: 'Abbott India Ltd', sector: 'Pharma' },
{ symbol: 'AEGISCHEM.NS', name: 'Aegis Logistics Ltd', sector: 'Logistics' },
{ symbol: 'AIAENG.NS', name: 'AIA Engineering Ltd', sector: 'Engineering' },
{ symbol: 'AJANTPHARM.NS', name: 'Ajanta Pharma Ltd', sector: 'Pharma' },
{ symbol: 'ALKEM.NS', name: 'Alkem Laboratories Ltd', sector: 'Pharma' },
{ symbol: 'APLLTD.NS', name: 'Alembic Pharmaceuticals', sector: 'Pharma' },
{ symbol: 'APOLLOHOSP.NS', name: 'Apollo Hospitals Enterprise', sector: 'Healthcare' },
{ symbol: 'APTUS.NS', name: 'Aptus Value Housing Finance', sector: 'Finance' },
{ symbol: 'ARVINDFASN.NS', name: 'Arvind Fashions Ltd', sector: 'Retail' },
{ symbol: 'ASAHIINDIA.NS', name: 'Asahi India Glass Ltd', sector: 'Glass' },
{ symbol: 'ASHOKLEY.NS', name: 'Ashok Leyland Ltd', sector: 'Automobile' },
{ symbol: 'ASTRAZEN.NS', name: 'AstraZeneca Pharma India', sector: 'Pharma' },
{ symbol: 'ATGL.NS', name: 'Adani Total Gas Ltd', sector: 'Energy' },
{ symbol: 'ATUL.NS', name: 'Atul Ltd', sector: 'Chemicals' },
{ symbol: 'AUROPHARMA.NS', name: 'Aurobindo Pharma Ltd', sector: 'Pharma' },
{ symbol: 'AVANTIFEED.NS', name: 'Avanti Feeds Ltd', sector: 'Aquaculture' },
{ symbol: 'BALAMINES.NS', name: 'Balaji Amines Ltd', sector: 'Chemicals' },
{ symbol: 'BALKRISIND.NS', name: 'Balkrishna Industries Ltd', sector: 'Tyres' },
{ symbol: 'BALRAMCHIN.NS', name: 'Balrampur Chini Mills', sector: 'Sugar' },
{ symbol: 'BASF.NS', name: 'BASF India Ltd', sector: 'Chemicals' },
{ symbol: 'BATAINDIA.NS', name: 'Bata India Ltd', sector: 'Footwear' },
{ symbol: 'BAYERCROP.NS', name: 'Bayer CropScience Ltd', sector: 'Agrochemicals' },
{ symbol: 'BERGEPAINT.NS', name: 'Berger Paints India Ltd', sector: 'Paint' },
{ symbol: 'BLUESTARCO.NS', name: 'Blue Star Ltd', sector: 'Consumer Durables' },
{ symbol: 'BOSCHLTD.NS', name: 'Bosch Ltd', sector: 'Auto Parts' },
{ symbol: 'BPCL.NS', name: 'Bharat Petroleum Corp', sector: 'Energy' },
{ symbol: 'BRIGADE.NS', name: 'Brigade Enterprises Ltd', sector: 'Real Estate' },
{ symbol: 'CAMPUS.NS', name: 'Campus Activewear Ltd', sector: 'Footwear' },
{ symbol: 'CANFINHOME.NS', name: 'Can Fin Homes Ltd', sector: 'Finance' },
{ symbol: 'CAPLIPOINT.NS', name: 'Caplin Point Laboratories', sector: 'Pharma' },
{ symbol: 'CARBORUNIV.NS', name: 'Carborundum Universal Ltd', sector: 'Abrasives' },
{ symbol: 'CASTROLIND.NS', name: 'Castrol India Ltd', sector: 'Lubricants' },
{ symbol: 'CDSL.NS', name: 'Central Depository Services', sector: 'Finance' },
{ symbol: 'CENTURYPLY.NS', name: 'Century Plyboards India', sector: 'Wood Products' },
{ symbol: 'CERA.NS', name: 'Cera Sanitaryware Ltd', sector: 'Ceramics' },
{ symbol: 'CGPOWER.NS', name: 'CG Power & Industrial Solutions', sector: 'Engineering' },
{ symbol: 'CHALET.NS', name: 'Chalet Hotels Ltd', sector: 'Hospitality' },
{ symbol: 'CHAMBLFERT.NS', name: 'Chambal Fertilisers & Chemicals', sector: 'Fertilizers' },
{ symbol: 'CLEAN.NS', name: 'Clean Science & Technology', sector: 'Chemicals' },
{ symbol: 'COALINDIA.NS', name: 'Coal India Ltd', sector: 'Mining' },
{ symbol: 'COLPAL.NS', name: 'Colgate Palmolive India', sector: 'FMCG' },
{ symbol: 'COROMANDEL.NS', name: 'Coromandel International', sector: 'Fertilizers' },
{ symbol: 'CRAFTSMAN.NS', name: 'Craftsman Automation Ltd', sector: 'Auto Parts' },
{ symbol: 'CYIENT.NS', name: 'Cyient Ltd', sector: 'IT' },
{ symbol: 'DABUR.NS', name: 'Dabur India Ltd', sector: 'FMCG' },
{ symbol: 'DALBHARAT.NS', name: 'Dalmia Bharat Ltd', sector: 'Cement' },
{ symbol: 'DATAPATTNS.NS', name: 'Data Patterns India Ltd', sector: 'Defence' },
{ symbol: 'DCMSHRIRAM.NS', name: 'DCM Shriram Ltd', sector: 'Chemicals' },
{ symbol: 'DHANUKA.NS', name: 'Dhanuka Agritech Ltd', sector: 'Agrochemicals' },
{ symbol: 'EIDPARRY.NS', name: 'EID Parry India Ltd', sector: 'Sugar' },
{ symbol: 'EIHOTEL.NS', name: 'EIH Ltd', sector: 'Hospitality' },
{ symbol: 'EMAMILTD.NS', name: 'Emami Ltd', sector: 'FMCG' },
{ symbol: 'ENGINERSIN.NS', name: 'Engineers India Ltd', sector: 'Engineering' },
{ symbol: 'ERIS.NS', name: 'Eris Lifesciences Ltd', sector: 'Pharma' },
{ symbol: 'FINEORG.NS', name: 'Fine Organic Industries', sector: 'Chemicals' },
{ symbol: 'FINPIPE.NS', name: 'Finolex Industries Ltd', sector: 'Pipes' },
{ symbol: 'FORCEMOT.NS', name: 'Force Motors Ltd', sector: 'Automobile' },
{ symbol: 'FORTIS.NS', name: 'Fortis Healthcare Ltd', sector: 'Healthcare' },
{ symbol: 'GALAXYSURF.NS', name: 'Galaxy Surfactants Ltd', sector: 'Chemicals' },
{ symbol: 'GARFIBRES.NS', name: 'Garware Technical Fibres', sector: 'Textile' },
{ symbol: 'GESHIP.NS', name: 'Great Eastern Shipping Co', sector: 'Shipping' },
{ symbol: 'GNFC.NS', name: 'Gujarat Narmada Valley Fertilizers', sector: 'Fertilizers' },
{ symbol: 'GPPL.NS', name: 'Gujarat Pipavav Port Ltd', sector: 'Ports' },
{ symbol: 'GRINDWELL.NS', name: 'Grindwell Norton Ltd', sector: 'Abrasives' },
{ symbol: 'GUJGASLTD.NS', name: 'Gujarat Gas Ltd', sector: 'Energy' },
{ symbol: 'HAPPSTMNDS.NS', name: 'Happiest Minds Technologies', sector: 'IT' },
{ symbol: 'HAVELLS.NS', name: 'Havells India Ltd', sector: 'Electricals' },
{ symbol: 'HFCL.NS', name: 'HFCL Ltd', sector: 'Telecom' },
{ symbol: 'HIKAL.NS', name: 'Hikal Ltd', sector: 'Chemicals' },
{ symbol: 'HINDCOPPER.NS', name: 'Hindustan Copper Ltd', sector: 'Metals' },
{ symbol: 'HLEGLAS.NS', name: 'HLE Glascoat Ltd', sector: 'Engineering' },
{ symbol: 'HOMEFIRST.NS', name: 'Home First Finance Company', sector: 'Finance' },
{ symbol: 'IBREALEST.NS', name: 'Indiabulls Real Estate', sector: 'Real Estate' },
{ symbol: 'ICICIlombard.NS', name: 'ICICI Lombard General Insurance', sector: 'Insurance' },
{ symbol: 'ICICIPRULIFE.NS', name: 'ICICI Prudential Life Insurance', sector: 'Insurance' },
{ symbol: 'IDBI.NS', name: 'IDBI Bank Ltd', sector: 'Banking' },
{ symbol: 'IFBIND.NS', name: 'IFB Industries Ltd', sector: 'Consumer Durables' },
{ symbol: 'IIFL.NS', name: 'IIFL Finance Ltd', sector: 'Finance' },
{ symbol: 'INDIGOPNTS.NS', name: 'Indigo Paints Ltd', sector: 'Paint' },
{ symbol: 'INTELLECT.NS', name: 'Intellect Design Arena', sector: 'IT' },
{ symbol: 'IOC.NS', name: 'Indian Oil Corporation', sector: 'Energy' },
{ symbol: 'IPCALAB.NS', name: 'IPCA Laboratories Ltd', sector: 'Pharma' },
{ symbol: 'IRB.NS', name: 'IRB Infrastructure Developers', sector: 'Infrastructure' },
{ symbol: 'ISEC.NS', name: 'ICICI Securities Ltd', sector: 'Finance' },
{ symbol: 'JBCHEPHARM.NS', name: 'JB Chemicals & Pharmaceuticals', sector: 'Pharma' },
{ symbol: 'JKCEMENT.NS', name: 'JK Cement Ltd', sector: 'Cement' },
{ symbol: 'JKLAKSHMI.NS', name: 'JK Lakshmi Cement Ltd', sector: 'Cement' },
{ symbol: 'JKPAPER.NS', name: 'JK Paper Ltd', sector: 'Paper' },
{ symbol: 'JKTYRE.NS', name: 'JK Tyre & Industries Ltd', sector: 'Tyres' },
{ symbol: 'JYOTHYLAB.NS', name: 'Jyothy Labs Ltd', sector: 'FMCG' },
{ symbol: 'KALYANKJIL.NS', name: 'Kalyan Jewellers India', sector: 'Jewellery' },
{ symbol: 'KANSAINER.NS', name: 'Kansai Nerolac Paints', sector: 'Paint' },
{ symbol: 'KEEI.NS', name: 'Kalpataru Projects International', sector: 'Infrastructure' },
{ symbol: 'KELLTON.NS', name: 'Kellton Tech Solutions', sector: 'IT' },
{ symbol: 'KFINTECH.NS', name: 'KFin Technologies Ltd', sector: 'Finance' },
{ symbol: 'KNRCON.NS', name: 'KNR Constructions Ltd', sector: 'Construction' },
{ symbol: 'KRBL.NS', name: 'KRBL Ltd', sector: 'Food' },
{ symbol: 'KSCL.NS', name: 'Kaveri Seed Company Ltd', sector: 'Agriculture' }
];

function roundNumber(value) {
  return Number.isFinite(value) ? parseFloat(value.toFixed(2)) : null;
}

function stripExchangeSuffix(symbol) {
  return symbol.replace(/\.(NS|BO)$/i, '');
}

function getExchangeSegment(symbol) {
  return symbol.endsWith('.BO') ? 'BSE' : 'NSE';
}

function average(values) {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

// Fetch real-time stock quote from Yahoo Finance (via unofficial API)
async function fetchStockQuote(symbol) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'application/json'
      },
      timeout: 10000
    });

    const result = response.data?.chart?.result?.[0];
    const meta = result?.meta;

    if (!meta) {
      throw new Error('Quote metadata unavailable');
    }

    const currentPrice = meta.regularMarketPrice ?? meta.previousClose ?? meta.chartPreviousClose ?? 0;
    const previousClose = meta.previousClose ?? meta.chartPreviousClose ?? currentPrice;
    const change = currentPrice - previousClose;
    const changePercent = previousClose ? (change / previousClose) * 100 : 0;

    return {
      symbol,
      tradingSymbol: stripExchangeSuffix(symbol),
      currentPrice: roundNumber(currentPrice),
      previousClose: roundNumber(previousClose),
      open: roundNumber(meta.regularMarketOpen ?? previousClose),
      high: roundNumber(meta.regularMarketDayHigh ?? currentPrice),
      low: roundNumber(meta.regularMarketDayLow ?? currentPrice),
      volume: meta.regularMarketVolume ?? 0,
      marketCap: meta.marketCap ?? null,
      change: roundNumber(change),
      changePercent: roundNumber(changePercent),
      currency: meta.currency || 'INR',
      exchange: meta.exchangeName || getExchangeSegment(symbol),
      timestamp: new Date()
    };
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error.message);
    return null;
  }
}

// Fetch historical data used across indicators
async function fetchHistoricalData(symbol, days = 120) {
  try {
    const endDate = Math.floor(Date.now() / 1000);
    const startDate = endDate - days * 24 * 60 * 60;

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&period1=${startDate}&period2=${endDate}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'application/json'
      },
      timeout: 15000
    });

    const result = response.data?.chart?.result?.[0];
    const timestamps = result?.timestamp || [];
    const quote = result?.indicators?.quote?.[0] || {};
    const closes = quote.close || [];
    const highs = quote.high || [];
    const lows = quote.low || [];
    const volumes = quote.volume || [];

    return timestamps
      .map((ts, index) => ({
        date: new Date(ts * 1000),
        close: closes[index],
        high: highs[index],
        low: lows[index],
        volume: volumes[index] ?? 0
      }))
      .filter(point =>
        Number.isFinite(point.close) &&
        Number.isFinite(point.high) &&
        Number.isFinite(point.low)
      );
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error.message);
    return [];
  }
}

// RSI Calculation using Wilder's smoothing method
function calculateRSI(closes, period = 14) {
  if (closes.length < period + 1) {
    return null;
  }

  const gains = [];
  const losses = [];

  for (let index = 1; index < closes.length; index += 1) {
    const diff = closes[index] - closes[index - 1];
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? Math.abs(diff) : 0);
  }

  let avgGain = average(gains.slice(0, period));
  let avgLoss = average(losses.slice(0, period));

  for (let index = period; index < gains.length; index += 1) {
    avgGain = (avgGain * (period - 1) + gains[index]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[index]) / period;
  }

  if (avgGain === 0 && avgLoss === 0) {
    return 50;
  }

  if (avgLoss === 0) {
    return 100;
  }

  if (avgGain === 0) {
    return 0;
  }

  const rs = avgGain / avgLoss;
  return roundNumber(100 - 100 / (1 + rs));
}

function calculateSMASeries(values, period) {
  const series = Array(values.length).fill(null);

  for (let index = period - 1; index < values.length; index += 1) {
    series[index] = average(values.slice(index - period + 1, index + 1));
  }

  return series;
}

function calculateATRSeries(records, period = 10) {
  const atr = Array(records.length).fill(null);

  if (records.length <= period) {
    return atr;
  }

  const trueRanges = Array(records.length).fill(null);

  for (let index = 1; index < records.length; index += 1) {
    const current = records[index];
    const previousClose = records[index - 1].close;

    trueRanges[index] = Math.max(
      current.high - current.low,
      Math.abs(current.high - previousClose),
      Math.abs(current.low - previousClose)
    );
  }

  const initial = trueRanges.slice(1, period + 1);
  atr[period] = average(initial);

  for (let index = period + 1; index < records.length; index += 1) {
    atr[index] = ((atr[index - 1] * (period - 1)) + trueRanges[index]) / period;
  }

  return atr;
}

function calculateSuperTrendSeries(records, period = 10, multiplier = 3) {
  const atr = calculateATRSeries(records, period);
  const finalUpper = Array(records.length).fill(null);
  const finalLower = Array(records.length).fill(null);
  const superTrend = Array(records.length).fill(null);
  const direction = Array(records.length).fill(null);

  for (let index = period; index < records.length; index += 1) {
    if (!Number.isFinite(atr[index])) {
      continue;
    }

    const hl2 = (records[index].high + records[index].low) / 2;
    const basicUpper = hl2 + multiplier * atr[index];
    const basicLower = hl2 - multiplier * atr[index];

    if (index === period) {
      finalUpper[index] = basicUpper;
      finalLower[index] = basicLower;
      superTrend[index] = records[index].close <= basicUpper ? basicUpper : basicLower;
    } else {
      finalUpper[index] = (
        basicUpper < finalUpper[index - 1] ||
        records[index - 1].close > finalUpper[index - 1]
      ) ? basicUpper : finalUpper[index - 1];

      finalLower[index] = (
        basicLower > finalLower[index - 1] ||
        records[index - 1].close < finalLower[index - 1]
      ) ? basicLower : finalLower[index - 1];

      if (superTrend[index - 1] === finalUpper[index - 1]) {
        superTrend[index] = records[index].close <= finalUpper[index] ? finalUpper[index] : finalLower[index];
      } else {
        superTrend[index] = records[index].close >= finalLower[index] ? finalLower[index] : finalUpper[index];
      }
    }

    direction[index] = records[index].close >= superTrend[index] ? 'bullish' : 'bearish';
  }

  return records.map((record, index) => {
    if (!Number.isFinite(superTrend[index])) {
      return null;
    }

    return {
      value: roundNumber(superTrend[index]),
      direction: direction[index],
      atr: roundNumber(atr[index])
    };
  });
}

function calculateSuperTrend(closes, highs, lows, period = 10, multiplier = 3) {
  const records = closes.map((close, index) => ({
    close,
    high: highs[index],
    low: lows[index]
  }));

  const series = calculateSuperTrendSeries(records, period, multiplier);
  return series[series.length - 1] || null;
}

function getLastDefinedValue(series, fromIndex = series.length - 1) {
  for (let index = fromIndex; index >= 0; index -= 1) {
    if (Number.isFinite(series[index])) {
      return series[index];
    }
  }

  return null;
}

function buildMovingAverageSummary(currentPrice, sma20Series, sma50Series) {
  const sma20 = getLastDefinedValue(sma20Series);
  const sma50 = getLastDefinedValue(sma50Series);
  const prevSma20 = getLastDefinedValue(sma20Series, sma20Series.length - 2);
  const prevSma50 = getLastDefinedValue(sma50Series, sma50Series.length - 2);

  let regime = 'mixed';
  if (Number.isFinite(sma20) && Number.isFinite(sma50)) {
    if (currentPrice >= sma20 && sma20 >= sma50) {
      regime = 'bullish';
    } else if (currentPrice <= sma20 && sma20 <= sma50) {
      regime = 'bearish';
    }
  }

  let crossover = 'No fresh crossover';
  if (Number.isFinite(sma20) && Number.isFinite(sma50) && Number.isFinite(prevSma20) && Number.isFinite(prevSma50)) {
    if (prevSma20 <= prevSma50 && sma20 > sma50) {
      crossover = 'Fresh bullish crossover';
    } else if (prevSma20 >= prevSma50 && sma20 < sma50) {
      crossover = 'Fresh bearish crossover';
    } else if (sma20 > sma50) {
      crossover = 'Bullish structure intact';
    } else if (sma20 < sma50) {
      crossover = 'Bearish structure intact';
    }
  }

  return {
    sma20: roundNumber(sma20),
    sma50: roundNumber(sma50),
    regime,
    crossover,
    priceVsSma20: Number.isFinite(sma20) ? (currentPrice >= sma20 ? 'above' : 'below') : 'unknown',
    priceVsSma50: Number.isFinite(sma50) ? (currentPrice >= sma50 ? 'above' : 'below') : 'unknown'
  };
}

function buildTradeRecommendation({ currentPrice, previousClose, rsi, movingAverage, superTrend }) {
  let score = 0;
  const factors = [];

  if (Number.isFinite(movingAverage.sma20)) {
    if (currentPrice >= movingAverage.sma20) {
      score += 1;
      factors.push(`Price is above the 20-day moving average at ₹${movingAverage.sma20}.`);
    } else {
      score -= 1;
      factors.push(`Price is below the 20-day moving average at ₹${movingAverage.sma20}.`);
    }
  }

  if (Number.isFinite(movingAverage.sma50)) {
    if (currentPrice >= movingAverage.sma50) {
      score += 1;
      factors.push(`Price is above the 50-day moving average at ₹${movingAverage.sma50}.`);
    } else {
      score -= 1;
      factors.push(`Price is below the 50-day moving average at ₹${movingAverage.sma50}.`);
    }
  }

  if (Number.isFinite(movingAverage.sma20) && Number.isFinite(movingAverage.sma50)) {
    if (movingAverage.sma20 > movingAverage.sma50) {
      score += 2;
      factors.push(`The 20-day average is above the 50-day average, keeping the trend structure positive.`);
    } else if (movingAverage.sma20 < movingAverage.sma50) {
      score -= 2;
      factors.push(`The 20-day average is below the 50-day average, which keeps the structure weak.`);
    }
  }

  if (superTrend?.direction === 'bullish') {
    score += 2;
    factors.push(`SuperTrend remains bullish near ₹${superTrend.value}.`);
  } else if (superTrend?.direction === 'bearish') {
    score -= 2;
    factors.push(`SuperTrend remains bearish near ₹${superTrend.value}.`);
  }

  if (Number.isFinite(rsi)) {
    if (rsi <= 30) {
      score += 2;
      factors.push(`RSI (${rsi}) is oversold, so a rebound setup is possible.`);
    } else if (rsi < 45) {
      score += 1;
      factors.push(`RSI (${rsi}) is in the lower zone and favors accumulation over chasing strength.`);
    } else if (rsi <= 60) {
      factors.push(`RSI (${rsi}) is balanced and does not distort the trend signal.`);
    } else if (rsi <= 70) {
      score -= 1;
      factors.push(`RSI (${rsi}) is elevated, so upside follow-through may cool off.`);
    } else {
      score -= 2;
      factors.push(`RSI (${rsi}) is overbought and raises mean-reversion risk.`);
    }
  }

  const priceChangePercent = previousClose ? ((currentPrice - previousClose) / previousClose) * 100 : 0;
  if (priceChangePercent >= 2) {
    score += 1;
    factors.push(`Price is already up ${roundNumber(priceChangePercent)}% from the previous close, confirming momentum.`);
  } else if (priceChangePercent <= -2) {
    score -= 1;
    factors.push(`Price is down ${Math.abs(roundNumber(priceChangePercent))}% from the previous close, confirming weakness.`);
  }

  let signal = 'HOLD';
  let strength = 'BALANCED';
  let color = '#f59e0b';
  let bias = 'neutral';

  if (score >= 5) {
    signal = 'STRONG BUY';
    strength = 'HIGH CONVICTION';
    color = '#10b981';
    bias = 'bullish';
  } else if (score >= 2) {
    signal = 'BUY';
    strength = 'MODERATE';
    color = '#34d399';
    bias = 'bullish';
  } else if (score <= -5) {
    signal = 'STRONG SELL';
    strength = 'HIGH CONVICTION';
    color = '#ef4444';
    bias = 'bearish';
  } else if (score <= -2) {
    signal = 'SELL';
    strength = 'MODERATE';
    color = '#f97316';
    bias = 'bearish';
  }

  let reasoning = factors.slice(0, 3).join(' ');
  if (!reasoning) {
    reasoning = 'Indicators are mixed, so the setup is better treated as wait-and-watch.';
  }

  if (signal === 'HOLD') {
    reasoning += ' Signals are mixed, so waiting for a clearer break above resistance or below support is safer.';
  }

  return {
    signal,
    strength,
    score,
    color,
    bias,
    reasoning,
    factors,
    priceChangePercent: roundNumber(priceChangePercent)
  };
}

function generateRecommendation(rsi, currentPrice, previousClose) {
  return buildTradeRecommendation({
    currentPrice,
    previousClose,
    rsi,
    movingAverage: {},
    superTrend: null
  });
}

function generateEnhancedRecommendation(rsi, currentPrice, previousClose, superTrend, movingAverage = {}) {
  return buildTradeRecommendation({
    currentPrice,
    previousClose,
    rsi,
    movingAverage,
    superTrend
  });
}

function getMarketContext() {
  const istNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const day = istNow.getDay();
  const minutes = istNow.getHours() * 60 + istNow.getMinutes();
  const isTradingDay = day >= 1 && day <= 5;
  const marketOpen = 9 * 60 + 15;
  const straddleEntryStart = 9 * 60 + 20;
  const straddleEntryEnd = 9 * 60 + 35;
  const marketClose = 15 * 60 + 30;

  let session = 'CLOSED';
  if (isTradingDay && minutes >= marketOpen && minutes <= marketClose) {
    session = 'LIVE';
  } else if (isTradingDay && minutes < marketOpen) {
    session = 'PREOPEN';
  } else if (isTradingDay) {
    session = 'POSTMARKET';
  }

  return {
    session,
    isTradingDay,
    minutes,
    currentTime: istNow.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    }),
    marketOpen: '09:15 IST',
    marketClose: '15:30 IST',
    straddleEntryWindow: '09:20 - 09:35 IST',
    isStraddleWindow: isTradingDay && minutes >= straddleEntryStart && minutes <= straddleEntryEnd
  };
}

function estimateStrikeStep(price) {
  if (price < 200) return 5;
  if (price < 1000) return 10;
  if (price < 3000) return 20;
  return 50;
}

function buildTimeBasedStraddle(symbol, currentPrice, recommendation, marketContext) {
  const tradingSymbol = stripExchangeSuffix(symbol);
  const strikeStep = estimateStrikeStep(currentPrice);
  const atmStrike = Math.round(currentPrice / strikeStep) * strikeStep;

  let status = 'WAIT';
  let color = '#f59e0b';
  let reasoning = 'Let the opening range settle before evaluating a neutral intraday straddle.';

  if (!marketContext.isTradingDay || marketContext.session === 'CLOSED') {
    status = 'MARKET CLOSED';
    reasoning = 'The market is closed, so keep this as a planned setup for the next trading session.';
  } else if (marketContext.minutes > 15 * 60 + 5) {
    status = 'LATE ENTRY';
    reasoning = 'A fresh time-based straddle late in the session leaves very little room to manage the setup.';
  } else if (Math.abs(recommendation?.score || 0) >= 4) {
    status = 'AVOID';
    color = '#ef4444';
    reasoning = 'Trend indicators are strongly aligned in one direction, which is usually unfriendly for a neutral ATM straddle.';
  } else if (marketContext.isStraddleWindow && recommendation?.signal === 'HOLD') {
    status = 'SETUP READY';
    color = '#3b82f6';
    reasoning = 'The market is within the preferred entry window and the indicators are mixed enough to keep a neutral straddle on the watchlist.';
  } else if (marketContext.isStraddleWindow) {
    status = 'WATCH';
    color = '#60a5fa';
    reasoning = 'The window is open, but the directional indicators still need to cool down before a neutral straddle is attractive.';
  }

  return {
    name: 'Time-Based Straddle',
    status,
    color,
    timeframe: 'Intraday options setup',
    entryWindow: marketContext.straddleEntryWindow,
    exitTime: '15:15 IST',
    currentTime: marketContext.currentTime,
    atmStrike,
    strikeStep,
    summary: `${tradingSymbol} ATM ${atmStrike} CE + ${atmStrike} PE`,
    legs: [
      `${tradingSymbol} ${atmStrike} CE`,
      `${tradingSymbol} ${atmStrike} PE`
    ],
    reasoning,
    note: 'Use the live option chain in your broker to pick the exact weekly or monthly expiry. This app suggests the setup, not the contract.',
    riskNote: 'Time-based straddles work better in balanced conditions. Avoid them when moving averages and SuperTrend point strongly in one direction.'
  };
}

function buildKiteLinks(symbol) {
  const tradingSymbol = stripExchangeSuffix(symbol);
  const exchange = getExchangeSegment(symbol);
  const homeUrl = 'https://kite.zerodha.com/';
  const basketUrl = 'https://kite.zerodha.com/connect/basket';

  return {
    platform: 'Kite by Zerodha',
    exchange,
    tradingSymbol,
    homeUrl,
    chartUrl: homeUrl,
    buyUrl: basketUrl,
    sellUrl: basketUrl,
    basketUrl,
    note: 'Portiq can open Kite safely. For prefilled buy or sell baskets, configure a Kite Publisher API key in the frontend environment.'
  };
}

async function analyzeStock(symbol) {
  try {
    const [quote, historicalData] = await Promise.all([
      fetchStockQuote(symbol),
      fetchHistoricalData(symbol, 120)
    ]);

    if (!quote) {
      throw new Error('Could not fetch quote');
    }

    const closes = historicalData.map(point => point.close);
    const highs = historicalData.map(point => point.high);
    const lows = historicalData.map(point => point.low);

    const rsi = calculateRSI(closes);
    const sma20Series = calculateSMASeries(closes, 20);
    const sma50Series = calculateSMASeries(closes, 50);
    const superTrendSeries = calculateSuperTrendSeries(historicalData, 10, 3);
    const superTrend = superTrendSeries[superTrendSeries.length - 1] || null;
    const movingAverages = buildMovingAverageSummary(quote.currentPrice, sma20Series, sma50Series);
    const recommendation = generateEnhancedRecommendation(
      rsi,
      quote.currentPrice,
      quote.previousClose,
      superTrend,
      movingAverages
    );
    const marketContext = getMarketContext();
    const timeBasedStraddle = buildTimeBasedStraddle(symbol, quote.currentPrice, recommendation, marketContext);
    const kite = buildKiteLinks(symbol);

    const chartData = historicalData.slice(-30).map((point, index, recentData) => {
      const absoluteIndex = historicalData.length - recentData.length + index;
      return {
        date: point.date.toISOString().split('T')[0],
        close: roundNumber(point.close),
        high: roundNumber(point.high),
        low: roundNumber(point.low),
        volume: point.volume,
        rsi: calculateRSI(closes.slice(0, absoluteIndex + 1)),
        sma20: roundNumber(sma20Series[absoluteIndex]),
        sma50: roundNumber(sma50Series[absoluteIndex]),
        superTrend: superTrendSeries[absoluteIndex]?.value ?? null,
        superTrendDirection: superTrendSeries[absoluteIndex]?.direction ?? null
      };
    });

    return {
      ...quote,
      displaySymbol: stripExchangeSuffix(symbol),
      rsi,
      sma20: movingAverages.sma20,
      sma50: movingAverages.sma50,
      movingAverages,
      superTrend,
      recommendation,
      timeBasedStraddle,
      marketContext,
      kite,
      chartData,
      historicalData: historicalData.slice(-30),
      analysisTimestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Analysis error for ${symbol}:`, error.message);
    throw error;
  }
}

module.exports = {
  POPULAR_INDIAN_STOCKS,
  fetchStockQuote,
  fetchHistoricalData,
  calculateRSI,
  generateRecommendation,
  analyzeStock,
  calculateSuperTrend,
  generateEnhancedRecommendation
};
