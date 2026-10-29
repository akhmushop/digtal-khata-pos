declare global {
  namespace Express {
    interface Request {
      /** Set by requireAuth for authenticated requests. */
      user?: {
        id: number;
        email: string;
        fullName: string;
        platformRole: "none" | "platform_admin";
        emailVerified: boolean;
      };
      /** Set by requireBusinessAccess for business-scoped requests. */
      membership?: {
        membershipId: number;
        businessId: number;
        roleSlug: string;
        roleName: string;
      };
      /** Set by requireBusinessAccess; derived from the stored subscription. */
      subscriptionAccess?: {
        accessMode: "full" | "read_only";
        status: string;
        trial: boolean;
        currentPeriodEnd: Date | null;
      };
    }
  }
}

export {};
