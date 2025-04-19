import type { LoginUserCommand, RegisterUserCommand, LoginUserResponseDto } from "../../types";

const API_URL = import.meta.env.PUBLIC_API_URL || "";

export async function login(data: LoginUserCommand): Promise<LoginUserResponseDto> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Login failed");
  }

  return response.json();
}

export async function register(data: RegisterUserCommand): Promise<void> {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Registration failed");
  }
}

export async function logout(): Promise<void> {
  const response = await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Logout failed");
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem("auth_token");
}

export function setAuthToken(token: string): void {
  localStorage.setItem("auth_token", token);
}

export function removeAuthToken(): void {
  localStorage.removeItem("auth_token");
}
