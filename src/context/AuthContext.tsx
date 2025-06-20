import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "citizen" | "admin" | "official";
  department?: string;
  createdAt: string;
  lastLogin: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if Supabase is properly configured
  const isSupabaseConfigured = supabase !== null;

  // Mock users database (fallback when Supabase is not configured)
  const mockUsers = [
    {
      id: "admin-001",
      name: "Admin User",
      email: "admin@tgcivic.gov.in",
      phone: "9876543210",
      role: "admin" as const,
      department: "IT Department",
      password: "admin123",
      createdAt: "2024-01-01T00:00:00Z",
      lastLogin: new Date().toISOString(),
    },
    {
      id: "citizen-001",
      name: "Rajesh Kumar",
      email: "rajesh@email.com",
      phone: "9876543211",
      role: "citizen" as const,
      password: "citizen123",
      createdAt: "2024-01-15T00:00:00Z",
      lastLogin: new Date().toISOString(),
    },
    {
      id: "official-001",
      name: "GHMC Officer",
      email: "officer@ghmc.gov.in",
      phone: "9876543212",
      role: "official" as const,
      department: "GHMC Roads Department",
      password: "official123",
      createdAt: "2024-01-01T00:00:00Z",
      lastLogin: new Date().toISOString(),
    },
  ];

  // Convert Supabase user to our User type
  const convertSupabaseUser = (
    supabaseUser: SupabaseUser,
    profile: any,
  ): User => {
    return {
      id: supabaseUser.id,
      name: profile.name,
      email: supabaseUser.email!,
      phone: profile.phone,
      role: profile.role,
      department: profile.department,
      createdAt: profile.created_at,
      lastLogin: profile.last_login || new Date().toISOString(),
    };
  };

  // Load user from storage on mount
  useEffect(() => {
    if (isSupabaseConfigured) {
      // Supabase mode
      const getSession = async () => {
        try {
          const {
            data: { session },
            error,
          } = await supabase!.auth.getSession();

          if (error) {
            console.error("Error getting session:", error);
            setIsLoading(false);
            return;
          }

          if (session?.user) {
            // Get user profile from profiles table
            const { data: profile, error: profileError } = await supabase!
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            if (profileError) {
              console.error("Error fetching profile:", profileError);
              setIsLoading(false);
              return;
            }

            if (profile) {
              const userWithProfile = convertSupabaseUser(
                session.user,
                profile,
              );
              setUser(userWithProfile);
            }
          }
        } catch (error) {
          console.error("Error in getSession:", error);
        } finally {
          setIsLoading(false);
        }
      };

      getSession();

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase!.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          // Get user profile
          const { data: profile } = await supabase!
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (profile) {
            const userWithProfile = convertSupabaseUser(session.user, profile);
            setUser(userWithProfile);
          }
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      // Fallback mode - use localStorage
      const savedUser = localStorage.getItem("tg-civic-user");
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
        } catch (error) {
          console.error("Error loading user from localStorage:", error);
          localStorage.removeItem("tg-civic-user");
        }
      }
      setIsLoading(false);
    }
  }, [isSupabaseConfigured]);

  // Save user to localStorage in fallback mode
  useEffect(() => {
    if (!isSupabaseConfigured) {
      if (user) {
        localStorage.setItem("tg-civic-user", JSON.stringify(user));
      } else {
        localStorage.removeItem("tg-civic-user");
      }
    }
  }, [user, isSupabaseConfigured]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      if (isSupabaseConfigured) {
        // Supabase mode
        const { data, error } = await supabase!.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error("Login error:", error);
          return false;
        }

        if (data.user) {
          // Update last login
          await supabase!
            .from("profiles")
            .update({ last_login: new Date().toISOString() })
            .eq("id", data.user.id);

          return true;
        }

        return false;
      } else {
        // Fallback mode - use mock users
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const foundUser = mockUsers.find(
          (u) => u.email === email && u.password === password,
        );

        if (foundUser) {
          const { password: _, ...userWithoutPassword } = foundUser;
          const userWithLastLogin = {
            ...userWithoutPassword,
            lastLogin: new Date().toISOString(),
          };
          setUser(userWithLastLogin);
          return true;
        }

        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<boolean> => {
    setIsLoading(true);

    try {
      if (isSupabaseConfigured) {
        // Supabase mode
        const { data: existingProfile } = await supabase!
          .from("profiles")
          .select("phone")
          .eq("phone", userData.phone)
          .single();

        if (existingProfile) {
          return false; // Phone number already exists
        }

        // Create auth user
        const { data, error } = await supabase!.auth.signUp({
          email: userData.email,
          password: userData.password,
        });

        if (error) {
          console.error("Registration error:", error);
          return false;
        }

        if (data.user) {
          // Create profile
          const { error: profileError } = await supabase!
            .from("profiles")
            .insert({
              id: data.user.id,
              name: userData.name,
              email: userData.email,
              phone: userData.phone,
              role: "citizen",
              created_at: new Date().toISOString(),
              last_login: new Date().toISOString(),
            });

          if (profileError) {
            console.error("Profile creation error:", profileError);
            return false;
          }

          return true;
        }

        return false;
      } else {
        // Fallback mode - use mock users
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Check if user already exists
        const existingUser = mockUsers.find(
          (u) => u.email === userData.email || u.phone === userData.phone,
        );

        if (existingUser) {
          return false;
        }

        // Create new user
        const newUser: User = {
          id: `citizen-${Date.now()}`,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          role: "citizen",
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        };

        mockUsers.push({ ...newUser, password: userData.password } as any);
        setUser(newUser);
        return true;
      }
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase!.auth.signOut();
      }
      setUser(null);

      // Force redirect to homepage after logout
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase!
          .from("profiles")
          .update({
            name: updates.name,
            phone: updates.phone,
            department: updates.department,
          })
          .eq("id", user.id);

        if (error) {
          console.error("Profile update error:", error);
          return;
        }
      }

      // Update local state
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
    } catch (error) {
      console.error("Profile update error:", error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
