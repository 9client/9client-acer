const { randomUUID, randomBytes } = require("node:crypto");

const sessions = new Map();
const SESSION_LIFETIME_MS = 1800000;
const TICKET_LIFETIME_MS = 120000;

function create_session(placeId) {
    const session = {
        id: randomUUID(),
        place_id,
        status: "allocating",
        created: new Date().toISOString(),
        expires: Date.now() + SESSION_LIFETIME_MS,
        ticket: null,
        ticket_expires: null,
        join: null,
        error: null
    };

    sessions.set(session.id, session);

    return session;
}

function get_session_from_ticket(ticket) {
    if (typeof ticket !== "string") return null;

    for (const session of sessions.values()) {
        if (session.ticket !== ticket) continue;

        if (!session.ticketExpiresAt || Date.now() >= session.ticketExpiresAt) {
            session.ticket = null;
            session.ticketExpiresAt = null;
            return null;
        }

        return session;
    }

    return null;
}

function get_session(session_id) {
    const session = sessions.get(session_id);

    if (!session) return null;

    if (Date.now() >= session.expires) {
        sessions.delete(session_id);
        return null;
    }

    return session;
}

function update_session(session_id, updates) {
    const session = get_session(session_id);

    if (!session) return null;

    Object.assign(session, updates);
    return session;
}


function mark_ready(session_id, job) {
    const session = get_session(session_id);
    if (!session) return null;

    session.status = "ready";
    session.job = job;
    session.ticket = randomBytes(32).toString("hex");
    session.ticket_expires = Date.now() + TICKET_LIFETIME_MS;
    session.error = null;

    return session;
}

module.exports = {
    create_session,
    get_session,
    get_session_from_ticket,
    update_session,
    mark_ready,
};