import { PlatformType } from '../types/financial-profile';

/** Gig platform definition */
export interface GigPlatform {
  id: string;
  name: string;
  type: PlatformType;
  logo_url: string;
  supported: boolean;
}

/** All supported gig platforms */
export const GIG_PLATFORMS: readonly GigPlatform[] = [
  { id: 'uber', name: 'Uber', type: PlatformType.GIG_RIDESHARE, logo_url: '/platforms/uber.svg', supported: true },
  { id: 'lyft', name: 'Lyft', type: PlatformType.GIG_RIDESHARE, logo_url: '/platforms/lyft.svg', supported: true },
  { id: 'doordash', name: 'DoorDash', type: PlatformType.GIG_DELIVERY, logo_url: '/platforms/doordash.svg', supported: true },
  { id: 'grubhub', name: 'Grubhub', type: PlatformType.GIG_DELIVERY, logo_url: '/platforms/grubhub.svg', supported: true },
  { id: 'instacart', name: 'Instacart', type: PlatformType.GIG_DELIVERY, logo_url: '/platforms/instacart.svg', supported: true },
  { id: 'amazon-flex', name: 'Amazon Flex', type: PlatformType.GIG_DELIVERY, logo_url: '/platforms/amazon-flex.svg', supported: true },
  { id: 'shipt', name: 'Shipt', type: PlatformType.GIG_DELIVERY, logo_url: '/platforms/shipt.svg', supported: true },
  { id: 'postmates', name: 'Postmates', type: PlatformType.GIG_DELIVERY, logo_url: '/platforms/postmates.svg', supported: true },
  { id: 'uber-eats', name: 'Uber Eats', type: PlatformType.GIG_DELIVERY, logo_url: '/platforms/uber-eats.svg', supported: true },
  { id: 'upwork', name: 'Upwork', type: PlatformType.GIG_FREELANCE, logo_url: '/platforms/upwork.svg', supported: true },
  { id: 'fiverr', name: 'Fiverr', type: PlatformType.GIG_FREELANCE, logo_url: '/platforms/fiverr.svg', supported: true },
  { id: 'toptal', name: 'Toptal', type: PlatformType.GIG_FREELANCE, logo_url: '/platforms/toptal.svg', supported: true },
  { id: 'freelancer', name: 'Freelancer.com', type: PlatformType.GIG_FREELANCE, logo_url: '/platforms/freelancer.svg', supported: true },
  { id: 'etsy', name: 'Etsy', type: PlatformType.GIG_MARKETPLACE, logo_url: '/platforms/etsy.svg', supported: true },
  { id: 'ebay', name: 'eBay', type: PlatformType.GIG_MARKETPLACE, logo_url: '/platforms/ebay.svg', supported: true },
  { id: 'amazon-seller', name: 'Amazon Seller', type: PlatformType.GIG_MARKETPLACE, logo_url: '/platforms/amazon-seller.svg', supported: true },
  { id: 'shopify', name: 'Shopify', type: PlatformType.GIG_MARKETPLACE, logo_url: '/platforms/shopify.svg', supported: true },
  { id: 'taskrabbit', name: 'TaskRabbit', type: PlatformType.GIG_FREELANCE, logo_url: '/platforms/taskrabbit.svg', supported: true },
] as const;

/** Get platform by ID */
export function getPlatformById(id: string): GigPlatform | undefined {
  return GIG_PLATFORMS.find((p) => p.id === id);
}

/** Get platforms by type */
export function getPlatformsByType(type: PlatformType): GigPlatform[] {
  return GIG_PLATFORMS.filter((p) => p.type === type);
}

/** Get all supported platform IDs */
export function getSupportedPlatformIds(): string[] {
  return GIG_PLATFORMS.filter((p) => p.supported).map((p) => p.id);
}
