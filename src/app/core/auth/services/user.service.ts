import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject, throwError, of } from "rxjs";

import { JwtService } from "./jwt.service";
import {
  map,
  distinctUntilChanged,
  tap,
  shareReplay,
  switchMap, // <-- Añade switchMap
} from "rxjs/operators";
import { HttpClient, HttpContext } from "@angular/common/http"; // <-- Añade HttpContext
import { User } from "../user.model";
import { Router } from "@angular/router";
import { USE_PYTHON_API } from "../../interceptors/api-context.token";

@Injectable({ providedIn: "root" })
export class UserService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser = this.currentUserSubject
    .asObservable()
    .pipe(distinctUntilChanged());

  public isAuthenticated = this.currentUser.pipe(map((user) => !!user));

  constructor(
    private readonly http: HttpClient,
    private readonly jwtService: JwtService,
    private readonly router: Router,
  ) {}

  login(credentials: {
    email: string;
    password: string;
  }): Observable<{ user: User }> {
    return this.http
      .post<{ user: User & { python_token?: string } }>("/users/login", {
        user: credentials,
      }) // 1. Llama a PHP
      .pipe(
        switchMap((response) => {
          if (!response.user.python_token) {
            return throwError(() => ({
              errors: { "Token Python": ["no se pudo generar."] },
            }));
          }
          return of(response);
        }),
        // 2. PHP devuelve ambos tokens, 'setAuth' los guarda
        tap(({ user }) => this.setAuth(user as User)),

        // 3. --- ¡INICIO DE LA PRUEBA! ---
        // Justo después de guardar, usamos switchMap para hacer una NUEVA llamada
        switchMap((phpLoginResponse) => {
          console.log(
            "LOGIN (PHP/Python) EXITOSO. Probando endpoint de artículos de Python...",
          );

          // Prepara el contexto para que los interceptores sepan
          // que esta llamada es para Python
          const context = new HttpContext().set(USE_PYTHON_API, true);

          // Llama al endpoint de artículos.
          // (api.interceptor cambiará la URL a :8080)
          // (token.interceptor adjuntará el 'python_token' como Bearer)
          return this.http.get("/articles", { context }).pipe(
            map((pythonArticlesResponse) => {
              // 4. Si llegamos aquí, ¡FUNCIONÓ!
              console.log(
                "¡ÉXITO EN LA PRUEBA! Respuesta de /articles (Python):",
                pythonArticlesResponse,
              );

              // Devuelve la respuesta original del login
              // para que el componente (auth.component) pueda navegar a home
              return phpLoginResponse;
            }),
          );
        }),
        // --- FIN DE LA PRUEBA ---
      );
  }

  register(credentials: {
    username: string;
    email: string;
    password: string;
  }): Observable<{ user: User }> {
    return this.http
      .post<{ user: User }>("/users", { user: credentials })
      .pipe(tap(({ user }) => this.setAuth(user)));
  }

  logout(): void {
    this.purgeAuth();
    void this.router.navigate(["/"]);
  }

  getCurrentUser(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>("/user").pipe(
      tap({
        // Correcto: Solo actualiza los datos del usuario, no la sesión completa
        next: ({ user }) => this.currentUserSubject.next(user),
        error: () => this.purgeAuth(),
      }),
      shareReplay(1),
    );
  }

  update(user: Partial<User>): Observable<{ user: User }> {
    return this.http.put<{ user: User }>("/user", { user }).pipe(
      tap(({ user }) => {
        this.currentUserSubject.next(user);
      }),
    );
  }

  setAuth(user: User & { python_token?: string }): void {
    // <-- Modifica la firma
    // 1. Guarda el token de PHP (como antes)
    this.jwtService.saveToken(user.token);
    this.currentUserSubject.next(user);

    // 2. NUEVO: Guarda el token de Python si existe
    if (user.python_token) {
      window.localStorage.setItem("python_token", user.python_token);
    }
  }

  purgeAuth(): void {
    // 1. Borra el token de PHP (como antes)
    this.jwtService.destroyToken();
    this.currentUserSubject.next(null);

    // 2. NUEVO: Borra el token de Python
    window.localStorage.removeItem("python_token");
  }
}
