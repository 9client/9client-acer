class RccNotConfiguredError extends Error {
    constructor() {
        super(
            "rcc not configured"
        );
        this.name = "RccNotConfiguredError";
        this.code = "RCC_NOT_CONFIGURED";
    }
}

class RccAdapter {
    async start_server(session) {
        throw new RccNotConfiguredError();
    }

    async get_server_status(job) {
        throw new RccNotConfiguredError();
    }

    async stop_server(job) {
        throw new RccNotConfiguredError();
    }

    async close() {}
}

module.exports = {
    RccAdapter,
    RccNotConfiguredError
};