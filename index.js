const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.text({ type: 'text/plain' }));

app.post("/proxy", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send("Missing ?url parameter");

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req.body)
    });

    const text = await response.text();
    res.status(response.status).send(text);
  } catch (error) {
    res.status(500).send("Proxy error: " + error.message);
  }
});

app.post("/wa-click", async (req, res) => {
  try {
    const payload = (typeof req.body === 'string') ? JSON.parse(req.body) : (req.body || {});
    const endpoint = process.env.SHEET_ENDPOINT; 
    const token = process.env.SHEET_TOKEN;       

    if (!endpoint || !token) {
      return res.status(500).send("Missing SHEET_ENDPOINT or SHEET_TOKEN env vars");
    }

    const url = endpoint + (endpoint.includes("?") ? "&" : "?") + "token=" + encodeURIComponent(token);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Auth-Token": token },
      body: JSON.stringify(req.body)
    });

    // Forward status back to client
    const txt = await response.text();
    res.status(response.status).send(txt);
  } catch (err) {
    res.status(500).send("Forward error: " + err.message);
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
