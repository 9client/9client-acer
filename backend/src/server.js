const express = require("express");
const { RccAdapter } = require("./services/rcc_adapter");
const create_games_router = require("./routes/games");

const app = express();
const PORT = process.env.PORT || 9001; // this is my port. do you like it?

const rcc = new RccAdapter();

app.use(express.json());

app.use("/api/games", create_games_router({ rcc }));

app.get("/health", (req, res) => {
    res.json({
        status: "ok",
    });
});

const server = app.listen(PORT, "127.0.0.1", () => {
    console.log(`api listening on http://127.0.0.1:${PORT}`);
});

async function shutdown() {
    server.close(async() => {
        try {
            await rcc.close();
        } finally {
            process.exit(0);
        }
    });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);