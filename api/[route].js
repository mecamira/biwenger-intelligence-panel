// Función API para Biwenger Intelligence Panel - Vercel
// Compatible con Vercel Edge Runtime - Versión Actualizada para resolver "Old version"

// Configuración de endpoints de Biwenger
const BIWENGER_BASE_URL = 'https://biwenger.as.com';
const BIWENGER_API_URL = 'https://cf.biwenger.com';

// Headers actualizados para evitar el error "Old version"
const getBaseHeaders = (token = null, userId = null, leagueId = null, additionalHeaders = {}) => {
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
    'X-Requested-With': 'XMLHttpRequest',
    // Headers críticos para evitar "Old version"
    'X-Version': '640', // Versión actualizada
    'X-Lang': 'es',
    'X-League': leagueId || 'la-liga' // Usar league ID específico si está disponible
  };

  // Agregar headers de autenticación si hay token
  if (token) {
    baseHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Agregar X-User si tenemos userId (debe ser el ID del usuario EN LA LIGA)
  if (userId) {
    baseHeaders['X-User'] = userId;
  }

  return { ...baseHeaders, ...additionalHeaders };
};

// Función para extraer IDs correctos desde account data
const extractUserContext = (accountData) => {
  if (!accountData?.data) return null;
  
  const leagues = accountData.data.leagues;
  if (!leagues || leagues.length === 0) return null;
  
  // Tomar la primera liga por defecto
  const league = leagues[0];
  
  return {
    accountId: accountData.data.account?.id,
    leagueUserId: league.user?.id, // Este es el ID que necesitamos para X-User
    leagueId: league.id,
    leagueName: league.name,
    leagueSlug: league.competition || 'la-liga'
  };
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

      case '/test-versions':
        return await handleTestVersions(req, res, cookies);
        
      case '/league-context':
        return await handleGetLeagueContext(req, res, cookies);
        
      case '/my-team':
        return await handleGetMyTeam(req, res, cookies);
        
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

// Test diferentes versiones para encontrar la correcta
async function handleTestVersions(req, res, cookies) {
  const token = cookies.bw_token;
  
  if (!token) {
    return res.status(401).json({ error: 'No autenticado - token no encontrado' });
  }

  console.log('[TestVersions] Testing different version headers');
  
  // Diferentes versiones a probar
  const versions = ['640', '630', '620', '610', '600', '590', '580', '2.0', '3.0', '4.0'];
  const results = [];

  for (const version of versions) {
    try {
      const response = await fetch(`${BIWENGER_BASE_URL}/api/v2/account`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://biwenger.as.com/',
          'Origin': 'https://biwenger.as.com',
          'X-Version': version,
          'X-Lang': 'es',
          'X-League': 'la-liga',
          'Cookie': buildCookieString(cookies)
        }
      });

      const result = {
        version: version,
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      };

      if (response.ok) {
        try {
          result.data = await response.json();
          result.success = true;
        } catch (parseError) {
          result.parseError = parseError.message;
        }
      } else {
        try {
          const errorText = await response.text();
          result.error = errorText;
        } catch (textError) {
          result.error = `Cannot read error: ${textError.message}`;
        }
      }

      results.push(result);
      
      // Si encontramos una versión que funciona, podemos parar
      if (response.ok) {
        console.log(`[TestVersions] Found working version: ${version}`);
        break;
      }
    } catch (error) {
      results.push({
        version: version,
        error: error.message
      });
    }
  }

  res.status(200).json({
    timestamp: new Date().toISOString(),
    message: 'Version testing results',
    results: results,
    recommendation: results.find(r => r.success) ? 
      `Use version: ${results.find(r => r.success).version}` : 
      'No working version found - may need different approach'
  });
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

// Nuevo endpoint para obtener contexto de liga
async function handleGetLeagueContext(req, res, cookies) {
  const token = cookies.bw_token;
  
  if (!token) {
    return res.status(401).json({ error: 'No autenticado - token no encontrado' });
  }

  try {
    console.log('[GetLeagueContext] Extracting league context');
    
    const accountResponse = await fetch(`${BIWENGER_BASE_URL}/api/v2/account`, {
      method: 'GET',
      headers: {
        ...getBaseHeaders(token),
        'Cookie': buildCookieString(cookies)
      }
    });

    if (accountResponse.ok) {
      const accountData = await accountResponse.json();
      const context = extractUserContext(accountData);
      
      if (context) {
        res.status(200).json({
          success: true,
          context: context,
          rawAccountData: accountData.data
        });
      } else {
        res.status(400).json({
          error: 'No se pudo extraer contexto de liga',
          accountData: accountData.data
        });
      }
    } else {
      const errorText = await accountResponse.text();
      res.status(accountResponse.status).json({ 
        error: `Error ${accountResponse.status}`,
        details: errorText
      });
    }
  } catch (error) {
    console.error('[GetLeagueContext Error]:', error);
    res.status(500).json({ 
      error: 'Error obteniendo contexto de liga',
      details: error.message
    });
  }
}

