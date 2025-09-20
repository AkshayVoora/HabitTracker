export interface User {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  created_at: Date;
  is_setup_complete: boolean;
}

export interface CreateUserRequest {
  email: string;
  username: string;
  password: string;
  confirm_password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  created_at: Date;
  is_setup_complete: boolean;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
}
