// Función API para Biwenger Intelligence Panel - Vercel
// Compatible con Vercel Edge Runtime - Versión Mejorada

// Configuración de endpoints de Biwenger
const BIWENGER_BASE_URL = 'https://biwenger.as.com';
const BIWENGER_API_URL = 'https://cf.biwenger.com';

// Headers base mejorados para todas las peticiones
const getBaseHeaders = (token = null, additionalHeaders = {}) => {
  const baseHeaders = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Origin': 'https://biwenger.as.com',
    'Referer': 'https://biwenger.as.com/',
    'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'X-Requested-With': 'XMLHttpRequest'
  };

  // Agregar headers de autenticación si hay token
  if (token) {
    baseHeaders['Authorization'] = `Bearer ${token}`;
    // Headers adicionales requeridos por Biwenger
    baseHeaders['X-League'] = 'la-liga';
    baseHeaders['X-Version'] = '2.0';
    baseHeaders['X-Lang'] = 'es';
  }

  return { ...baseHeaders, ...additionalHeaders };
};

// Función para manejar cookies de sesión
const parseCookies = (cookieHeader) => {
  const cookies = {};
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });
  }
  return cookies;
};

// Función para construir string de cookies
const buildCookieString = (cookies) => {
  return Object.entries(cookies)
    .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
    .join('; ');
};

// Función principal del proxy
export default async function handler(req, res) {
  console.log(`[API] ${req.method} ${req.url} - ${new Date().toISOString()}`);

  // Manejar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Obtener la ruta desde los parámetros dinámicos
  const { route } = req.query;
  const routes = Array.isArray(route) ? route : [route];
  const path = '/' + routes.join('/');
  
  console.log(`[API Proxy] Processing ${req.method} ${path}`);

  // Obtener cookies existentes
  const cookies = parseCookies(req.headers.cookie);
  console.log('[Cookies]:', Object.keys(cookies));
  
  // Obtener body si es POST
  let body = null;
  if (req.method === 'POST' && req.body) {
    body = req.body;
  }

  try {
    switch (path) {
      case '/login':
        return await handleLogin(req, res, body);
        
      case '/me':
        return await handleGetMyData(req, res, cookies);
        
      case '/players':
        return await handleGetPlayers(req, res);
        
      case '/market':
        return await handleGetMarket(req, res, cookies);
        
      case '/debug':
        return await handleDebugLeagues(req, res, cookies);

      case '/investigate':
        return await handleInvestigate(req, res, cookies);

      case '/test-headers':
        return await handleTestHeaders(req, res, cookies);
        
      default:
        res.status(404).json({ error: `Endpoint ${path} no encontrado` });
    }
  } catch (error) {
    console.error('[API Error]:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message,
      path: path,
      timestamp: new Date().toISOString()
    });
  }
}

// Manejar login con mejor gestión de cookies
async function handleLogin(req, res, body) {
  console.log('[Login] Starting login process');
  
  if (!body || !body.email || !body.password) {
    return res.status(400).json({ error: 'Email y contraseña requeridos' });
  }

  try {
    console.log('[Login] Attempting to authenticate with Biwenger API');
    
    const loginResponse = await fetch(`${BIWENGER_BASE_URL}/api/v2/auth/login`, {
      method: 'POST',
      headers: getBaseHeaders(),
      body: JSON.stringify({
        email: body.email,
        password: body.password
      }),
    });

    console.log('[Login] Response status:', loginResponse.status);
    
    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.error('[Login] Error response:', errorText);
      
      return res.status(401).json({ 
        error: 'Credenciales inválidas',
        details: `HTTP ${loginResponse.status}`,
        response: errorText
      });
    }

    const loginData = await loginResponse.json();
    console.log('[Login] Login successful, token received');
    
    // Extraer token y datos del usuario
    const token = loginData.token;
    const userData = loginData.user;
    
    if (!token) {
      return res.status(500).json({ error: 'No se recibió token de autenticación' });
    }

    // Configurar cookies con mejor compatibilidad
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = isProduction ? 
      'HttpOnly; Secure; SameSite=None; Max-Age=86400; Path=/' : 
      'HttpOnly; Max-Age=86400; Path=/';

    // Setear múltiples cookies
    res.setHeader('Set-Cookie', [
      `bw_token=${token}; ${cookieOptions}`,
      `bw_user=${userData?.id || ''}; ${cookieOptions}`,
      `bw_league=la-liga; ${cookieOptions}`
    ]);

    res.status(200).json({
      success: true,
      user: {
        id: userData?.id,
        name: userData?.name,
        email: userData?.email
      },
      token: token // Temporal para debug
    });
  } catch (error) {
    console.error('[Login Error]:', error);
    res.status(500).json({ 
      error: 'Error en el proceso de login',
      details: error.message
    });
  }
}

