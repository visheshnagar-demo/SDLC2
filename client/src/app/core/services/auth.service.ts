import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, UserProfile } from '../models/entitlement.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = environment.apiBaseUrl || 'http://localhost:8000';
  private readonly TOKEN_KEY = 'citidirect_auth_token';
  private readonly USER_KEY = 'citidirect_auth_user';

  currentUserSignal = signal<UserProfile>({
    id: 'usr-001',
    username: 'maker_user',
    fullName: 'JUSTIN,JOHN',
    email: 'test@example.com',
    role: 'ROLE_MAKER',
    timeZone: 'GMT (UTC+0)'
  });

  constructor(private http: HttpClient) {
    this.restoreSession();
  }

  private restoreSession(): void {
    try {
      const storedUser = localStorage.getItem(this.USER_KEY);
      if (storedUser) {
        this.currentUserSignal.set(JSON.parse(storedUser));
      }
    } catch {
      // ignore
    }
  }

  getToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch {
      return null;
    }
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/api/v1/auth/login`, { username, password }).pipe(
      tap((res) => {
        if (res && res.token) {
          try {
            localStorage.setItem(this.TOKEN_KEY, res.token);
            const userProfile: UserProfile = {
              id: res.user.id,
              username: res.user.username,
              fullName: res.user.fullName,
              email: res.user.email,
              role: res.user.role as any,
              timeZone: 'GMT (UTC+0)'
            };
            localStorage.setItem(this.USER_KEY, JSON.stringify(userProfile));
            this.currentUserSignal.set(userProfile);
          } catch {
            // ignore localStorage issues
          }
        }
      })
    );
  }

  logout(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    } catch {
      // ignore
    }
    this.currentUserSignal.set({
      id: 'usr-001',
      username: 'maker_user',
      fullName: 'JUSTIN,JOHN',
      email: 'test@example.com',
      role: 'ROLE_MAKER',
      timeZone: 'GMT (UTC+0)'
    });
  }

  switchRole(role: 'MAKER' | 'AUTHORIZER'): Observable<AuthResponse> {
    const username = role === 'AUTHORIZER' ? 'checker_user' : 'maker_user';
    const password = 'testpassword';
    return this.login(username, password);
  }

  getCurrentUser(): UserProfile {
    return this.currentUserSignal();
  }
}
