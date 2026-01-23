
export enum JobStatus {
    EMPLOYED = 'EMPLOYED',
    UNEMPLOYED = 'UNEMPLOYED',
    STUDENT = 'STUDENT',
    RETIRED = 'RETIRED',
    SELF_EMPLOYED = 'SELF_EMPLOYED'
}

export enum MaritalStatus {
    SINGLE = 'SINGLE',
    DIVORCED = 'DIVORCED',
    WIDOWED = 'WIDOWED'
}

export enum FamilyType {
    TRADITIONAL = 'TRADITIONAL',
    MODERN = 'MODERN',
    JOINT = 'JOINT',
    NUCLEAR = 'NUCLEAR'
}

export interface ProfileProps {
    id: string;
    userId: string;
    name: string;

    // Vital Stats
    gender: string;
    dateOfBirth: Date;
    height?: number;
    religion?: string;
    caste?: string;
    motherTongue?: string;
    bio: string;
    location: string;

    // Lifestyle & Profession
    jobStatus: JobStatus;
    maritalStatus: MaritalStatus;
    education?: string;
    profession?: string;
    incomeRange?: string;
    diet?: string;
    smoking?: string;
    drinking?: string;
    jobCategory?: string;
    contactDetails?: string;

    // Family Details
    fatherOccupation?: string;
    motherOccupation?: string;
    siblings?: string;
    familyType?: FamilyType;

    // Partner Preferences
    prefAgeMin?: number;
    prefAgeMax?: number;
    prefHeightMin?: number;
    prefReligion?: string;
    prefEducation?: string;
    prefLifestyle?: string;

    // Media
    photoUrl: string;
    coverUrl?: string;
    photoGallery?: string;

    isVerified: boolean;
    visibility: string; // PUBLIC, PRIVATE, PROTECTED

    createdAt: Date;
    updatedAt: Date;
}

export class Profile {
    constructor(private props: ProfileProps) {
        this.validate();
    }

    private validate(): void {
        const calculatedAge = Profile.calculateAge(this.props.dateOfBirth);
        if (calculatedAge < 18) {
            throw new Error("User must be at least 18 years old");
        }
        if (!this.props.bio) throw new Error("Bio is required");
        if (!this.props.location) throw new Error("Location is required");
        // photoUrl is handled by completion logic now
    }

