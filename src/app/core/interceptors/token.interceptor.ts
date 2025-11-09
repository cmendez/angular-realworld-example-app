import { inject } from "@angular/core";
import { HttpInterceptorFn } from "@angular/common/http";
import { JwtService } from "../auth/services/jwt.service";
import { USE_PYTHON_API } from "./api-context.token"; 

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const jwtService = inject(JwtService);
  let token: string | null = null;
  let scheme: string = "Token"; // Por defecto, el prefijo de PHP/RealWorld

  // 1. Revisa a qué backend vamos
  if (req.context.get(USE_PYTHON_API)) {
    // Es para Python
    token = window.localStorage.getItem('python_token');
    scheme = "Bearer"; // FastAPI usa "Bearer" por defecto
  } else {
    // Es para PHP
    token = jwtService.getToken();
    scheme = "Token"; // El spec original de RealWorld usa "Token"
  }

  // 2. Clona la petición y añade la cabecera correcta
  const request = req.clone({
    setHeaders: {
      ...(token ? { Authorization: `${scheme} ${token}` } : {}),
    },
  });
  
  return next(request);
};