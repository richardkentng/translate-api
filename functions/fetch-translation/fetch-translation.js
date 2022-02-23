// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method

const axios = require("axios");

const handler = async (event) => {
  try {
    const requestOptions = {
      method: "GET",
      url: "https://nlp-translation.p.rapidapi.com/v1/translate",
      params: event.queryStringParameters,
      headers: {
        "x-rapidapi-host": "nlp-translation.p.rapidapi.com",
        "x-rapidapi-key": process.env.API_SECRET,
      },
    };

    const { data } = await axios.request(requestOptions);
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    };
  }
};

module.exports = { handler };
