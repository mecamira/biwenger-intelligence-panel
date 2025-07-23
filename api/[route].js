// Función API para Biwenger Intelligence Panel - Vercel
// Compatible con Vercel Edge Runtime

// Configuración de endpoints de Biwenger
const BIWENGER_BASE_URL = 'https://biwenger.as.com';
const BIWENGER_API_URL = 'https://cf.biwenger.com';

// Headers base para todas las peticiones
const getBaseHeaders = () => ({
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
  'Origin': 'https://biwenger.as.com',
  'Referer': 'https://biwenger.as.com/'
});

// Función para manejar cookies de sesión
const parseCookies = (cookieHeader) => {
  const cookies = {};
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = value;
      }
    });
  }
  return cookies;
};

// Función principal del proxy
export default async function handler(req, res) {
  console.log(`[API] ${req.method} ${req.url}`);

  // Manejar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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
        
      default:
        res.status(404).json({ error: `Endpoint ${path} no encontrado` });
    }
  } catch (error) {
    console.error('[API Error]:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message,
      path: path
    });
  }
}

// Manejar login
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

    // Obtener información de contexto del usuario
    let userContext = {};
    try {
      const contextResponse = await fetch(`${BIWENGER_BASE_URL}/api/v2/home`, {
        method: 'GET',
        headers: {
          ...getBaseHeaders(),
          'Authorization': `Bearer ${token}`,
          'x-league': 'la-liga',
          'x-user': userData?.id || '',
          'x-version': '2.0',
          'x-lang': 'es'
        },
      });

      if (contextResponse.ok) {
        const contextData = await contextResponse.json();
        console.log('[Login] Context data received:', JSON.stringify(contextData, null, 2));
        
        // Extraer información de contexto
        if (contextData.data && contextData.data.user) {
          userContext.userId = contextData.data.user.id;
          userContext.userName = contextData.data.user.name;
        }
        
        // Buscar información de liga
        if (contextData.data && contextData.data.leagues && contextData.data.leagues.length > 0) {
          const league = contextData.data.leagues[0]; // Tomar la primera liga
          userContext.leagueId = league.id;
          userContext.leagueName = league.name;
          userContext.leagueSlug = league.slug || 'la-liga';
        }
      }
    } catch (contextError) {
      console.warn('[Login] Could not get context data:', contextError);
      // Usar valores por defecto
      userContext = {
        userId: userData?.id || '',
        leagueSlug: 'la-liga'
      };
    }

    // Configurar cookies seguras (mejor manejo en Vercel)
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 86400,
      path: '/'
    };

    // Setear múltiples cookies
    res.setHeader('Set-Cookie', [
      `bw_token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400; Path=/`,
      `bw_user=${userContext.userId || ''}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400; Path=/`,
      `bw_league=${userContext.leagueSlug || 'la-liga'}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400; Path=/`
    ]);

    res.status(200).json({
      success: true,
      user: {
        id: userData?.id,
        name: userData?.name,
        email: userData?.email,
        context: userContext
      }
    });
  } catch (error) {
    console.error('[Login Error]:', error);
    res.status(500).json({ 
      error: 'Error en el proceso de login',
      details: error.message
    });
  }
}