// Obtener mi equipo con formación y jugadores
async function handleGetMyTeam(req, res, cookies) {
  const token = cookies.bw_token;
  
  if (!token) {
    return res.status(401).json({ error: 'No autenticado - token no encontrado' });
  }

  try {
    console.log('[GetMyTeam] Fetching team data with correct context');
    
    // Primero obtener contexto de liga
    const accountResponse = await fetch(`${BIWENGER_BASE_URL}/api/v2/account`, {
      method: 'GET',
      headers: {
        ...getBaseHeaders(token),
        'Cookie': buildCookieString(cookies)
      }
    });

    if (!accountResponse.ok) {
      return res.status(accountResponse.status).json({ 
        error: 'No se pudo obtener contexto de usuario'
      });
    }

    const accountData = await accountResponse.json();
    const context = extractUserContext(accountData);
    
    if (!context) {
      return res.status(400).json({ 
        error: 'No se pudo extraer contexto de liga'
      });
    }
    
    console.log('[GetMyTeam] Using context:', { 
      leagueUserId: context.leagueUserId, 
      leagueId: context.leagueId 
    });
    
    // Intentar obtener datos del equipo desde diferentes endpoints
    const teamEndpoints = [
      `${BIWENGER_BASE_URL}/api/v2/league/${context.leagueId}/user/${context.leagueUserId}/team`,
      `${BIWENGER_BASE_URL}/api/v2/league/${context.leagueId}/user/${context.leagueUserId}`,
      `${BIWENGER_BASE_URL}/api/v2/league/${context.leagueId}/team`,
      `${BIWENGER_BASE_URL}/api/v2/user/${context.leagueUserId}/team`,
      `${BIWENGER_BASE_URL}/api/v2/team`,
      `${BIWENGER_BASE_URL}/api/v2/user/${context.leagueUserId}`,
      `${BIWENGER_BASE_URL}/api/v2/lineup`,
      `${BIWENGER_BASE_URL}/api/v2/league/${context.leagueId}/lineup`
    ];

    let teamData = null;
    let successfulEndpoint = null;

    for (const endpoint of teamEndpoints) {
      try {
        console.log(`[GetMyTeam] Trying endpoint: ${endpoint}`);
        
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            ...getBaseHeaders(token, context.leagueUserId, context.leagueId),
            'Cookie': buildCookieString(cookies)
          }
        });

        console.log(`[GetMyTeam] Response status for ${endpoint}: ${response.status}`);

        if (response.ok) {
          const data = await response.json();
          console.log(`[GetMyTeam] Success with endpoint: ${endpoint}`);
          teamData = data;
          successfulEndpoint = endpoint;
          break;
        } else {
          const errorText = await response.text();
          console.log(`[GetMyTeam] Error with ${endpoint}:`, errorText);
        }
      } catch (error) {
        console.log(`[GetMyTeam] Exception with ${endpoint}:`, error.message);
      }
    }

    if (teamData) {
      res.status(200).json({
        ...teamData,
        context: context,
        endpoint: successfulEndpoint,
        accountData: accountData.data,
        // DEBUG: Añadir información de todos los endpoints probados
        debugEndpoints: teamEndpoints,
        testedEndpoints: teamEndpoints.map(url => `Probado: ${url}`)
      });
    } else {
      // Si no se pudo obtener datos del equipo, devolver lo que tenemos del account
      res.status(200).json({
        message: 'No se pudieron obtener datos específicos del equipo, mostrando datos disponibles',
        context: context,
        accountData: accountData.data,
        attempted: teamEndpoints
      });
    }
  } catch (error) {
    console.error('[Get My Team Error]:', error);
    res.status(500).json({ 
      error: 'Error obteniendo datos del equipo',
      details: error.message
    });
  }
}