// Test mejorado de headers
async function handleTestHeaders(req, res, cookies) {
  const token = cookies.bw_token;
  
  if (!token) {
    return res.status(401).json({ error: 'No autenticado - token no encontrado' });
  }

  try {
    console.log('[TestHeaders] Testing different header combinations');
    
    const testConfigurations = [
      {
        name: 'Config 1 - Headers básicos',
        headers: getBaseHeaders(token)
      },
      {
        name: 'Config 2 - Con cookies',
        headers: {
          ...getBaseHeaders(token),
          'Cookie': buildCookieString(cookies)
        }
      },
      {
        name: 'Config 3 - Headers alternativos',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://biwenger.as.com/',
          'Origin': 'https://biwenger.as.com',
          'x-league': 'la-liga',
          'x-version': '2.0',
          'x-lang': 'es'
        }
      }
    ];

    const results = [];

    for (const config of testConfigurations) {
      try {
        console.log(`[TestHeaders] Testing: ${config.name}`);
        
        const response = await fetch(`${BIWENGER_BASE_URL}/api/v2/account`, {
          method: 'GET',
          headers: config.headers
        });

        const result = {
          config: config.name,
          status: response.status,
          ok: response.ok,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        };

        if (response.ok) {
          result.data = await response.json();
        } else {
          result.errorText = await response.text();
        }

        results.push(result);
      } catch (error) {
        results.push({
          config: config.name,
          error: error.message
        });
      }
    }

    res.status(200).json({
      token: `${token.substring(0, 20)}...`,
      cookies: Object.keys(cookies),
      results: results
    });
  } catch (error) {
    console.error('[TestHeaders Error]:', error);
    res.status(500).json({ 
      error: 'Error en test de headers',
      details: error.message
    });
  }
}

// Obtener datos del usuario con headers mejorados
async function handleGetMyData(req, res, cookies) {
  const token = cookies.bw_token;
  const userId = cookies.bw_user;
  
  if (!token) {
    return res.status(401).json({ error: 'No autenticado - token no encontrado' });
  }

  try {
    console.log('[GetMyData] Fetching user data');
    
    const response = await fetch(`${BIWENGER_BASE_URL}/api/v2/account`, {
      method: 'GET',
      headers: {
        ...getBaseHeaders(token),
        'Cookie': buildCookieString(cookies)
      }
    });

    console.log('[GetMyData] Response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      res.status(200).json(data);
    } else {
      const errorText = await response.text();
      console.error('[GetMyData] Error:', errorText);
      res.status(response.status).json({ 
        error: `Error ${response.status}`,
        details: errorText
      });
    }
  } catch (error) {
    console.error('[Get My Data Error]:', error);
    res.status(500).json({ 
      error: 'Error obteniendo datos del usuario',
      details: error.message
    });
  }
}

// Obtener datos globales de jugadores
async function handleGetPlayers(req, res) {
  try {
    console.log('[GetPlayers] Fetching players data');
    
    const response = await fetch(`${BIWENGER_API_URL}/api/v2/competitions/la-liga/data?lang=es&score=1`, {
      method: 'GET',
      headers: getBaseHeaders(),
    });

    console.log('[GetPlayers] Response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      res.status(200).json(data);
    } else {
      const errorText = await response.text();
      res.status(response.status).json({ 
        error: `Error ${response.status}`,
        details: errorText
      });
    }
  } catch (error) {
    console.error('[Get Players Error]:', error);
    res.status(500).json({ 
      error: 'Error obteniendo datos de jugadores',
      details: error.message
    });
  }
}

