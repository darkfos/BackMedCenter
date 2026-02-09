import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";

import { apiConfig } from "@/conf/apiConfig.js";

export type TokenType = "access" | "refresh";

export function generateToken(data: Record<string, any>, tokenType: TokenType) {
  const token = jwt.sign(
    data,
    tokenType == "access" ? apiConfig.access_token : apiConfig.refresh_token,
    {
      expiresIn:
        tokenType == "access"
          ? (`${apiConfig.access_expire}m` as string)
          : `${apiConfig.refresh_expire}d`,
      algorithm: apiConfig.algorithm,
    } as SignOptions,
  );

  return token;
}

export function verifyToken(token: string, tokenType: TokenType) {
  try {
    const tokenData = jwt.verify(
      token,
      tokenType === "access" ? apiConfig.access_token : apiConfig.refresh_token,
      {
        algorithms: [apiConfig.algorithm],
      } as VerifyOptions,
    );
    return tokenData;
  } catch (e) {
    return false;
  }
}