// Obtener datos del usuario con headers actualizados y contexto correcto
async function handleGetMyData(req, res, cookies) {
  const token = cookies.bw_token;
  
  if (!token) {
    return res.status(401).json({ error: 'No autenticado - token no encontrado' });
  }

  try {
    console.log('[GetMyData] Fetching user data with updated headers');
    
    // Primero obtener datos de account para extraer contexto
    const accountResponse = await fetch(`${BIWENGER_BASE_URL}/api/v2/account`, {
      method: 'GET',
      headers: {
        ...getBaseHeaders(token),
        'Cookie': buildCookieString(cookies)
      }
    });

    if (accountResponse.ok) {
      const accountData = await accountResponse.json();
      const context = extractUserContext(accountData);
      
      if (!context) {
        return res.status(200).json(accountData); // Devolver solo account si no hay contexto
      }
      
      // Intentar obtener más datos desde /api/v2/home con el contexto correcto
      try {
        const homeResponse = await fetch(`${BIWENGER_BASE_URL}/api/v2/home`, {
          method: 'GET',
          headers: {
            ...getBaseHeaders(token, context.leagueUserId, context.leagueId),
            'Cookie': buildCookieString(cookies)
          }
        });
        
        if (homeResponse.ok) {
          const homeData = await homeResponse.json();
          // Combinar datos de account y home
          res.status(200).json({
            account: accountData,
            home: homeData,
            context: context
          });
        } else {
          console.warn('[GetMyData] Home failed:', await homeResponse.text());
          res.status(200).json({
            account: accountData,
            context: context
          });
        }
      } catch (homeError) {
        console.warn('[GetMyData] Home endpoint failed:', homeError.message);
        res.status(200).json({
          account: accountData,
          context: context
        });
      }
    } else {
      const errorText = await accountResponse.text();
      console.error('[GetMyData] Error:', errorText);
      res.status(accountResponse.status).json({ 
        error: `Error ${accountResponse.status}`,
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

// Obtener mercado con headers actualizados y contexto correcto
async function handleGetMarket(req, res, cookies) {
  const token = cookies.bw_token;
  
  if (!token) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  try {
    console.log('[GetMarket] Fetching market data with correct context');
    
    // Primero obtener contexto de liga
    const accountResponse = await fetch(`${BIWENGER_BASE_URL}/api/v2/account`, {
      method: 'GET',
      headers: {
        ...getBaseHeaders(token),
        'Cookie': buildCookieString(cookies)
      }
    });

    if (!accountResponse.ok) {
      return res.status(accountResponse.status).json({ 
        error: 'No se pudo obtener contexto de usuario'
      });
    }

    const accountData = await accountResponse.json();
    const context = extractUserContext(accountData);
    
    if (!context) {
      return res.status(400).json({ 
        error: 'No se pudo extraer contexto de liga'
      });
    }
    
    console.log('[GetMarket] Using context:', { 
      leagueUserId: context.leagueUserId, 
      leagueId: context.leagueId 
    });
    
    const response = await fetch(`${BIWENGER_BASE_URL}/api/v2/market`, {
      method: 'GET',
      headers: {
        ...getBaseHeaders(token, context.leagueUserId, context.leagueId),
        'Cookie': buildCookieString(cookies)
      }
    });

    console.log('[GetMarket] Response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      res.status(200).json({
        ...data,
        context: context // Incluir contexto en la respuesta
      });
    } else {
      const errorText = await response.text();
      res.status(response.status).json({ 
        error: `Error ${response.status}`,
        details: errorText,
        context: context
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

// Función de debug actualizada
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

  // Extraer contexto completo del endpoint account
  let context = null;
  
  try {
    const accountResponse = await fetch(`${BIWENGER_BASE_URL}/api/v2/account`, {
      method: 'GET',
      headers: {
        ...getBaseHeaders(token),
        'Cookie': buildCookieString(cookies)
      }
    });
    
    if (accountResponse.ok) {
      const accountData = await accountResponse.json();
      context = extractUserContext(accountData);
      console.log('[Debug] Extracted context:', context);
    }
  } catch (error) {
    console.warn('[Debug] Could not extract context:', error.message);
  }
  
  debugInfo.extractedContext = context;

  // Probar endpoints con headers actualizados y contexto correcto
  const testEndpoints = [
    {
      url: `${BIWENGER_BASE_URL}/api/v2/account`,
      name: 'Account',
      method: 'GET',
      useContext: false
    },
    {
      url: `${BIWENGER_BASE_URL}/api/v2/home`,
      name: 'Home',
      method: 'GET',
      useContext: true
    },
    {
      url: `${BIWENGER_BASE_URL}/api/v2/market`,
      name: 'Market',
      method: 'GET',
      useContext: true
    },
    {
      url: `${BIWENGER_BASE_URL}/api/v2/user/${context?.leagueUserId}/leagues`,
      name: 'User Leagues (with League User ID)',
      method: 'GET',
      useContext: true
    }
  ];

  for (const endpoint of testEndpoints) {
    try {
      const fetchOptions = {
        method: endpoint.method || 'GET',
        headers: {
          ...getBaseHeaders(
            token, 
            endpoint.useContext && context ? context.leagueUserId : null,
            endpoint.useContext && context ? context.leagueId : null
          ),
          'Cookie': buildCookieString(cookies)
        }
      };
      
      if (endpoint.body) {
        fetchOptions.body = endpoint.body;
      }
      
      const response = await fetch(endpoint.url, fetchOptions);

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
        ...getBaseHeaders(token, cookies.bw_user),
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