    static create(props: Partial<ProfileProps> & { id: string; userId: string; name: string; gender: string; dateOfBirth: Date; bio: string; location: string; photoUrl: string; isVerified?: boolean }): Profile {
        const defaults = {
            jobStatus: JobStatus.UNEMPLOYED,
            maritalStatus: MaritalStatus.SINGLE,
            isVerified: false,
            visibility: 'PUBLIC',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        return new Profile({ ...defaults, ...props } as ProfileProps);
    }

    get id(): string { return this.props.id; }
    get userId(): string { return this.props.userId; }
    get name(): string { return this.props.name; }
    get dateOfBirth(): Date { return this.props.dateOfBirth; }
    get age(): number {
        return Profile.calculateAge(this.props.dateOfBirth);
    }
    get gender(): string { return this.props.gender; }
    get bio(): string { return this.props.bio; }
    get location(): string { return this.props.location; }
    get photoUrl(): string { return this.props.photoUrl; }
    get isVerified(): boolean { return this.props.isVerified; }
    get religion(): string | undefined { return this.props.religion; }
    get jobStatus(): JobStatus { return this.props.jobStatus; }
    get maritalStatus(): MaritalStatus { return this.props.maritalStatus; }
    get jobCategory(): string | undefined { return this.props.jobCategory; }
    get education(): string | undefined { return this.props.education; }
    get profession(): string | undefined { return this.props.profession; }
    get height(): number | undefined { return this.props.height; }
    get caste(): string | undefined { return this.props.caste; }
    get motherTongue(): string | undefined { return this.props.motherTongue; }
    get incomeRange(): string | undefined { return this.props.incomeRange; }
    get diet(): string | undefined { return this.props.diet; }
    get smoking(): string | undefined { return this.props.smoking; }
    get drinking(): string | undefined { return this.props.drinking; }
    get contactDetails(): string | undefined { return this.props.contactDetails; }
    get fatherOccupation(): string | undefined { return this.props.fatherOccupation; }
    get motherOccupation(): string | undefined { return this.props.motherOccupation; }
    get siblings(): string | undefined { return this.props.siblings; }
    get familyType(): FamilyType | undefined { return this.props.familyType; }
    get prefAgeMin(): number | undefined { return this.props.prefAgeMin; }
    get prefAgeMax(): number | undefined { return this.props.prefAgeMax; }
    get prefHeightMin(): number | undefined { return this.props.prefHeightMin; }
    get prefReligion(): string | undefined { return this.props.prefReligion; }
    get prefEducation(): string | undefined { return this.props.prefEducation; }
    get prefLifestyle(): string | undefined { return this.props.prefLifestyle; }
    get coverUrl(): string | undefined { return this.props.coverUrl; }
    get photoGallery(): string | undefined { return this.props.photoGallery; }
    get visibility(): string { return this.props.visibility; }
    get createdAt(): Date { return this.props.createdAt; }
    get updatedAt(): Date { return this.props.updatedAt; }

    /**
     * Calculates the profile completion percentage based on weighted fields.
     */
    calculateCompletion(): number {
        let score = 0;

        // Core Essentials (45% total - adjusted for new fields)
        if (this.props.gender) score += 5;
        if (this.props.dateOfBirth) score += 5;
        if (this.props.bio && this.props.bio.length > 20) score += 10;
        if (this.props.location) score += 5;
        if (this.props.photoUrl) score += 10;
        if (this.props.religion) score += 5;
        if (this.props.motherTongue) score += 5;

        // Vital Stats (10% total)
        if (this.props.height) score += 5;
        if (this.props.caste) score += 5;

        // Lifestyle & Profession (15% total)
        if (this.props.jobStatus) score += 3;
        if (this.props.maritalStatus) score += 3;
        if (this.props.diet) score += 3;
        if (this.props.smoking) score += 3;
        if (this.props.drinking) score += 3;

        // Family Details (20% total)
        if (this.props.fatherOccupation) score += 5;
        if (this.props.motherOccupation) score += 5;
        if (this.props.siblings) score += 5;
        if (this.props.familyType) score += 5;

        // Education/Career (5% total)
        if (this.props.education) score += 1.25;
        if (this.props.profession) score += 1.25;
        if (this.props.incomeRange) score += 1.25;
        if (this.props.jobCategory) score += 1.25;

        // Partner Preferences (5% total)
        const prefFields = [
            this.props.prefAgeMin, this.props.prefAgeMax,
            this.props.prefHeightMin, this.props.prefReligion,
            this.props.prefEducation, this.props.prefLifestyle
        ];
        const filledPrefs = prefFields.filter(f => f !== undefined && f !== null).length;
        score += (filledPrefs / prefFields.length) * 5;

        return Math.min(Math.round(score), 100);
    }

    /**
     * Returns actionable tips based on missing fields.
     */
    getMissingTips(): { field: string; tip: string; id: string }[] {
        const tips = [];
        if (!this.props.photoUrl) {
            tips.push({ field: 'Photo', tip: 'Profiles with photos get 10x more responses. Add yours now.', id: 'section-visuals' });
        }
        if (!this.props.height) {
            tips.push({ field: 'Height', tip: 'Adding your height helps matches visualize you better.', id: 'section-basics' });
        }
        if (!this.props.religion) {
            tips.push({ field: 'Religion', tip: 'Spirituality is a core match factor. Add your religion.', id: 'section-basics' });
        }
        if (!this.props.bio || this.props.bio.length < 50) {
            tips.push({ field: 'About', tip: 'A detailed bio (50+ chars) helps others understand your personality and values.', id: 'section-career' });
        }
        if (!this.props.location) {
            tips.push({ field: 'Location', tip: 'Specify your current city to find matches in your vicinity.', id: 'section-basics' });
        }
        if (!this.props.jobCategory || !this.props.profession) {
            tips.push({ field: 'Career', tip: 'Adding your profession and job category highlights your professional stability.', id: 'section-career' });
        }
        if (!this.props.education) {
            tips.push({ field: 'Education', tip: 'Education is a key selection criteria for many. Add your highest qualification.', id: 'section-career' });
        }
        if (!this.props.motherTongue) {
            tips.push({ field: 'Heritage', tip: 'Your mother tongue is a vital part of your cultural identity.', id: 'section-family' });
        }
        if (!this.props.photoGallery || this.props.photoGallery.split(',').filter(u => u).length < 3) {
            tips.push({ field: 'Gallery', tip: 'Add at least 3 photos to your gallery for a 200% boost in profile strength.', id: 'section-visuals' });
        }

        // Family Details - only show tip if ALL family fields are missing
        if (!this.props.fatherOccupation && !this.props.motherOccupation && !this.props.siblings && !this.props.familyType) {
            tips.push({ field: 'Family', tip: 'Family details build immense trust and transparency in matrimonial profiles.', id: 'section-family' });
        }

        // Partner Preferences
        const prefFields = [this.props.prefAgeMin, this.props.prefAgeMax, this.props.prefReligion, this.props.prefEducation];
        const filledPrefs = prefFields.filter(f => f !== undefined && f !== null).length;
        if (filledPrefs < prefFields.length) {
            tips.push({ field: 'Preferences', tip: 'Tell us who you are looking for so we can suggest better matches.', id: 'section-preferences' });
        }

        return tips;
    }

    /**
     * Business Rule: Profile must be >= 80% complete to interact with others.
     */
    isReadyForInteractions(): boolean {
        return this.calculateCompletion() >= 80;
    }

    // Logic to update profile
    update(data: Partial<Omit<ProfileProps, 'id' | 'userId' | 'createdAt'>>): void {
        Object.assign(this.props, { ...data, updatedAt: new Date() });
        this.validate();
    }

    toJSON() {
        return {
            ...this.props,
            age: this.age,
            isVerified: this.isVerified,
            completionPercentage: this.calculateCompletion(),
            isReady: this.isReadyForInteractions(),
            tips: this.getMissingTips()
        };
    }

    static calculateAge(dob: Date): number {
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (isNaN(age)) return 0;
        return age;
    }
}

