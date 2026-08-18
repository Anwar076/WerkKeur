import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      firstName?: string;
      lastName?: string;
      organizationId?: string;
      role?: "OWNER" | "ADMIN" | "EMPLOYEE";
    };
  }

  interface User {
    firstName: string;
    lastName: string;
    organizationId?: string;
    role?: "OWNER" | "ADMIN" | "EMPLOYEE";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    organizationId?: string;
    role?: "OWNER" | "ADMIN" | "EMPLOYEE";
    firstName?: string;
    lastName?: string;
  }
}