// Obtener mercado con headers mejorados
async function handleGetMarket(req, res, cookies) {
  const token = cookies.bw_token;
  
  if (!token) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  try {
    console.log('[GetMarket] Fetching market data');
    
    const response = await fetch(`${BIWENGER_BASE_URL}/api/v2/market`, {
      method: 'GET',
      headers: {
        ...getBaseHeaders(token),
        'Cookie': buildCookieString(cookies)
      }
    });

    console.log('[GetMarket] Response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      res.status(200).json(data);
    } else {
      const errorText = await response.text();
      res.status(response.status).json({ 
        error: `Error ${response.status}`,
        details: errorText
      });
    }
  } catch (error) {
    console.error('[Get Market Error]:', error);
    res.status(500).json({ 
      error: 'Error obteniendo datos del mercado',
      details: error.message
    });
  }
}

// Función de debug mejorada
async function handleDebugLeagues(req, res, cookies) {
  const token = cookies.bw_token;
  
  const debugInfo = {
    timestamp: new Date().toISOString(),
    cookies: cookies,
    tokenPresent: !!token,
    tokenLength: token ? token.length : 0,
    endpoints: []
  };

  if (!token) {
    debugInfo.error = 'No token found';
    return res.status(200).json(debugInfo);
  }

  // Probar múltiples endpoints con diferentes configuraciones
  const testEndpoints = [
    {
      url: `${BIWENGER_BASE_URL}/api/v2/account`,
      name: 'Account'
    },
    {
      url: `${BIWENGER_BASE_URL}/api/v2/home`,
      name: 'Home'
    },
    {
      url: `${BIWENGER_BASE_URL}/api/v2/leagues`,
      name: 'Leagues'
    },
    {
      url: `${BIWENGER_BASE_URL}/api/v2/user/leagues`,
      name: 'User Leagues'
    }
  ];

  for (const endpoint of testEndpoints) {
    try {
      const response = await fetch(endpoint.url, {
        method: 'GET',
        headers: {
          ...getBaseHeaders(token),
          'Cookie': buildCookieString(cookies)
        }
      });

      const result = {
        endpoint: endpoint.url,
        name: endpoint.name,
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      };

      if (response.ok) {
        try {
          result.data = await response.json();
        } catch (parseError) {
          result.parseError = parseError.message;
        }
      } else {
        try {
          result.error = await response.text();
        } catch (textError) {
          result.error = `Cannot read error text: ${textError.message}`;
        }
      }

      debugInfo.endpoints.push(result);
    } catch (error) {
      debugInfo.endpoints.push({
        endpoint: endpoint.url,
        name: endpoint.name,
        error: error.message
      });
    }
  }

  res.status(200).json(debugInfo);
}

// Función de investigación mejorada
async function handleInvestigate(req, res, cookies) {
  const token = cookies.bw_token;
  
  if (!token) {
    return res.status(200).json({ 
      error: 'No token - login first',
      cookies: Object.keys(cookies),
      suggestion: 'Haz login primero en /api/login'
    });
  }

  try {
    const response = await fetch(`${BIWENGER_BASE_URL}/api/v2/account`, {
      method: 'GET',
      headers: {
        ...getBaseHeaders(token),
        'Cookie': buildCookieString(cookies)
      }
    });

    let data;
    const responseHeaders = Object.fromEntries(response.headers.entries());
    
    if (response.ok) {
      data = await response.json();
    } else {
      data = { 
        error: 'Response not OK', 
        status: response.status,
        statusText: response.statusText,
        errorText: await response.text()
      };
    }

    res.status(200).json({ 
      status: response.status,
      ok: response.ok,
      data: data,
      responseHeaders: responseHeaders,
      tokenInfo: {
        present: true,
        length: token.length,
        preview: `${token.substring(0, 20)}...`
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      stack: error.stack
    });
  }
}