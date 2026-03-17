const discoveryRepository = require('../repositories/discovery.repository');
<<<<<<< HEAD
const interactionRepository = require('../repositories/interaction.repository');
const matchService = require('./match.service');

=======
>>>>>>> 7cf74c9 (swagger and media upload done)
const getFeed = async (userId, page = 1) => {
    const limit = 10;
    const offset = (page - 1) * limit;

    const recommendations = await discoveryRepository.findRecommendations(userId, limit, offset);
    return recommendations;
};

module.exports = {
    getFeed
};
