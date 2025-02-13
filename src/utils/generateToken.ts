import dotenv from "dotenv";
dotenv.config();

import jwt, { SignOptions } from "jsonwebtoken";

import { UserWithoutPassword } from "../@types/types";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;


export const generateAccessToken = (user: UserWithoutPassword): string => {
    const expiresInValue = process.env.JWT_ACCESS_SECRET_EXPIRATION || "3d";

    const signOptions: SignOptions = {
        expiresIn: expiresInValue as SignOptions["expiresIn"],
    };

    return jwt.sign(
        { user },
        ACCESS_SECRET,
        signOptions
    );
};

export const generateRefreshToken = (user: UserWithoutPassword): string => {
    const expiresInValue = process.env.JWT_REFRESH_SECRET_EXPIRATION || "7d";

    const signOptions: SignOptions = {
        expiresIn: expiresInValue as SignOptions["expiresIn"],
    };

    return jwt.sign(
        { user },
        REFRESH_SECRET,
        signOptions
    );
};
