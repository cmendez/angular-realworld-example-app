import { Injectable } from "@angular/core";

export const JWT_TOKEN_KEY = "jwtToken";

@Injectable({ providedIn: "root" })
export class JwtService {
  getToken(): string | null {
    return window.localStorage.getItem(JWT_TOKEN_KEY);
  }

  saveToken(token: string): void {
    console.log("entro a saveToken");
    window.localStorage.setItem(JWT_TOKEN_KEY, token);
  }

  destroyToken(): void {
    console.log("entro a destroyToken");
    window.localStorage.removeItem(JWT_TOKEN_KEY);
  }
}
