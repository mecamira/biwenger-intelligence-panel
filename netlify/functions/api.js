// Función API para Biwenger Intelligence Panel
// Compatible con Netlify Functions (Node.js 18+)

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
exports.handler = async (event, context) => {
  console.log(`[API] ${event.httpMethod} ${event.path}`);

  // Manejar CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
      body: '',
    };
  }

  const path = event.path.replace('/.netlify/functions/api', '');
  const method = event.httpMethod;
  
  let body = null;
  if (event.body) {
    try {
      body = JSON.parse(event.body);
    } catch (error) {
      console.error('[JSON Parse Error]:', error);
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Invalid JSON in request body' }),
      };
    }
  }
  
  // Obtener cookies existentes
  const cookies = parseCookies(event.headers.cookie);
  
  console.log(`[API Proxy] Processing ${method} ${path}`);

  try {
    switch (path) {
      case '/login':
        return await handleLogin(body);
        
      case '/me':
        return await handleGetMyData(cookies);
        
      case '/players':
        return await handleGetPlayers();
        
      case '/market':
        return await handleGetMarket(cookies);
        
      case '/user':
        const userId = event.queryStringParameters?.id;
        return await handleGetUser(cookies, userId);
        
      default:
        return {
          statusCode: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ error: `Endpoint ${path} no encontrado` }),
        };
    }
  } catch (error) {
    console.error('[API Error]:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Error interno del servidor',
        details: error.message,
        path: path
      }),
    };
  }
};

// Manejar login
async function handleLogin(body) {
  console.log('[Login] Starting login process');
  
  if (!body || !body.email || !body.password) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Email y contraseña requeridos' }),
    };
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
      
      return {
        statusCode: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          error: 'Credenciales inválidas',
          details: `HTTP ${loginResponse.status}`,
          response: errorText
        }),
      };
    }

    const loginData = await loginResponse.json();
    console.log('[Login] Login successful, token received');
    
    // Extraer token y datos del usuario
    const token = loginData.token;
    const userData = loginData.user;
    
    if (!token) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'No se recibió token de autenticación' }),
      };
    }

    // Configurar cookie segura para el token
    const cookieOptions = [
      `bw_token=${token}`,
      'HttpOnly',
      'Secure',
      'SameSite=Strict',
      'Max-Age=86400', // 24 horas
      'Path=/'
    ].join('; ');

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Set-Cookie': cookieOptions,
      },
      body: JSON.stringify({
        success: true,
        user: {
          id: userData?.id,
          name: userData?.name,
          email: userData?.email
        }
      }),
    };
  } catch (error) {
    console.error('[Login Error]:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Error en el proceso de login',
        details: error.message
      }),
    };
  }
}

// Obtener datos del usuario actual
async function handleGetMyData(cookies) {
  const token = cookies.bw_token;
  
  if (!token) {
    return {
      statusCode: 401,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'No autenticado - token no encontrado' }),
    };
  }

  try {
    console.log('[GetMyData] Fetching user data');
    
    const response = await fetch(`${BIWENGER_BASE_URL}/api/v2/home`, {
      method: 'GET',
      headers: {
        ...getBaseHeaders(),
        'Authorization': `Bearer ${token}`,
        'x-league': 'la-liga',
        'x-user': cookies.bw_user || '',
        'x-version': '1.0'
      },
    });

    console.log('[GetMyData] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[GetMyData] Error:', errorText);
    }

    const data = await response.json();
    
    return {
      statusCode: response.ok ? 200 : response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('[Get My Data Error]:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Error obteniendo datos del usuario',
        details: error.message
      }),
    };
  }
}

// Obtener datos globales de jugadores
async function handleGetPlayers() {
  try {
    console.log('[GetPlayers] Fetching players data');
    
    const response = await fetch(`${BIWENGER_API_URL}/api/v2/competitions/la-liga/data?lang=es&score=1`, {
      method: 'GET',
      headers: getBaseHeaders(),
    });

    console.log('[GetPlayers] Response status:', response.status);

    const data = await response.json();
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('[Get Players Error]:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Error obteniendo datos de jugadores',
        details: error.message
      }),
    };
  }
}

// Obtener mercado
async function handleGetMarket(cookies) {
  const token = cookies.bw_token;
  
  if (!token) {
    return {
      statusCode: 401,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'No autenticado' }),
    };
  }

  try {
    console.log('[GetMarket] Fetching market data');
    
    const response = await fetch(`${BIWENGER_BASE_URL}/api/v2/market`, {
      method: 'GET',
      headers: {
        ...getBaseHeaders(),
        'Authorization': `Bearer ${token}`,
        'x-league': 'la-liga',
        'x-user': cookies.bw_user || '',
        'x-version': '1.0'
      },
    });

    console.log('[GetMarket] Response status:', response.status);

    const data = await response.json();
    
    return {
      statusCode: response.ok ? 200 : response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('[Get Market Error]:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Error obteniendo datos del mercado',
        details: error.message
      }),
    };
  }
}

// Obtener datos de un usuario específico
async function handleGetUser(cookies, userId) {
  const token = cookies.bw_token;
  
  if (!token) {
    return {
      statusCode: 401,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'No autenticado' }),
    };
  }

  if (!userId) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'ID de usuario requerido' }),
    };
  }

  try {
    console.log('[GetUser] Fetching user data for ID:', userId);
    
    const response = await fetch(`${BIWENGER_BASE_URL}/api/v2/user/${userId}`, {
      method: 'GET',
      headers: {
        ...getBaseHeaders(),
        'Authorization': `Bearer ${token}`,
        'x-league': 'la-liga',
        'x-user': cookies.bw_user || '',
        'x-version': '1.0'
      },
    });

    console.log('[GetUser] Response status:', response.status);

    const data = await response.json();
    
    return {
      statusCode: response.ok ? 200 : response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('[Get User Error]:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Error obteniendo datos del usuario',
        details: error.message
      }),
    };
  }
}