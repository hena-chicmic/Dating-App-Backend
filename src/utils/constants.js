module.exports = {
    DISCOVERY: {
        NEARBY_RADIUS_KM: 15,
        MAX_DISTANCE_KM: 2000,
        DEFAULT_PAGE_SIZE: 10,
        AGE_FUDGE_FACTOR: 5 // Search +/- 5 years from preferred range
    },
    AUTH: {
        OTP_EXPIRY_MINUTES: 15,
        PASSWORD_RESET_ATTEMPTS: 5,
        REFRESH_TOKEN_EXPIRY_DAYS: 7
    },
    CACHE: {
        FEED_TTL_SECONDS: 120
    }
};
