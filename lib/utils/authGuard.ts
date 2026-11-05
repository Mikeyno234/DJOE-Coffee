import { NextResponse } from "next/server";
import { AuthService, AuthTokenPayload } from "@/lib/services/auth.service";
import { Role } from "@/lib/models/user";

export interface AuthResult {
  authenticated: boolean;
  user: AuthTokenPayload | null;
  errorResponse?: NextResponse;
}

/**
 * Server-side API authentication guard.
 * Extracts signed token from cookie or Authorization Bearer header.
 * Verifies HMAC-SHA256 signature and optionally asserts user role.
 */
export function requireAuth(
  request: Request,
  allowedRoles?: Role[]
): AuthResult {
  // 1. Extract from Cookie
  const cookieHeader = request.headers.get("cookie") || "";
  const tokenMatch = cookieHeader.match(/refresh_token=([^;]+)/);
  let token = tokenMatch ? tokenMatch[1].trim() : null;

  // 2. Fallback to Authorization Header
  if (!token) {
    const authHeader = request.headers.get("authorization") || "";
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    }
  }

  if (!token) {
    return {
      authenticated: false,
      user: null,
      errorResponse: NextResponse.json(
        {
          success: false,
          error: "Autentikasi diperlukan. Sesi tidak ditemukan.",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      ),
    };
  }

  // 3. Verify HMAC signature & expiration
  const verifiedUser = AuthService.verifyToken(token);
  if (!verifiedUser) {
    return {
      authenticated: false,
      user: null,
      errorResponse: NextResponse.json(
        {
          success: false,
          error: "Sesi tidak valid atau telah kedaluwarsa. Silakan masuk kembali.",
          code: "INVALID_TOKEN",
        },
        { status: 401 }
      ),
    };
  }

  // 4. Role Authorization Check (RBAC)
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(verifiedUser.role)) {
      return {
        authenticated: false,
        user: verifiedUser,
        errorResponse: NextResponse.json(
          {
            success: false,
            error: "Akses ditolak. Anda tidak memiliki izin untuk tindakan ini.",
            code: "FORBIDDEN",
          },
          { status: 403 }
        ),
      };
    }
  }

  return {
    authenticated: true,
    user: verifiedUser,
  };
}
