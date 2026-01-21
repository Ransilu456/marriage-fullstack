import { IProfileRepository } from '../interfaces/ProfileRepository';
import { Profile } from '../entities/Profile';
import { BlockRepositoryPrisma } from '@/src/infrastructure/db/BlockRepositoryPrisma';

export interface SearchFilters {
    userId: string; // User searching
    gender?: string;
    minAge?: number;
    maxAge?: number;
    religion?: string;
    jobCategory?: string; // Added filter
    location?: string;    // Added filter
    page?: number;
    limit?: number;
}

export interface ScoredProfile {
    profile: Profile;
    score: number;
    reasons: string[];
}

export class SearchProfilesUseCase {
    private readonly SCORE_THRESHOLD = 50;

    constructor(
        private profileRepo: IProfileRepository,
        private blockRepo: BlockRepositoryPrisma
    ) { }

    async execute(filters: SearchFilters): Promise<ScoredProfile[]> {
        // 1. Find searcher's profile for preferences
        const searcher = await this.profileRepo.findByUserId(filters.userId);
        if (!searcher) throw new Error("Searcher profile not found");

        // 2. Get blocked users (both ways)
        const blockedByMe = await this.blockRepo.findAllBlockedByUser(filters.userId);
        const blockedMe = await this.blockRepo.findAllWhoBlockedUser(filters.userId);
        const excludeIds = new Set([...blockedByMe, ...blockedMe, filters.userId]);

        // 3. Fetch candidates (Basic DB filtering)
        const { profiles } = await this.profileRepo.findFiltered({
            gender: filters.gender,
            minAge: filters.minAge,
            maxAge: filters.maxAge,
            religion: filters.religion,
            jobCategory: filters.jobCategory, // Pass new filter
            location: filters.location,       // Pass new filter
            page: filters.page,
            limit: 100 // Fetch more than limit to allow score and visibility filtering
        });

        // 4. Apply Matching Algorithm (Deterministic & Explainable)
        const scored = profiles
            .filter(p => !excludeIds.has(p.userId)) // Don't include self or blocked users
            .filter(p => p.toJSON().visibility === 'PUBLIC') // ONLY PUBLIC PROFILES FOR NOW
            .map(p => this.calculateMatch(searcher, p))
            .filter(res => res.score >= this.SCORE_THRESHOLD)
            .sort((a, b) => b.score - a.score);

        return scored.slice(0, filters.limit || 20);
    }

    private calculateMatch(searcher: Profile, candidate: Profile): ScoredProfile {
        let score = 0;
        const reasons: string[] = [];

        const searcherProps = searcher.toJSON();
        const candidateProps = candidate.toJSON();

        // 1. Age Compatibility (20 points)
        const ageDiff = Math.abs(searcher.age - candidate.age);
        if (ageDiff <= 3) {
            score += 20;
            reasons.push("Perfect age compatibility");
        } else if (ageDiff <= 7) {
            score += 10;
            reasons.push("Good age match");
        }

        // 2. Religion/Culture (25 points)
        if (searcherProps.religion === candidateProps.religion) {
            score += 25;
            reasons.push(`Matching ${searcherProps.religion} background`);
        }

        // 3. Lifestyle (20 points)
        if (searcherProps.diet === candidateProps.diet) score += 10;
        if (searcherProps.smoking === candidateProps.smoking) score += 5;
        if (searcherProps.drinking === candidateProps.drinking) score += 5;
        if (score > 45) reasons.push("Similar lifestyle values");

        // 4. Education/Career (15 points)
        if (searcherProps.education === candidateProps.education) {
            score += 15;
            reasons.push("Similar educational background");
        } else if (searcherProps.jobCategory === candidateProps.jobCategory) {
            score += 10;
            reasons.push("Similar professional field");
        }

        // 5. Profile Completeness Bonus (20 points)
        const candidateCompletion = candidate.calculateCompletion();
        if (candidateCompletion >= 95) {
            score += 20;
            reasons.push("Extremely detailed profile");
        } else if (candidateCompletion >= 85) {
            score += 10;
        }

        return {
            profile: candidate,
            score: Math.min(score, 100),
            reasons
        };
    }
}
