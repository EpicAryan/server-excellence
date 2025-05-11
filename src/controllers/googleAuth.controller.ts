// src/controllers/googleAuth.controller.ts
import { Request, Response } from 'express';
import { createOrUpdateGoogleUser } from '../services';
import { generateAccessToken, generateRefreshToken } from '../utils';
import db from '../config/db_connect';
import { refreshTokens } from '../models';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';

// Initialize Google OAuth configuration
const googleConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: process.env.GOOGLE_REDIRECT_URI!,
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  userInfoEndpoint: 'https://www.googleapis.com/oauth2/v3/userinfo'
};

// Redirect to Google's OAuth page
export const googleAuthRedirect = (req: Request, res: Response): void => {
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleConfig.clientId}&redirect_uri=${encodeURIComponent(googleConfig.redirectUri)}&response_type=code&scope=email%20profile&access_type=offline&prompt=consent`;
  res.redirect(authUrl);
};

// Handle Google's callback
export const googleAuthCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL}/auth/error?error=missing_code`);
    }

    // Exchange code for tokens using fetch
    const tokenResponse = await fetch(googleConfig.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code as string,
        client_id: googleConfig.clientId,
        client_secret: googleConfig.clientSecret,
        redirect_uri: googleConfig.redirectUri,
        grant_type: 'authorization_code',
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Failed to fetch tokens: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;

    // Fetch user info using access token
    const userInfoResponse = await fetch(googleConfig.userInfoEndpoint, {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    if (!userInfoResponse.ok) {
      const errorText = await userInfoResponse.text();
      throw new Error(`Failed to fetch user info: ${errorText}`);
    }

    const { email, name, sub: googleId} = await userInfoResponse.json();

    if (!email) {
      res.status(400).json({ success: false, message: 'Email not provided by Google' });
      return;
    }

    // Check if user exists or create new one
    const user = await createOrUpdateGoogleUser(email, name, googleId);
    if (!user.success || !user.user) {
        return res.redirect(`${process.env.FRONTEND_URL}/auth/error?error=user_not_found&message=${encodeURIComponent(user.message || 'Google login failed')}`);
    }

     await db
       .delete(refreshTokens)
       .where(eq(refreshTokens.userId, user.user.id));

    const { ...userWithoutPassword } = user.user;
    const accessToken = generateAccessToken(userWithoutPassword);
    const refreshToken = generateRefreshToken(userWithoutPassword);

    const sessionId = crypto.randomUUID();
    await db.insert(refreshTokens).values({
      userId: user.user.id,
      sessionId,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.redirect(`${process.env.FRONTEND_URL}/auth/google/success`);
  } catch (error) {
    console.error('Google auth callback error:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/auth/error?error=server_error&message=${encodeURIComponent('Authentication failed')}`);
  }
};
