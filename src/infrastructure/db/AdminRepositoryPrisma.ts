import { prisma } from './prismaClient';
import { Prisma } from '@prisma/client';

export class AdminRepositoryPrisma {
  async getDashboardStats() {
    const [
      totalUsers,
      totalProfiles,
      totalInterests,
      activeInterests, // pending/accepted
      pendingVerifications,
      revenue
    ] = await Promise.all([
      prisma.user.count(),
      prisma.profile.count(),
      prisma.interest.count(),
      prisma.interest.count({ where: { status: 'ACCEPTED' } }),
      prisma.user.count({ where: { accountStatus: 'LIMITED' } }), // Assuming LIMITED needs verification
      Promise.resolve(12500)
    ]);

    return {
      totalUsers,
      totalProfiles,
      totalProposals: totalInterests,
      activeProposals: activeInterests, // mapped from interests
      pendingProfiles: pendingVerifications,
      revenue
    };
  }

  async getUsers(page = 1, limit = 10, search = '', role?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.UserWhereInput = {
      OR: search ? [
        { name: { contains: search } }, // sqlite might default case-insensitive or not, explicit mode varies
        { email: { contains: search } }
      ] : undefined,
      role: role ? (role as any) : undefined,
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          accountStatus: true,
          idVerified: true,
          photoVerified: true,
          trustScore: true,
          createdAt: true,
        }
      }),
      prisma.user.count({ where })
    ]);

    return { users, total, pages: Math.ceil(total / limit) };
  }

  async getProfiles(page = 1, limit = 10, status?: string, search?: string) {
    const skip = (page - 1) * limit;

    let whereUser: Prisma.UserWhereInput = {};
    if (search) {
      whereUser.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ];
    }
    if (status === 'verified') {
      whereUser.accountStatus = 'VERIFIED';
    } else if (status === 'pending') {
      whereUser.accountStatus = 'LIMITED'; // Treating LIMITED as pending verification
    }

    const [profiles, total] = await Promise.all([
      prisma.profile.findMany({
        where: { user: whereUser },
        skip,
        take: limit,
        include: { user: { select: { id: true, name: true, email: true, accountStatus: true, trustScore: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.profile.count({ where: { user: whereUser } })
    ]);

    return { profiles, total, pages: Math.ceil(total / limit) };
  }

  async getProposals(page = 1, limit = 10, status?: string) {
    // Mapping "Proposals" to "Interests"
    const skip = (page - 1) * limit;
    const where: Prisma.InterestWhereInput = status ? { status: status as any } : {};

    const [interests, total] = await Promise.all([
      prisma.interest.findMany({
        where,
        skip,
        take: limit,
        include: {
          sender: { select: { name: true, email: true } },
          receiver: { select: { name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.interest.count({ where })
    ]);

    return { proposals: interests, total, pages: Math.ceil(total / limit) }; // Return as proposals for frontend compatibility
  }

  // Admin Actions
  async deleteUser(userId: string) {
    return prisma.user.delete({ where: { id: userId } });
  }

  async banUser(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        accountStatus: 'BANNED',
        // Revoke all verifications
        phoneVerified: false,
        photoVerified: false,
        idVerified: false,
        trustScore: 0
      }
    });
  }

  async unbanUser(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { accountStatus: 'LIMITED' }
    });
  }

  async verifyProfile(profileId: string) {
    // Profile verification actually updates the User status
    // First get the user ID from the profile
    const profile = await prisma.profile.findUnique({ where: { id: profileId }, select: { userId: true } });
    if (!profile) throw new Error('Profile not found');

    return prisma.user.update({
      where: { id: profile.userId },
      data: { accountStatus: 'VERIFIED' }
    });
  }

  async rejectProfile(profileId: string) {
    const profile = await prisma.profile.findUnique({ where: { id: profileId }, select: { userId: true } });
    if (!profile) throw new Error('Profile not found');

    // Rejecting implies staying LIMITED or explicitly setting it (schema doesn't have REJECTED for accountStatus, only VerificationStatus)
    // We will keep it LIMITED or set to LIMITED
    return prisma.user.update({
      where: { id: profile.userId },
      data: { accountStatus: 'LIMITED' }
    });
  }

  async deleteProposal(proposalId: string) {
    return prisma.interest.delete({ where: { id: proposalId } });
  }

  // Identity Verification
  async getIdentityVerifications(page = 1, limit = 10, status?: string, userId?: string) {
    const skip = (page - 1) * limit;

    // --- AUTO-SYNC STEP ---
    // Ensure all IdentityDocuments have a corresponding Verification record for Admin review
    const allIdDocs = await prisma.identityDocument.findMany({
      where: userId ? { userId } : { status: 'PENDING' }, // Sync specifically for user or all pending
      select: { userId: true, type: true, fileUrl: true, status: true, id: true }
    });

    for (const doc of allIdDocs) {
      const exists = await prisma.verification.findFirst({
        where: { userId: doc.userId, documentUrl: doc.fileUrl }
      });

      if (!exists) {
        const verificationType = ['ID_CARD', 'PASSPORT', 'DRIVING_LICENSE'].includes(doc.type) ? 'ID' :
          doc.type === 'PHOTO' ? 'PHOTO' : 'ID';

        await prisma.verification.create({
          data: {
            userId: doc.userId,
            documentType: verificationType,
            documentUrl: doc.fileUrl,
            status: doc.status as any, // Sync status as well
          }
        });
      }
    }
    // --- END AUTO-SYNC ---

    const where: Prisma.VerificationWhereInput = {
      ...(status && status !== 'ALL' ? { status: status as any } : {}),
      ...(userId ? { userId } : {})
    };

    const [verifications, total] = await Promise.all([
      prisma.verification.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profile: {
                select: {
                  photoUrl: true,
                  bio: true,
                  location: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.verification.count({ where })
    ]);

    return { verifications, total, pages: Math.ceil(total / limit) };
  }

  async processVerification(verificationId: string, action: 'VERIFY' | 'REJECT' | 'REVOKE', notes?: string) {
    const verification = await prisma.verification.findUnique({ where: { id: verificationId } });
    if (!verification) throw new Error('Verification request not found');

    if (action === 'REVOKE') {
      return this.revokeVerification(verificationId);
    }

    // Update Verification record
    await prisma.verification.update({
      where: { id: verificationId },
      data: {
        status: action === 'VERIFY' ? 'VERIFIED' : 'REJECTED',
        notes,
        reviewedAt: new Date()
      }
    });

    // If Verified, update User flags based on document type
    if (action === 'VERIFY') {
      const updateData: Prisma.UserUpdateInput = {};
      if (verification.documentType === 'PHOTO') {
        updateData.photoVerified = true;
        updateData.trustScore = { increment: 30 };
      }
      if (verification.documentType === 'ID') {
        updateData.idVerified = true;
        updateData.accountStatus = 'VERIFIED'; // Upgrade account status if ID is verified
        updateData.trustScore = { increment: 25 };
      }
      if (verification.documentType === 'PHONE') {
        updateData.phoneVerified = true;
        updateData.trustScore = { increment: 20 };
      }
      if (verification.documentType === 'EMAIL') { // Just in case
        updateData.emailVerified = new Date();
        updateData.trustScore = { increment: 20 };
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.user.update({
          where: { id: verification.userId },
          data: updateData
        });
      }
    }

    // Sync back to IdentityDocument table to update user profile history
    await prisma.identityDocument.updateMany({
      where: {
        userId: verification.userId,
        fileUrl: verification.documentUrl
      },
      data: {
        status: action === 'VERIFY' ? 'VERIFIED' : 'REJECTED',
        rejectionReason: notes || null,
        updatedAt: new Date()
      }
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: verification.userId,
        action: `IDENTITY_${action}`,
        resource: 'Verification',
        metadata: JSON.stringify({ verificationId, documentType: verification.documentType, notes })
      }
    });

    return { success: true };
  }

  async revokeVerification(verificationId: string) {
    const verification = await prisma.verification.findUnique({ where: { id: verificationId } });
    if (!verification) throw new Error('Verification request not found');

    // Reset Verification record
    await prisma.verification.update({
      where: { id: verificationId },
      data: {
        status: 'PENDING',
        notes: 'Verification revoked by admin',
        reviewedAt: null
      }
    });

    // Reset User flags
    const updateData: Prisma.UserUpdateInput = {
      accountStatus: 'LIMITED'
    };
    if (verification.documentType === 'PHOTO') {
      updateData.photoVerified = false;
      updateData.trustScore = { decrement: 30 };
    }
    if (verification.documentType === 'ID') {
      updateData.idVerified = false;
      updateData.trustScore = { decrement: 25 };
    }
    if (verification.documentType === 'PHONE') {
      updateData.phoneVerified = false;
      updateData.trustScore = { decrement: 20 };
    }

    await prisma.user.update({
      where: { id: verification.userId },
      data: updateData
    });

    // Sync to IdentityDocument
    await prisma.identityDocument.updateMany({
      where: {
        userId: verification.userId,
        fileUrl: verification.documentUrl
      },
      data: {
        status: 'PENDING',
        updatedAt: new Date()
      }
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: verification.userId,
        action: 'IDENTITY_REVOKE',
        resource: 'Verification',
        metadata: JSON.stringify({ verificationId, documentType: verification.documentType })
      }
    });

    return { success: true };
  }

  async getReports(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        skip,
        take: limit,
        include: {
          reporter: { select: { name: true, email: true } },
          target: { select: { name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.report.count()
    ]);

    return { reports, total, pages: Math.ceil(total / limit) };
  }

  async updateReportStatus(reportId: string, status: string) {
    return prisma.report.update({
      where: { id: reportId },
      data: { status }
    });
  }
}