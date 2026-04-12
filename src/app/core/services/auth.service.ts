import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';

// Session in localStorage (graphql.provider uses the same token key for API calls).
const TOKEN_KEY = 'ems_token';
const USER_KEY = 'ems_user';

export interface AuthUser {
  _id: string;
  username: string;
  email: string;
}

const LOGIN = gql`
  query Login($usernameOrEmail: String!, $password: String!) {
    login(usernameOrEmail: $usernameOrEmail, password: $password) {
      success
      message
      token
      user {
        _id
        username
        email
      }
    }
  }
`;

const SIGNUP = gql`
  mutation Signup($username: String!, $email: String!, $password: String!) {
    signup(username: $username, email: $email, password: $password) {
      success
      message
      token
      user {
        _id
        username
        email
      }
    }
  }
`;

const LOGOUT = gql`
  query Logout {
    logout {
      success
      message
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<AuthUser | null>(this.readStoredUser());

  constructor(
    private readonly apollo: Apollo,
    private readonly router: Router
  ) {}

  isLoggedIn(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }

  private readStoredUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }

  private persistSession(token: string, user: AuthUser): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.user.set(user);
  }

  async login(usernameOrEmail: string, password: string): Promise<string | null> {
    const result = await firstValueFrom(
      this.apollo
        .query<{ login: { success: boolean; message: string; token?: string | null; user?: AuthUser | null } }>({
          query: LOGIN,
          variables: { usernameOrEmail, password },
          fetchPolicy: 'network-only',
        })
        .pipe(map((r) => r.data?.login))
    );
    if (!result || !result.success || !result.token || !result.user) {
      return result?.message || 'Login failed';
    }
    this.persistSession(result.token, result.user);
    return null;
  }

  async signup(username: string, email: string, password: string): Promise<string | null> {
    const result = await firstValueFrom(
      this.apollo
        .mutate<{
          signup: { success: boolean; message: string; token?: string | null; user?: AuthUser | null };
        }>({
          mutation: SIGNUP,
          variables: { username, email, password },
        })
        .pipe(map((r) => r.data?.signup))
    );
    if (!result || !result.success || !result.token || !result.user) {
      return result?.message || 'Signup failed';
    }
    this.persistSession(result.token, result.user);
    return null;
  }

  logout(): void {
    this.apollo
      .query({
        query: LOGOUT,
        fetchPolicy: 'network-only',
      })
      .subscribe({
        next: () => this.clearSessionAndGoLogin(),
        error: () => this.clearSessionAndGoLogin(),
      });
  }

  private clearSessionAndGoLogin(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.user.set(null);
    void this.router.navigate(['/login']);
  }
}
