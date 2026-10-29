import type { Request, Response } from "express";
import {
  getCurrentUserContext,
  loginUser,
  registerUser,
  revokeRefreshToken,
  rotateRefreshToken,
  verifyEmailToken,
} from "./auth.service.js";
import {
  loginSchema,
  registerSchema,
  verifyEmailSchema,
} from "./auth.validation.js";
import { env } from "../../config/env.js";
import { sendSafeError } from "../../utils/safeError.js";
import { UnauthorizedError } from "../../utils/handleError.js";

const REFRESH_COOKIE = "ezpos_refresh_token";

function clientMeta(req: Request): {
  ip: string | undefined;
  userAgent: string | undefined;
} {
  return {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  };
}

function setRefreshCookie(res: Response, token: string, expiresAt: Date) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "lax",
    path: "/api/auth",
    expires: expiresAt,
  });
}

function clearRefreshCookie(res: Response) {
  res.cookie(REFRESH_COOKIE, "", {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 0,
  });
}

export function readRefreshCookie(req: Request): string | null {
  const header = req.headers.cookie;
  if (!header) return null;
  for (const part of header.split(";")) {
    const eqIndex = part.indexOf("=");
    if (eqIndex === -1) continue;
    const name = part.slice(0, eqIndex).trim();
    if (name === REFRESH_COOKIE) {
      return decodeURIComponent(part.slice(eqIndex + 1).trim());
    }
  }
  return null;
}

export async function register(req: Request, res: Response) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.issues[0]?.message ?? "Invalid registration data.",
      });
    }
    const user = await registerUser(parsed.data);
    // 201: account created. Email delivery is not configured yet, so no
    // verification link is sent and none is claimed.
    return res.status(201).json({
      success: true,
      message:
        "Account created. You can sign in now; email verification will open once email delivery is configured.",
      user,
    });
  } catch (err) {
    return sendSafeError(res, err, "Unable to create the account right now.");
  }
}

export async function login(req: Request, res: Response) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.issues[0]?.message ?? "Invalid login data.",
      });
    }
    const { user, tokens } = await loginUser(parsed.data, clientMeta(req));
    setRefreshCookie(res, tokens.refreshToken, tokens.refreshTokenExpiresAt);
    return res.status(200).json({
      success: true,
      accessToken: tokens.accessToken,
      user,
    });
  } catch (err) {
    return sendSafeError(res, err, "Unable to sign in right now.");
  }
}

export async function refresh(req: Request, res: Response) {
  try {
    const presented = readRefreshCookie(req);
    if (!presented) {
      throw new UnauthorizedError("No active session found.");
    }
    const { user, tokens } = await rotateRefreshToken(
      presented,
      clientMeta(req),
    );
    setRefreshCookie(res, tokens.refreshToken, tokens.refreshTokenExpiresAt);
    return res.status(200).json({
      success: true,
      accessToken: tokens.accessToken,
      user,
    });
  } catch (err) {
    clearRefreshCookie(res);
    return sendSafeError(res, err, "Unable to refresh the session.");
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const presented = readRefreshCookie(req);
    if (presented) {
      await revokeRefreshToken(presented);
    }
    clearRefreshCookie(res);
    return res.status(200).json({ success: true, message: "Signed out." });
  } catch (err) {
    return sendSafeError(res, err, "Unable to sign out right now.");
  }
}

export async function me(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required." });
    }
    const context = await getCurrentUserContext(req.user.id);
    return res.status(200).json({ success: true, ...context });
  } catch (err) {
    return sendSafeError(res, err, "Unable to load your account right now.");
  }
}

export async function verifyEmail(req: Request, res: Response) {
  try {
    const parsed = verifyEmailSchema.safeParse(req.query);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ success: false, message: "A valid verification token is required." });
    }
    const verified = await verifyEmailToken(parsed.data.token);
    if (!verified) {
      return res.status(400).json({
        success: false,
        message: "This verification link is invalid or has expired.",
      });
    }
    return res
      .status(200)
      .json({ success: true, message: "Email verified. Thank you!" });
  } catch (err) {
    return sendSafeError(res, err, "Unable to verify the email right now.");
  }
}
