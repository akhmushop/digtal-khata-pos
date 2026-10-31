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
      /** Set by requireBusinessContext/requireBusinessAccess. permissions is
       *  the effective permission set (owner holds the "*" wildcard). */
      membership?: {
        membershipId: number;
        businessId: number;
        roleSlug: string;
        roleName: string;
        permissions: string[];
      };
      /** Set by requireLocationAccess after server-side validation. */
      location?: {
        locationId: number;
        name: string;
        isDefault: boolean;
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