// Obtener datos del usuario actual
async function handleGetMyData(req, res, cookies) {
  const token = cookies.bw_token;
  const userId = cookies.bw_user;
  const leagueSlug = cookies.bw_league || 'la-liga';
  
  if (!token) {
    return res.status(401).json({ error: 'No autenticado - token no encontrado' });
  }

  try {
    console.log('[GetMyData] Fetching user data with context:', { userId, leagueSlug });
    
    // Probar múltiples endpoints para obtener datos
    const endpoints = [
      `${BIWENGER_BASE_URL}/api/v2/home`,
      `${BIWENGER_BASE_URL}/api/v2/user/${userId}`,
      `${BIWENGER_BASE_URL}/api/v2/account`
    ];

    let successfulResponse = null;
    
    for (const endpoint of endpoints) {
      try {
        console.log('[GetMyData] Trying endpoint:', endpoint);
        
        const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
            ...getBaseHeaders(),
            'Authorization': `Bearer ${token}`,
            'x-league': 'la-liga',
            'x-user': cookies.bw_user || '',
            'x-version': '2.0',
            'x-lang': 'es'
        },
        });

        console.log('[GetMyData] Response status for', endpoint, ':', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('[GetMyData] Success with endpoint:', endpoint);
          successfulResponse = data;
          break;
        } else {
          console.log('[GetMyData] Error with endpoint:', endpoint, 'Status:', response.status);
        }
      } catch (endpointError) {
        console.log('[GetMyData] Exception with endpoint:', endpoint, endpointError.message);
      }
    }

    if (successfulResponse) {
      res.status(200).json(successfulResponse);
    } else {
      res.status(500).json({ 
        error: 'No se pudieron obtener datos del usuario desde ningún endpoint',
        attempted: endpoints
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

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('[Get Players Error]:', error);
    res.status(500).json({ 
      error: 'Error obteniendo datos de jugadores',
      details: error.message
    });
  }
}

// Obtener mercado
async function handleGetMarket(req, res, cookies) {
  const token = cookies.bw_token;
  const userId = cookies.bw_user;
  const leagueSlug = cookies.bw_league || 'la-liga';
  
  if (!token) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  try {
    console.log('[GetMarket] Fetching market data');
    
    const response = await fetch(`${BIWENGER_BASE_URL}/api/v2/market`, {
      method: 'GET',
      headers: {
        ...getBaseHeaders(),
        'Authorization': `Bearer ${token}`,
        'x-league': leagueSlug,
        'x-user': userId,
        'x-version': '2.0',
        'x-lang': 'es'
      },
    });

    console.log('[GetMarket] Response status:', response.status);

    const data = await response.json();
    res.status(response.ok ? 200 : response.status).json(data);
  } catch (error) {
    console.error('[Get Market Error]:', error);
    res.status(500).json({ 
      error: 'Error obteniendo datos del mercado',
      details: error.message
    });
  }
}

// Función de debug para encontrar ligas
async function handleDebugLeagues(req, res, cookies) {
  const token = cookies.bw_token;
  
  if (!token) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  const debugInfo = {
    cookies: cookies,
    endpoints: []
  };

  // Probar múltiples endpoints para encontrar información de ligas
  const testEndpoints = [
    `${BIWENGER_BASE_URL}/api/v2/account`,
    `${BIWENGER_BASE_URL}/api/v2/home`,
    `${BIWENGER_BASE_URL}/api/v2/leagues`,
    `${BIWENGER_BASE_URL}/api/v2/user/leagues`
  ];

  for (const endpoint of testEndpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
            ...getBaseHeaders(),
            'Authorization': `Bearer ${token}`,
            'x-league': 'la-liga',
            'x-user': cookies.bw_user || '',
            'x-version': '2.0',
            'x-lang': 'es'
        },
      });

      const result = {
        endpoint: endpoint,
        status: response.status,
        ok: response.ok,
        data: null
      };

      if (response.ok) {
        result.data = await response.json();
      } else {
        result.error = `HTTP ${response.status}`;
      }

      debugInfo.endpoints.push(result);
    } catch (error) {
      debugInfo.endpoints.push({
        endpoint: endpoint,
        error: error.message
      });
    }
  }

  res.status(200).json(debugInfo);
}

// Función de investigación
async function handleInvestigate(req, res, cookies) {
  const token = cookies.bw_token;
  
  if (!token) {
    return res.status(200).json({ 
      error: 'No token - login first',
      cookies: Object.keys(cookies)
    });
  }

  try {
    const response = await fetch('https://biwenger.as.com/api/v2/account', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-version': '2.0',
        'x-lang': 'es'
      }
    });

    let data;
    if (response.ok) {
      data = await response.json();
    } else {
      data = { 
        error: 'Response not OK', 
        status: response.status,
        statusText: response.statusText 
      };
    }

    res.status(200).json({ 
      status: response.status,
      data: data,
      tokenLength: token.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}