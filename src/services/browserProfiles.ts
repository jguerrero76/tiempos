// Perfiles de navegador para rotar aleatoriamente en cada petición a AUCORSA.
// Cada petición simula un dispositivo/SO/navegador distinto para evitar
// que AUCORSA nos detecte como un bot por patrones fijos.

export interface BrowserProfile {
  name: string;
  userAgent: string;
  secChUa: string;
  secChUaPlatform: string;
  secChUaMobile: string;
  acceptLanguage: string;
}

const profiles: BrowserProfile[] = [
  // ==================== macOS ====================
  {
    name: "macOS Chrome 150",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
    secChUa: '"Not;A=Brand";v="8", "Chromium";v="150", "Google Chrome";v="150"',
    secChUaPlatform: '"macOS"',
    secChUaMobile: "?0",
    acceptLanguage: "es-ES,es;q=0.9",
  },
  {
    name: "macOS Chrome 149",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
    secChUa: '"Not;A=Brand";v="8", "Chromium";v="149", "Google Chrome";v="149"',
    secChUaPlatform: '"macOS"',
    secChUaMobile: "?0",
    acceptLanguage: "es-ES,es;q=0.9",
  },
  {
    name: "macOS Chrome 148",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
    secChUa: '"Not;A=Brand";v="8", "Chromium";v="148", "Google Chrome";v="148"',
    secChUaPlatform: '"macOS"',
    secChUaMobile: "?0",
    acceptLanguage: "es;q=0.9",
  },
  {
    name: "macOS Safari 18.4",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15",
    secChUa: '"Not;A=Brand";v="8", "Safari";v="18.4", "WebKit";v="605.1.15"',
    secChUaPlatform: '"macOS"',
    secChUaMobile: "?0",
    acceptLanguage: "es-ES,es;q=0.9",
  },
  {
    name: "macOS Safari 17.5",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
    secChUa: '"Not;A=Brand";v="8", "Safari";v="17.5", "WebKit";v="605.1.15"',
    secChUaPlatform: '"macOS"',
    secChUaMobile: "?0",
    acceptLanguage: "en-ES,en;q=0.9",
  },
  {
    name: "macOS Firefox 136",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:136.0) Gecko/20100101 Firefox/136.0",
    secChUa: '"Not;A=Brand";v="8", "Firefox";v="136.0", "Gecko";v="20100101"',
    secChUaPlatform: '"macOS"',
    secChUaMobile: "?0",
    acceptLanguage: "es-ES,es;q=0.9",
  },
  {
    name: "macOS Firefox 135",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:135.0) Gecko/20100101 Firefox/135.0",
    secChUa: '"Not;A=Brand";v="8", "Firefox";v="135.0", "Gecko";v="20100101"',
    secChUaPlatform: '"macOS"',
    secChUaMobile: "?0",
    acceptLanguage: "es-ES,es;q=0.8",
  },
  {
    name: "macOS Brave 150",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
    secChUa: '"Not;A=Brand";v="8", "Chromium";v="150", "Brave";v="150"',
    secChUaPlatform: '"macOS"',
    secChUaMobile: "?0",
    acceptLanguage: "es,en;q=0.9",
  },
  // ==================== Windows ====================
  {
    name: "Windows Chrome 150",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
    secChUa: '"Not;A=Brand";v="8", "Chromium";v="150", "Google Chrome";v="150"',
    secChUaPlatform: '"Windows"',
    secChUaMobile: "?0",
    acceptLanguage: "es-ES,es;q=0.9",
  },
  {
    name: "Windows Chrome 147",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36",
    secChUa: '"Not;A=Brand";v="8", "Chromium";v="147", "Google Chrome";v="147"',
    secChUaPlatform: '"Windows"',
    secChUaMobile: "?0",
    acceptLanguage: "es;q=0.9",
  },
  {
    name: "Windows Edge 150",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0",
    secChUa: '"Not;A=Brand";v="8", "Chromium";v="150", "Microsoft Edge";v="150"',
    secChUaPlatform: '"Windows"',
    secChUaMobile: "?0",
    acceptLanguage: "es-ES,es;q=0.9",
  },
  {
    name: "Windows Edge 149",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0",
    secChUa: '"Not;A=Brand";v="8", "Chromium";v="149", "Microsoft Edge";v="149"',
    secChUaPlatform: '"Windows"',
    secChUaMobile: "?0",
    acceptLanguage: "en-US,en;q=0.9,es;q=0.8",
  },
  {
    name: "Windows Firefox 136",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0",
    secChUa: '"Not;A=Brand";v="8", "Firefox";v="136.0", "Gecko";v="20100101"',
    secChUaPlatform: '"Windows"',
    secChUaMobile: "?0",
    acceptLanguage: "es-ES,es;q=0.9",
  },
  {
    name: "Windows Firefox 134",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0",
    secChUa: '"Not;A=Brand";v="8", "Firefox";v="134.0", "Gecko";v="20100101"',
    secChUaPlatform: '"Windows"',
    secChUaMobile: "?0",
    acceptLanguage: "es,en;q=0.7",
  },
  {
    name: "Windows Opera 110",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 OPR/110.0.0.0",
    secChUa: '"Not;A=Brand";v="8", "Chromium";v="150", "Opera";v="110"',
    secChUaPlatform: '"Windows"',
    secChUaMobile: "?0",
    acceptLanguage: "es,en;q=0.9",
  },
  // ==================== Linux ====================
  {
    name: "Linux Chrome 150",
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
    secChUa: '"Not;A=Brand";v="8", "Chromium";v="150", "Google Chrome";v="150"',
    secChUaPlatform: '"Linux"',
    secChUaMobile: "?0",
    acceptLanguage: "es-ES,es;q=0.9",
  },
  {
    name: "Linux Chrome 148",
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
    secChUa: '"Not;A=Brand";v="8", "Chromium";v="148", "Google Chrome";v="148"',
    secChUaPlatform: '"Linux"',
    secChUaMobile: "?0",
    acceptLanguage: "en-US,en;q=0.9",
  },
  {
    name: "Linux Firefox 136",
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0",
    secChUa: '"Not;A=Brand";v="8", "Firefox";v="136.0", "Gecko";v="20100101"',
    secChUaPlatform: '"Linux"',
    secChUaMobile: "?0",
    acceptLanguage: "es-ES,es;q=0.9",
  },
  {
    name: "Linux Firefox 133",
    userAgent:
      "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133.0",
    secChUa: '"Not;A=Brand";v="8", "Firefox";v="133.0", "Gecko";v="20100101"',
    secChUaPlatform: '"Linux"',
    secChUaMobile: "?0",
    acceptLanguage: "es;q=0.9",
  },
  // ==================== Android ====================
  {
    name: "Android Chrome 150",
    userAgent:
      "Mozilla/5.0 (Linux; Android 15; Pixel 9 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36",
    secChUa: '"Not;A=Brand";v="8", "Chromium";v="150", "Google Chrome";v="150"',
    secChUaPlatform: '"Android"',
    secChUaMobile: "?1",
    acceptLanguage: "es-ES,es;q=0.9",
  },
  {
    name: "Android Chrome 149",
    userAgent:
      "Mozilla/5.0 (Linux; Android 14; Samsung Galaxy S25) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36",
    secChUa: '"Not;A=Brand";v="8", "Chromium";v="149", "Google Chrome";v="149"',
    secChUaPlatform: '"Android"',
    secChUaMobile: "?1",
    acceptLanguage: "es;q=0.9",
  },
  {
    name: "Android Samsung Browser 27",
    userAgent:
      "Mozilla/5.0 (Linux; Android 15; SM-S938B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/27.0 Chrome/150.0.0.0 Mobile Safari/537.36",
    secChUa: '"Not;A=Brand";v="8", "Chromium";v="150", "Samsung Internet";v="27.0"',
    secChUaPlatform: '"Android"',
    secChUaMobile: "?1",
    acceptLanguage: "es-ES,es;q=0.9",
  },
  {
    name: "Android Firefox 136",
    userAgent:
      "Mozilla/5.0 (Android 15; Mobile; rv:136.0) Gecko/136.0 Firefox/136.0",
    secChUa: '"Not;A=Brand";v="8", "Firefox";v="136.0", "Gecko";v="20100101"',
    secChUaPlatform: '"Android"',
    secChUaMobile: "?1",
    acceptLanguage: "es,en;q=0.8",
  },
  {
    name: "Android Chrome 146 (OnePlus)",
    userAgent:
      "Mozilla/5.0 (Linux; Android 14; OnePlus 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36",
    secChUa: '"Not;A=Brand";v="8", "Chromium";v="146", "Google Chrome";v="146"',
    secChUaPlatform: '"Android"',
    secChUaMobile: "?1",
    acceptLanguage: "en-GB,en;q=0.9,es;q=0.8",
  },
  // ==================== iOS ====================
  {
    name: "iOS Safari 18.4",
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Mobile/15E148 Safari/604.1",
    secChUa: '"Not;A=Brand";v="8", "Safari";v="18.4", "WebKit";v="605.1.15"',
    secChUaPlatform: '"iOS"',
    secChUaMobile: "?1",
    acceptLanguage: "es-ES,es;q=0.9",
  },
  {
    name: "iOS Safari 17.4",
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
    secChUa: '"Not;A=Brand";v="8", "Safari";v="17.4", "WebKit";v="605.1.15"',
    secChUaPlatform: '"iOS"',
    secChUaMobile: "?1",
    acceptLanguage: "es,en;q=0.9",
  },
  {
    name: "iOS Chrome 150",
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) CriOS/150.0.0.0 Mobile/15E148 Safari/604.1",
    secChUa: '"Not;A=Brand";v="8", "Chromium";v="150", "Google Chrome";v="150"',
    secChUaPlatform: '"iOS"',
    secChUaMobile: "?1",
    acceptLanguage: "es-ES,es;q=0.9",
  },
  {
    name: "iOS Chrome 148",
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) CriOS/148.0.0.0 Mobile/15E148 Safari/604.1",
    secChUa: '"Not;A=Brand";v="8", "Chromium";v="148", "Google Chrome";v="148"',
    secChUaPlatform: '"iOS"',
    secChUaMobile: "?1",
    acceptLanguage: "en-US,en;q=0.9",
  },
  {
    name: "iPad Safari 18",
    userAgent:
      "Mozilla/5.0 (iPad; CPU OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Mobile/15E148 Safari/604.1",
    secChUa: '"Not;A=Brand";v="8", "Safari";v="18.4", "WebKit";v="605.1.15"',
    secChUaPlatform: '"iPad"',
    secChUaMobile: "?1",
    acceptLanguage: "es-ES,es;q=0.9",
  },
  {
    name: "iPad Chrome 150",
    userAgent:
      "Mozilla/5.0 (iPad; CPU OS 18_4 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) CriOS/150.0.0.0 Mobile/15E148 Safari/604.1",
    secChUa: '"Not;A=Brand";v="8", "Chromium";v="150", "Google Chrome";v="150"',
    secChUaPlatform: '"iPad"',
    secChUaMobile: "?1",
    acceptLanguage: "es;q=0.9,en;q=0.8",
  },
  // ==================== macOS adicionales ====================
  {
    name: "macOS Chrome 147",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36",
    secChUa: '"Not;A=Brand";v="8", "Chromium";v="147", "Google Chrome";v="147"',
    secChUaPlatform: '"macOS"',
    secChUaMobile: "?0",
    acceptLanguage: "en-US,en;q=0.9",
  },
  {
    name: "macOS Safari 18.2",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15",
    secChUa: '"Not;A=Brand";v="8", "Safari";v="18.2", "WebKit";v="605.1.15"',
    secChUaPlatform: '"macOS"',
    secChUaMobile: "?0",
    acceptLanguage: "es-ES,es;q=0.9",
  },
  {
    name: "macOS Safari 17.2",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
    secChUa: '"Not;A=Brand";v="8", "Safari";v="17.2", "WebKit";v="605.1.15"',
    secChUaPlatform: '"macOS"',
    secChUaMobile: "?0",
    acceptLanguage: "es;q=0.9",
  },
  {
    name: "macOS Firefox 134",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:134.0) Gecko/20100101 Firefox/134.0",
    secChUa: '"Not;A=Brand";v="8", "Firefox";v="134.0", "Gecko";v="20100101"',
    secChUaPlatform: '"macOS"',
    secChUaMobile: "?0",
    acceptLanguage: "en-US,en;q=0.9,es;q=0.8",
  },
  {
    name: "macOS Edge 150",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0",
    secChUa: '"Not;A=Brand";v="8", "Chromium";v="150", "Microsoft Edge";v="150"',
    secChUaPlatform: '"macOS"',
    secChUaMobile: "?0",
    acceptLanguage: "es-ES,es;q=0.9",
  },
  {
    name: "macOS Opera 110",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 OPR/110.0.0.0",
    secChUa: '"Not;A=Brand";v="8", "Chromium";v="150", "Opera";v="110"',
    secChUaPlatform: '"macOS"',
    secChUaMobile: "?0",
    acceptLanguage: "es,en;q=0.9",
  },
  // ==================== Windows adicionales ====================
  {
    name: "Windows Chrome 148",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
    secChUa: '"Not;A=Brand";v="8", "Chromium";v="148", "Google Chrome";v="148"',
    secChUaPlatform: '"Windows"',
    secChUaMobile: "?0",
    acceptLanguage: "es-ES,es;q=0.9",
  },
  {
    name: "Windows Chrome 146",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
    secChUa: '"Not;A=Brand";v="8", "Chromium";v="146", "Google Chrome";v="146"',
    secChUaPlatform: '"Windows"',
    secChUaMobile: "?0",
    acceptLanguage: "en,es;q=0.8",
  },
  {
    name: "Windows Edge 148",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0",
    secChUa: '"Not;A=Brand";v="8", "Chromium";v="148", "Microsoft Edge";v="148"',
    secChUaPlatform: '"Windows"',
    secChUaMobile: "?0",
    acceptLanguage: "es-ES,es;q=0.9",
  },
  {
    name: "Windows Firefox 135",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0",
    secChUa: '"Not;A=Brand";v="8", "Firefox";v="135.0", "Gecko";v="20100101"',
    secChUaPlatform: '"Windows"',
    secChUaMobile: "?0",
    acceptLanguage: "es,en;q=0.9",
  },
  {
    name: "Windows Opera 109",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 OPR/109.0.0.0",
    secChUa: '"Not;A=Brand";v="8", "Chromium";v="149", "Opera";v="109"',
    secChUaPlatform: '"Windows"',
    secChUaMobile: "?0",
    acceptLanguage: "en-US,en;q=0.9",
  },
  {
    name: "Windows Brave 150",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
    secChUa: '"Not;A=Brand";v="8", "Chromium";v="150", "Brave";v="150"',
    secChUaPlatform: '"Windows"',
    secChUaMobile: "?0",
    acceptLanguage: "es-ES,es;q=0.9",
  },
  // ==================== Linux adicionales ====================
  {
    name: "Linux Chrome 149",
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
    secChUa: '"Not;A=Brand";v="8", "Chromium";v="149", "Google Chrome";v="149"',
    secChUaPlatform: '"Linux"',
    secChUaMobile: "?0",
    acceptLanguage: "es-ES,es;q=0.9",
  },
  {
    name: "Linux Chrome 147",
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36",
    secChUa: '"Not;A=Brand";v="8", "Chromium";v="147", "Google Chrome";v="147"',
    secChUaPlatform: '"Linux"',
    secChUaMobile: "?0",
    acceptLanguage: "es;q=0.9",
  },
  {
    name: "Linux Firefox 135",
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64; rv:135.0) Gecko/20100101 Firefox/135.0",
    secChUa: '"Not;A=Brand";v="8", "Firefox";v="135.0", "Gecko";v="20100101"',
    secChUaPlatform: '"Linux"',
    secChUaMobile: "?0",
    acceptLanguage: "en-US,en;q=0.9",
  },
  {
    name: "Linux Firefox 134",
    userAgent:
      "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:134.0) Gecko/20100101 Firefox/134.0",
    secChUa: '"Not;A=Brand";v="8", "Firefox";v="134.0", "Gecko";v="20100101"',
    secChUaPlatform: '"Linux"',
    secChUaMobile: "?0",
    acceptLanguage: "es,en;q=0.8",
  },
  {
    name: "Linux Opera 110",
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 OPR/110.0.0.0",
    secChUa: '"Not;A=Brand";v="8", "Chromium";v="150", "Opera";v="110"',
    secChUaPlatform: '"Linux"',
    secChUaMobile: "?0",
    acceptLanguage: "es-ES,es;q=0.9",
  },
  // ==================== Android adicionales ====================
  {
    name: "Android Chrome 148",
    userAgent:
      "Mozilla/5.0 (Linux; Android 14; Xiaomi 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36",
    secChUa: '"Not;A=Brand";v="8", "Chromium";v="148", "Google Chrome";v="148"',
    secChUaPlatform: '"Android"',
    secChUaMobile: "?1",
    acceptLanguage: "es-ES,es;q=0.9",
  },
  {
    name: "Android Chrome 147",
    userAgent:
      "Mozilla/5.0 (Linux; Android 14; Motorola Edge 50) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
    secChUa: '"Not;A=Brand";v="8", "Chromium";v="147", "Google Chrome";v="147"',
    secChUaPlatform: '"Android"',
    secChUaMobile: "?1",
    acceptLanguage: "es;q=0.9",
  },
  {
    name: "Android Firefox 135",
    userAgent:
      "Mozilla/5.0 (Android 14; Mobile; rv:135.0) Gecko/135.0 Firefox/135.0",
    secChUa: '"Not;A=Brand";v="8", "Firefox";v="135.0", "Gecko";v="20100101"',
    secChUaPlatform: '"Android"',
    secChUaMobile: "?1",
    acceptLanguage: "en-US,en;q=0.9",
  },
  {
    name: "Android Samsung Browser 26",
    userAgent:
      "Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/26.0 Chrome/148.0.0.0 Mobile Safari/537.36",
    secChUa: '"Not;A=Brand";v="8", "Chromium";v="148", "Samsung Internet";v="26.0"',
    secChUaPlatform: '"Android"',
    secChUaMobile: "?1",
    acceptLanguage: "es-ES,es;q=0.9",
  },
  {
    name: "Android Edge 150",
    userAgent:
      "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36 Edg/150.0.0.0",
    secChUa: '"Not;A=Brand";v="8", "Chromium";v="150", "Microsoft Edge";v="150"',
    secChUaPlatform: '"Android"',
    secChUaMobile: "?1",
    acceptLanguage: "es,en;q=0.9",
  },
  // ==================== iOS adicionales ====================
  {
    name: "iOS Safari 18.0",
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
    secChUa: '"Not;A=Brand";v="8", "Safari";v="18.0", "WebKit";v="605.1.15"',
    secChUaPlatform: '"iOS"',
    secChUaMobile: "?1",
    acceptLanguage: "es-ES,es;q=0.9",
  },
  {
    name: "iOS Safari 17.0",
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    secChUa: '"Not;A=Brand";v="8", "Safari";v="17.0", "WebKit";v="605.1.15"',
    secChUaPlatform: '"iOS"',
    secChUaMobile: "?1",
    acceptLanguage: "es;q=0.9",
  },
  {
    name: "iOS Chrome 149",
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_3 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) CriOS/149.0.0.0 Mobile/15E148 Safari/604.1",
    secChUa: '"Not;A=Brand";v="8", "Chromium";v="149", "Google Chrome";v="149"',
    secChUaPlatform: '"iOS"',
    secChUaMobile: "?1",
    acceptLanguage: "en-US,en;q=0.9,es;q=0.8",
  },
  {
    name: "iOS Chrome 147",
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) CriOS/147.0.0.0 Mobile/15E148 Safari/604.1",
    secChUa: '"Not;A=Brand";v="8", "Chromium";v="147", "Google Chrome";v="147"',
    secChUaPlatform: '"iOS"',
    secChUaMobile: "?1",
    acceptLanguage: "es-ES,es;q=0.9",
  },
  {
    name: "iOS Firefox 136",
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/136.0 Mobile/15E148 Safari/605.1.15",
    secChUa: '"Not;A=Brand";v="8", "Firefox";v="136.0", "Gecko";v="20100101"',
    secChUaPlatform: '"iOS"',
    secChUaMobile: "?1",
    acceptLanguage: "es,en;q=0.9",
  },
  {
    name: "iPad Safari 17",
    userAgent:
      "Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
    secChUa: '"Not;A=Brand";v="8", "Safari";v="17.4", "WebKit";v="605.1.15"',
    secChUaPlatform: '"iPad"',
    secChUaMobile: "?1",
    acceptLanguage: "en,es;q=0.8",
  },
  {
    name: "iPad Chrome 149",
    userAgent:
      "Mozilla/5.0 (iPad; CPU OS 18_3 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) CriOS/149.0.0.0 Mobile/15E148 Safari/604.1",
    secChUa: '"Not;A=Brand";v="8", "Chromium";v="149", "Google Chrome";v="149"',
    secChUaPlatform: '"iPad"',
    secChUaMobile: "?1",
    acceptLanguage: "es-ES,es;q=0.9",
  },
];

