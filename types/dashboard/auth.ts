export interface RegisterUserData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  country: string;
}

export interface RegisterMemberData {
  position: string;
  organization: string;
  phone_number: string;
  notes: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  tokens?: {
    access: string;
    refresh: string;
  };
  errors?: any;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  tokens?: AuthTokens;
  user?: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  errors?: any;
}

export interface ValidationError {
  field: string;
  message: string;
}