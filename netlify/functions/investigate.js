// Función de investigación detallada para Biwenger
exports.handler = async (event, context) => {
  console.log('[INVESTIGATE] Starting investigation...');
  
  // Headers CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  const investigation = {
    timestamp: new Date().toISOString(),
    step: 1,
    results: []
  };

  try {
    // PASO 1: Revisar cookies disponibles
    investigation.step = 1;
    investigation.results.push({
      step: 1,
      action: 'Check cookies',
      rawCookies: event.headers.cookie || 'No cookies found'
    });

    const cookies = {};
    if (event.headers.cookie) {
      event.headers.cookie.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name && value) cookies[name] = decodeURIComponent(value);
      });
    }

    investigation.results.push({
      step: 1.1,
      action: 'Parsed cookies',
      cookies: cookies,
      hasToken: !!cookies.bw_token,
      tokenLength: cookies.bw_token ? cookies.bw_token.length : 0
    });

    const token = cookies.bw_token;
    if (!token) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          ...investigation,
          error: 'No token found - need to login first',
          instruction: 'Login first at your app, then visit this URL again'
        }, null, 2)
      };
    }

    // PASO 2: Probar login directo con credenciales de prueba
    investigation.step = 2;
    investigation.results.push({
      step: 2,
      action: 'Testing token validity',
      tokenStart: token.substring(0, 20) + '...'
    });

    // PASO 3: Probar endpoints uno por uno con logging detallado
    const endpoints = [
      '/api/v2/account',
      '/api/v2/home', 
      '/api/v2/leagues',
      '/api/v2/user/me',
      '/api/v2/competitions',
      '/api/v2/user'
    ];

    for (const endpoint of endpoints) {
      investigation.step = 3;
      const endpointTest = {
        step: 3,
        endpoint: endpoint,
        fullUrl: `https://biwenger.as.com${endpoint}`
      };

      try {
        const response = await fetch(`https://biwenger.as.com${endpoint}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json, text/plain, */*',
          },
        });

        endpointTest.status = response.status;
        endpointTest.ok = response.ok;
        endpointTest.headers = Object.fromEntries(response.headers);

        if (response.ok) {
          try {
            const data = await response.json();
            endpointTest.dataType = 'json';
            endpointTest.dataKeys = Object.keys(data);
            endpointTest.hasData = !!data.data;
            
            // Si encontramos datos de usuario o ligas, guardar estructura
            if (data.data) {
              endpointTest.dataStructure = {
                hasUser: !!data.data.user,
                hasLeagues: !!data.data.leagues,
                hasLeague: !!data.data.league,
                userKeys: data.data.user ? Object.keys(data.data.user) : null,
                leaguesCount: data.data.leagues ? data.data.leagues.length : 0,
                leagueKeys: data.data.league ? Object.keys(data.data.league) : null
              };

              // Si hay ligas, extraer información básica
              if (data.data.leagues && data.data.leagues.length > 0) {
                endpointTest.leaguesInfo = data.data.leagues.map(league => ({
                  id: league.id,
                  name: league.name,
                  slug: league.slug,
                  status: league.status,
                  type: league.type
                }));
              }

              // Si hay league singular, extraer info
              if (data.data.league) {
                endpointTest.leagueInfo = {
                  id: data.data.league.id,
                  name: data.data.league.name,
                  slug: data.data.league.slug,
                  status: data.data.league.status
                };
              }

              // Si hay usuario, extraer info básica
              if (data.data.user) {
                endpointTest.userInfo = {
                  id: data.data.user.id,
                  name: data.data.user.name,
                  hasLeagues: !!data.data.user.leagues
                };
              }
            }
          } catch (jsonError) {
            const textData = await response.text();
            endpointTest.dataType = 'text';
            endpointTest.dataLength = textData.length;
            endpointTest.dataPreview = textData.substring(0, 200) + '...';
          }
        } else {
          // Para errores, intentar obtener el texto del error
          try {
            const errorText = await response.text();
            endpointTest.errorText = errorText;
          } catch (err) {
            endpointTest.errorText = 'Could not read error response';
          }
        }
      } catch (error) {
        endpointTest.error = error.message;
        endpointTest.errorType = error.name;
      }

      investigation.results.push(endpointTest);
    }

    // PASO 4: Probar con headers adicionales si tenemos información de liga
    investigation.step = 4;
    const successfulEndpoints = investigation.results.filter(r => r.ok && r.step === 3);
    
    if (successfulEndpoints.length > 0) {
      const bestEndpoint = successfulEndpoints[0];
      investigation.results.push({
        step: 4,
        action: 'Found working endpoint',
        endpoint: bestEndpoint.endpoint,
        recommendedNext: 'Use this endpoint for /me calls'
      });

      // Si encontramos información de liga, probar con headers específicos
      if (bestEndpoint.leaguesInfo && bestEndpoint.leaguesInfo.length > 0) {
        const firstLeague = bestEndpoint.leaguesInfo[0];
        
        const headerTest = {
          step: 4.1,
          action: 'Testing with league headers',
          leagueUsed: firstLeague
        };

        try {
          const response = await fetch(`https://biwenger.as.com/api/v2/home`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'x-league': firstLeague.slug || firstLeague.id,
              'x-user': bestEndpoint.userInfo?.id || '',
              'x-version': '1.0',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
          });

          headerTest.status = response.status;
          headerTest.ok = response.ok;

          if (response.ok) {
            const data = await response.json();
            headerTest.success = true;
            headerTest.dataKeys = Object.keys(data);
            headerTest.hasTeam = !!(data.data && data.data.team);
            headerTest.hasAccount = !!(data.data && data.data.account);
          }
        } catch (error) {
          headerTest.error = error.message;
        }

        investigation.results.push(headerTest);
      }
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(investigation, null, 2)
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        ...investigation,
        error: error.message,
        stack: error.stack
      }, null, 2)
    };
  }
};