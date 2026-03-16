const discoveryRepository = require('../repositories/discovery.repository');
const interactionRepository = require('../repositories/interaction.repository');
const matchService = require('./match.service'); 

const getFeed = async (userId, page = 1) => {
    const limit = 10;
    const offset = (page - 1) * limit;
    
    const recommendations = await discoveryRepository.findRecommendations(userId, limit, offset);
    return recommendations;
};

module.exports = {
    getFeed
};
