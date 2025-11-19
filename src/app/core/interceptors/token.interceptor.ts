import { inject } from "@angular/core";
import { HttpInterceptorFn } from "@angular/common/http";
import { JwtService } from "../auth/services/jwt.service";
import { USE_PYTHON_API } from "./api-context.token"; 

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const jwtService = inject(JwtService);
  
  // CORRECCIÓN: Usamos SIEMPRE el token principal (el que nos dio PHP).
  // Al compartir la JWT_SECRET, este token sirve para ambos backends.
  const token = jwtService.getToken();

  let scheme: string = "Token"; // Por defecto para PHP (RealWorld spec)

  // 1. Ajustamos solo el prefijo ("Token" vs "Bearer")
  if (req.context.get(USE_PYTHON_API)) {
    // FastAPI (Python) usa el estándar OAuth2 "Bearer"
    scheme = "Bearer";
  } else {
    // Slim (PHP RealWorld) usa el estándar "Token"
    scheme = "Token";
  }

  // 2. Clona la petición y añade la cabecera si hay token
  const request = req.clone({
    setHeaders: {
      // Si token existe, inyectamos: Authorization: Bearer xxxxx
      ...(token ? { Authorization: `${scheme} ${token}` } : {}),
    },
  });
  
  return next(request);
};