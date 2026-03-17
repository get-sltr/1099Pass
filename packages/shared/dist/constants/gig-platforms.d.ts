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
export declare const GIG_PLATFORMS: readonly GigPlatform[];
/** Get platform by ID */
export declare function getPlatformById(id: string): GigPlatform | undefined;
/** Get platforms by type */
export declare function getPlatformsByType(type: PlatformType): GigPlatform[];
/** Get all supported platform IDs */
export declare function getSupportedPlatformIds(): string[];
//# sourceMappingURL=gig-platforms.d.ts.map