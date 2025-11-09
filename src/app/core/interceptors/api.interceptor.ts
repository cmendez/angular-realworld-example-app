import { HttpInterceptorFn } from "@angular/common/http";
import { environment } from "../../../environments/environment";
// 1. Importa la nueva bandera
import { USE_PYTHON_API } from "./api-context.token"; 

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  let apiUrl: string;

  // 2. Revisa el contexto de la petición
  if (req.context.get(USE_PYTHON_API)) {
    // Si la bandera es 'true', usa el API de Python
    apiUrl = environment.pythonApiUrl;
  } else {
    // De lo contrario, usa el API de PHP por defecto
    apiUrl = environment.phpApiUrl;
  }

  // 3. Clona la petición con la URL correcta
  const apiReq = req.clone({ url: `${apiUrl}${req.url}` });
  return next(apiReq);
};