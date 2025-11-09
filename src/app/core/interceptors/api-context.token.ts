import { HttpContextToken } from "@angular/common/http";

/**
 * Crea un "Token de Contexto" que usaremos como bandera.
 * Si una petición HTTP tiene este token en su contexto,
 * el apiInterceptor sabrá que debe usar el backend de Python.
 */
export const USE_PYTHON_API = new HttpContextToken<boolean>(() => false);