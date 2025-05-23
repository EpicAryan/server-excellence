import { Request, Response } from "express";
import { registerUser, loginUser, logoutUser, refreshUserTokenBySessionId, getUserById, getUserByIdMe } from "../services";
import  jwt  from "jsonwebtoken";

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password || !role) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const result = await registerUser(username, email, password, role);
    res.status(result.success ? 201 : 400).json(result);
    return;
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const result = await loginUser(email, password);
    if (result.success) {
      res.cookie("sessionId", result.sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.cookie("accessToken", result.accessToken, { // Corrected: Use accessToken here
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
      });
    }

    res.status(result.success ? 200 : 401).json({
      accessToken: result.accessToken,
      user: result.userWithoutPassword,
      sessionId: result.sessionId,
      message: result.message,
    });
    return;
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
      const sessionId = req.cookies.sessionId;
      
      if (!sessionId) {
        res.status(401).json({ message: "Unauthorized - No session identifier" });
        return;
      }

      const result = await refreshUserTokenBySessionId(sessionId);
      
      if (result.success) {
          // Set only the access token in cookies, NOT the refresh token
          res.cookie("accessToken", result.accessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "strict",
              maxAge: 24 * 60 * 60 * 1000, // 1 day
          });
          
          res.cookie("sessionId", result.sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          });
          // Return success with tokens and user data
          res.status(200).json({
              success: true,
              accessToken: result.accessToken,
              refreshToken: result.sessionId, // Send refresh token in response body
              user: result.user
          });
      } else {
          // Clear cookies if refresh failed
          res.clearCookie("accessToken");
          res.clearCookie("sessionId");

          res.status(401).json({ 
              success: false, 
              message: result.message || "Token refresh failed" 
          });
      }
  } catch (error) {
      console.error("Refresh token endpoint error:", error);
      res.clearCookie("accessToken");
      res.clearCookie("sessionId");
      res.status(500).json({ 
          success: false, 
          message: "Internal server error" 
      });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = req.cookies?.sessionId || req.body?.sessionId;
    if (!sessionId ) {
      res.status(400).json({ message: "No token provided" });
      return; 
    }

    await logoutUser(sessionId );
    res.clearCookie("sessionId", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/", 
    });
    
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/", 
    });
    

    res.status(200).json({ message: "Logged out successfully" });
    return;
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const accessToken = req.cookies?.accessToken;
    if (!accessToken) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET!) as {user: { id: number }};
    const user = await getUserByIdMe(decoded.user.id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Error in getMe:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
