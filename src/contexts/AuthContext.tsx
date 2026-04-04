import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type Role = "user" | "client" | "admin" | "banned";

interface AuthContextType {
  user: User | null;
  role: Role | null;
  avatarUrl: string | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshAvatar: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  avatarUrl: null,
  isLoading: true,
  signOut: async () => {},
  refreshAvatar: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfileData(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfileData(session.user.id);
      } else {
        setRole(null);
        setAvatarUrl(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfileData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role, avatar_url")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile data:", error);
      } else if (data) {
        setRole(data.role as Role);
        
        if (data.avatar_url) {
          const { data: storageData, error: storageError } = await supabase.storage
            .from("avatars")
            .createSignedUrl(data.avatar_url, 3600);
            
          if (storageData?.signedUrl) {
            setAvatarUrl(storageData.signedUrl);
          } else {
             console.error("Error creating signed URL:", storageError);
          }
        }
      }
    } catch (err) {
      console.error("Unexpected error fetching profile data", err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAvatar = async () => {
    if (user) await fetchProfileData(user.id);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, role, avatarUrl, isLoading, signOut, refreshAvatar }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};