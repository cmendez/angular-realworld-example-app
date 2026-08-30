import { provideZoneChangeDetection } from "@angular/core";
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
} from "@angular/core";
import { provideRouter } from "@angular/router";
import { routes } from "./app.routes";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { JwtService } from "./core/auth/services/jwt.service";
import { UserService } from "./core/auth/services/user.service";
import { apiInterceptor } from "./core/interceptors/api.interceptor";
import { tokenInterceptor } from "./core/interceptors/token.interceptor";
import { errorInterceptor } from "./core/interceptors/error.interceptor";
import { EMPTY } from "rxjs";

import { provideAnimations } from "@angular/platform-browser/animations"; // <-- 1. IMPORTAR ESTO

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([apiInterceptor, tokenInterceptor, errorInterceptor]),
    ),
    provideAppInitializer(() => {
      const jwtService = inject(JwtService);
      const userService = inject(UserService);
      return jwtService.getToken() ? userService.getCurrentUser() : EMPTY;
    }),
    provideAnimations(),
    // <-- 2. AÑADIR ESTA LÍNEA
  ],
};
