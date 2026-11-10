"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { useTransitionRouter } from "next-view-transitions";
import type { CountryCode } from "libphonenumber-js";
import { useAuth as useZcomAuth, useProfile } from "@zcom/storefront-kit/client";
import { getErrorMessage } from "@zcom/storefront-kit/core";
import { useToast } from "@/components/providers/ToastProvider";
import { toDialCode, toUser } from "@/lib/zcom/adapters";
import type { User } from "@/types";

export type AuthMode = "login" | "signup";

type SignUpData = {
  firstName: string;
  lastName: string;
  email: string;
  phoneCountry: CountryCode;
  phone: string;
  password: string;
};

type AuthResult = { ok: true; user: User } | { ok: false; error: string };

type OpenLoginOptions = {
  mode?: AuthMode;
  /** Where to go once signed in; null stays on the current page. Defaults to /account */
  next?: string | null;
  /** Runs after a successful sign in, e.g. finishing the "save to wishlist" that asked for it */
  onSuccess?: () => void;
};

type AuthContextValue = {
  user: User | null;
  /** False while a returning customer's session is being restored */
  isReady: boolean;
  isLoginOpen: boolean;
  /** Bumps on every open, so the forms start fresh */
  openCount: number;
  loginMode: AuthMode;
  setLoginMode: (mode: AuthMode) => void;
  openLogin: (options?: OpenLoginOptions) => void;
  closeLogin: () => void;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (data: SignUpData) => Promise<AuthResult>;
  updateUser: (patch: Partial<Omit<User, "id" | "email" | "createdAt">>) => void;
  signOut: () => void;
  deleteAccount: () => void;
  /** True for a moment after signing out, so the account guard doesn't ask to sign in again */
  isSigningOut: () => boolean;
  /** Link handler: go straight there when signed in, otherwise ask to sign in first */
  requireAuth: (path: string) => (e?: React.MouseEvent) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Friendlier copy for the drawer than the kit defaults
const AUTH_MESSAGES: Record<string, string> = {
  UNAUTHENTICATED: "That email and password don't match an account.",
  CONFLICT: "An account with this email already exists.",
};

// Session, profile and sign in/out run on the Zcom store (via @zcom/storefront-kit)
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const zcom = useZcomAuth();
  const profile = useProfile();
  const router = useTransitionRouter();
  const toast = useToast();

  const user = useMemo(() => (zcom.isLoggedIn && profile.profile ? toUser(profile.profile) : null), [zcom.isLoggedIn, profile.profile]);
  const isReady = zcom.isReady && (!zcom.isLoggedIn || !!profile.profile || (!profile.loading && !!profile.error));

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginMode, setLoginMode] = useState<AuthMode>("login");
  const [openCount, setOpenCount] = useState(0);
  const pending = useRef<Pick<OpenLoginOptions, "next" | "onSuccess">>({});
  const signingOut = useRef(false);

  const openLogin = useCallback(({ mode = "login", next = "/account", onSuccess }: OpenLoginOptions = {}) => {
    pending.current = { next, onSuccess };
    setLoginMode(mode);
    setOpenCount((n) => n + 1);
    setIsLoginOpen(true);
  }, []);

  const closeLogin = useCallback(() => {
    pending.current = {};
    setIsLoginOpen(false);
  }, []);

  // Shared tail of sign in / sign up: load the profile, close the drawer, carry on where they were headed
  const complete = useCallback(async (): Promise<AuthResult> => {
    const { data } = await profile.refetch();
    const account = data?.getMyProfile ? toUser(data.getMyProfile) : null;
    if (!account) return { ok: false, error: "Signed in, but your profile couldn't be loaded. Please refresh." };
    const { next, onSuccess } = pending.current;
    pending.current = {};
    setIsLoginOpen(false);
    onSuccess?.();
    if (next) router.push(next);
    return { ok: true, user: account };
  }, [profile, router]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      try {
        await zcom.login(email, password);
        return await complete();
      } catch (error) {
        return { ok: false, error: getErrorMessage(error, AUTH_MESSAGES) };
      }
    },
    [zcom, complete],
  );

  const signUp = useCallback(
    async ({ password, ...data }: SignUpData): Promise<AuthResult> => {
      try {
        await zcom.signup({
          email: data.email.trim(),
          password,
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          phoneNumber: data.phone,
          countryCode: toDialCode(data.phoneCountry),
          acceptsMarketing: true,
        });
        return await complete();
      } catch (error) {
        return { ok: false, error: getErrorMessage(error, AUTH_MESSAGES) };
      }
    },
    [zcom, complete],
  );

  const updateUser = useCallback<AuthContextValue["updateUser"]>(
    (patch) => {
      if (!user) return;
      const next = { ...user, ...patch };
      profile
        .update({
          firstName: next.firstName,
          lastName: next.lastName,
          phoneNumber: next.phone,
          countryCode: toDialCode(next.phoneCountry),
          emailSubscribedStatus: next.marketingEmails ? 1 : 0,
        })
        .catch((error) => toast.error(getErrorMessage(error)));
    },
    [user, profile, toast],
  );

  const signOut = useCallback(() => {
    signingOut.current = true;
    setTimeout(() => (signingOut.current = false), 1500);
    router.push("/");
    void zcom.logout();
    toast.info("You've been signed out");
  }, [router, toast, zcom]);

  // The store can't delete accounts from the website yet — the team handles it on request
  const deleteAccount = useCallback(() => {
    toast.info("To delete your account, please contact us and we'll take care of it.");
    router.push("/contact");
  }, [router, toast]);

  const isSigningOut = useCallback(() => signingOut.current, []);

  const requireAuth = useCallback(
    (path: string) => (e?: React.MouseEvent) => {
      if (zcom.isLoggedIn) return; // let the link navigate
      e?.preventDefault();
      openLogin({ next: path });
    },
    [openLogin, zcom.isLoggedIn],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isReady,
      isLoginOpen,
      openCount,
      loginMode,
      setLoginMode,
      openLogin,
      closeLogin,
      signIn,
      signUp,
      updateUser,
      signOut,
      deleteAccount,
      isSigningOut,
      requireAuth,
    }),
    [user, isReady, isLoginOpen, openCount, loginMode, openLogin, closeLogin, signIn, signUp, updateUser, signOut, deleteAccount, isSigningOut, requireAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};

