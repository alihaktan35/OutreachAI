// Netlify Function: Proxy for n8n send-mail webhook

const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Parse the incoming request body
    const requestBody = JSON.parse(event.body);

    // Forward the request to n8n
    const n8nUrl = 'http://16.171.174.159:5678/webhook/send-mail';

    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      timeout: 60000 // 60 second timeout for sending emails
    });

    // Get the response from n8n
    const data = await response.json();

    // Return the response
    return {
      statusCode: response.status,
      headers,
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('Error proxying to n8n:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to send email',
        message: error.message
      })
    };
  }
};
