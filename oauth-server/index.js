const express = require('express');
const axios = require("axios");
const cors = require("cors");
const app = express();
require("dotenv").config();

app.use(cors());

const PORT = process.env.PORT || 4000;

app.get('/', (req, res) => {
  res.send(`<h1>Welcome to OAuth API Server.</h1>`);
});

app.get("/auth/github", (req, res) => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user,repo,security_events`;
    res.redirect(githubAuthUrl);
});

app.get("/auth/github/callback", async (req, res) => {
    const { code } = req.query;
    console.log("GitHub Authorization Code:", code);

    try {
        const tokenResponse = await axios.post(
            "https://github.com/login/oauth/access_token",
            {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
            },
            { headers: { Accept: "application/json" } }
        );
        const accessToken = tokenResponse.data.access_token;
        console.log("Access Token:", accessToken);

        res.cookie("access_token", accessToken);
        return res.redirect(`${process.env.FRONTEND_URL}/v1/profile/github`);
    } catch (error) {
        console.error("Error during token exchange:", error);
        res.status(500).json(error);
    }
});

app.listen(PORT, () => {
  console.log('Server is running on port:', PORT);
});