let lastIndex = -1;

/**
 * Devuelve un perfil de navegador aleatorio, evitando repetir el mismo
 * perfil dos veces seguidas para mayor variedad.
 */
export function getRandomProfile(): BrowserProfile {
  let index: number;
  do {
    index = Math.floor(Math.random() * profiles.length);
  } while (index === lastIndex && profiles.length > 1);
  lastIndex = index;
  return profiles[index];
}

/**
 * Construye los headers base usando un perfil aleatorio.
 * Incluye todos los headers que enviaría un navegador real.
 */
export function buildRandomHeaders(): Record<string, string> {
  const profile = getRandomProfile();

  return {
    accept: "*/*",
    "accept-language": profile.acceptLanguage,
    "cache-control": "no-cache",
    pragma: "no-cache",
    priority: "u=1, i",
    "sec-ch-ua": profile.secChUa,
    "sec-ch-ua-mobile": profile.secChUaMobile,
    "sec-ch-ua-platform": profile.secChUaPlatform,
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site",
    "user-agent": profile.userAgent,
    "x-requested-with": "XMLHttpRequest",
  };
}

/**
 * Espera un tiempo aleatorio para simular el comportamiento humano
 * entre peticiones. El delay varía entre minDelay y maxDelay ms.
 * Por defecto espera entre 500ms y 2500ms.
 */
export async function randomDelay(minDelay = 500, maxDelay = 2500): Promise<void> {
  const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Lista de proxies SOCKS5/HTTP para rotar IP (opcional).
 * Se configura vía variable de entorno PROXY_LIST.
 * Formato: socks5://user:pass@host:port o http://user:pass@host:port
 * Múltiples proxies separados por comas.
 */
let proxyList: string[] | undefined;
let proxyIndex = 0;

function getProxyList(): string[] {
  if (!proxyList) {
    const raw = process.env.PROXY_LIST || "";
    proxyList = raw
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }
  return proxyList;
}

/**
 * Devuelve un proxy aleatorio de la lista configurada, o undefined si no hay.
 * Rota secuencialmente para distribuir las peticiones entre los proxies.
 */
export function getNextProxy(): string | undefined {
  const list = getProxyList();
  if (list.length === 0) return undefined;
  const proxy = list[proxyIndex % list.length];
  proxyIndex++;
  return proxy;
}

/**
 * Devuelve true si hay proxies configurados.
 */
export function hasProxies(): boolean {
  return getProxyList().length > 0;
}