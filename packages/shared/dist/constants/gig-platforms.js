"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GIG_PLATFORMS = void 0;
exports.getPlatformById = getPlatformById;
exports.getPlatformsByType = getPlatformsByType;
exports.getSupportedPlatformIds = getSupportedPlatformIds;
const financial_profile_1 = require("../types/financial-profile");
/** All supported gig platforms */
exports.GIG_PLATFORMS = [
    { id: 'uber', name: 'Uber', type: financial_profile_1.PlatformType.GIG_RIDESHARE, logo_url: '/platforms/uber.svg', supported: true },
    { id: 'lyft', name: 'Lyft', type: financial_profile_1.PlatformType.GIG_RIDESHARE, logo_url: '/platforms/lyft.svg', supported: true },
    { id: 'doordash', name: 'DoorDash', type: financial_profile_1.PlatformType.GIG_DELIVERY, logo_url: '/platforms/doordash.svg', supported: true },
    { id: 'grubhub', name: 'Grubhub', type: financial_profile_1.PlatformType.GIG_DELIVERY, logo_url: '/platforms/grubhub.svg', supported: true },
    { id: 'instacart', name: 'Instacart', type: financial_profile_1.PlatformType.GIG_DELIVERY, logo_url: '/platforms/instacart.svg', supported: true },
    { id: 'amazon-flex', name: 'Amazon Flex', type: financial_profile_1.PlatformType.GIG_DELIVERY, logo_url: '/platforms/amazon-flex.svg', supported: true },
    { id: 'shipt', name: 'Shipt', type: financial_profile_1.PlatformType.GIG_DELIVERY, logo_url: '/platforms/shipt.svg', supported: true },
    { id: 'postmates', name: 'Postmates', type: financial_profile_1.PlatformType.GIG_DELIVERY, logo_url: '/platforms/postmates.svg', supported: true },
    { id: 'uber-eats', name: 'Uber Eats', type: financial_profile_1.PlatformType.GIG_DELIVERY, logo_url: '/platforms/uber-eats.svg', supported: true },
    { id: 'upwork', name: 'Upwork', type: financial_profile_1.PlatformType.GIG_FREELANCE, logo_url: '/platforms/upwork.svg', supported: true },
    { id: 'fiverr', name: 'Fiverr', type: financial_profile_1.PlatformType.GIG_FREELANCE, logo_url: '/platforms/fiverr.svg', supported: true },
    { id: 'toptal', name: 'Toptal', type: financial_profile_1.PlatformType.GIG_FREELANCE, logo_url: '/platforms/toptal.svg', supported: true },
    { id: 'freelancer', name: 'Freelancer.com', type: financial_profile_1.PlatformType.GIG_FREELANCE, logo_url: '/platforms/freelancer.svg', supported: true },
    { id: 'etsy', name: 'Etsy', type: financial_profile_1.PlatformType.GIG_MARKETPLACE, logo_url: '/platforms/etsy.svg', supported: true },
    { id: 'ebay', name: 'eBay', type: financial_profile_1.PlatformType.GIG_MARKETPLACE, logo_url: '/platforms/ebay.svg', supported: true },
    { id: 'amazon-seller', name: 'Amazon Seller', type: financial_profile_1.PlatformType.GIG_MARKETPLACE, logo_url: '/platforms/amazon-seller.svg', supported: true },
    { id: 'shopify', name: 'Shopify', type: financial_profile_1.PlatformType.GIG_MARKETPLACE, logo_url: '/platforms/shopify.svg', supported: true },
    { id: 'taskrabbit', name: 'TaskRabbit', type: financial_profile_1.PlatformType.GIG_FREELANCE, logo_url: '/platforms/taskrabbit.svg', supported: true },
];
/** Get platform by ID */
function getPlatformById(id) {
    return exports.GIG_PLATFORMS.find((p) => p.id === id);
}
/** Get platforms by type */
function getPlatformsByType(type) {
    return exports.GIG_PLATFORMS.filter((p) => p.type === type);
}
/** Get all supported platform IDs */
function getSupportedPlatformIds() {
    return exports.GIG_PLATFORMS.filter((p) => p.supported).map((p) => p.id);
}
//# sourceMappingURL=gig-platforms.js.map