require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const qs = require("qs");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/auth", async (req, res) => {
  const { code } = req.body;

  try {
    const tokenResp = await axios.post(
      "https://accounts.spotify.com/api/token",
      qs.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.REDIRECT_URI
      }),
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET
            ).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    res.json(tokenResp.data);
  } catch (err) {
    console.log("Erro ao obter token:", err.response?.data || err);
    res.status(500).json({ error: "Erro ao trocar code" });
  }
});

app.listen(3001, () =>
  console.log("Servidor Spotify rodando na porta 3001")
);
