exports.handler = async (event, context) => {
  const cookies = {};
  if (event.headers.cookie) {
    event.headers.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) cookies[name] = value;
    });
  }

  const token = cookies.bw_token;
  
  if (!token) {
    return {
      statusCode: 401,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'No token found', cookies }),
    };
  }

  try {
    const response = await fetch('https://biwenger.as.com/api/v2/account', {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });

    const data = response.ok ? await response.json() : await response.text();

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: response.status, data }, null, 2),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};