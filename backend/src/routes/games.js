const express = require("express");
const { create_session, get_session, get_session_from_ticket, update_session } = require("../services/session_manager");

function create_games_router({ rcc }) {
    const router = express.Router();

    router.post("/:place_id/join", async(req, res) => {
        const place_id = req.params.place_id;

        if (!/^\d+$/.test(place_id)) {
            return res.status(400).json({
                error: "invalid place id"
            });
        }

        const session = create_session(place_id);

        try {
            const job = await rcc.start_server(session);

            update_session(session.id, {
                status: "starting",
                job
            });

            return res.status(202).json({
                session_id: session.id,
                status: "starting"
            });
        } catch (error) {
            update_session(session.id, {
                status: "failed",
                error: error.code || "RCC_START_FAILED"
            });

            const not_configured = error.code === "RCC_NOT_CONFIGURED";

            return res.status(not_configured ? 503 : 502).json({
                session_id: session.id,
                status: "failed",
                error: not_configured ?
                    "rcc not configured" : "rcc start failed"
            });
        }
    });

    router.get("/sessions/:session_id", (req, res) => {
        const session = get_session(req.params.session_id);

        if (!session) {
            return res.status(404).json({
                error: "session not found"
            });
        }

        return res.json({
            session_id: session.id,
            place_id: session.place_id,
            status: session.status,
            error: session.error
        });
    });

    router.get("/joins/:ticket", (req, res) => {
        const session = get_session_from_ticket(req.params.ticket);

        if (!session || session.status !== "ready") {
            return res.status(404).json({
                error: "invalid or expired ticket"
            });
        }

        return res.status(501).json({
            error: "im gay"
        });
    });

    return router;
}

module.exports = create_games_router;