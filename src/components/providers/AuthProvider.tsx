"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { useTransitionRouter } from "next-view-transitions";
import type { CountryCode } from "libphonenumber-js";
import { useToast } from "@/components/providers/ToastProvider";
import {
  accountsStore,
  addressesStore,
  emailKey,
  newId,
  ordersStore,
  sessionStore,
  wishlistsStore,
} from "@/lib/accountStore";
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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const user = sessionStore.useValue();
  const router = useTransitionRouter();
  const toast = useToast();

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

  // Shared tail of sign in / sign up: store the session, close the drawer, carry on where they were headed
  const complete = useCallback(
    (account: User) => {
      sessionStore.write(() => account);
      const { next, onSuccess } = pending.current;
      pending.current = {};
      setIsLoginOpen(false);
      onSuccess?.();
      if (next) router.push(next);
    },
    [router],
  );

  // TODO: replace with the auth API. Demo: any password works for an account created on this device.
  const signIn = useCallback(
    async (email: string, _password: string): Promise<AuthResult> => {
      const account = accountsStore.read()[emailKey(email)];
      if (!account) return { ok: false, error: "We couldn't find an account with that email." };
      complete(account);
      return { ok: true, user: account };
    },
    [complete],
  );

  // TODO: replace with the auth API — the password is sent there and never kept in the browser
  const signUp = useCallback(
    async ({ password: _password, ...data }: SignUpData): Promise<AuthResult> => {
      const key = emailKey(data.email);
      if (accountsStore.read()[key]) return { ok: false, error: "An account with this email already exists." };

      const account: User = {
        ...data,
        id: newId(),
        email: key,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        createdAt: new Date().toISOString(),
        marketingEmails: true,
        smsUpdates: false,
      };
      accountsStore.write((all) => ({ ...all, [key]: account }));
      complete(account);
      return { ok: true, user: account };
    },
    [complete],
  );

  const updateUser = useCallback<AuthContextValue["updateUser"]>((patch) => {
    const current = sessionStore.read();
    if (!current) return;
    const updated = { ...current, ...patch };
    sessionStore.write(() => updated);
    accountsStore.write((all) => ({ ...all, [current.email]: updated }));
  }, []);

  const signOut = useCallback(() => {
    signingOut.current = true;
    setTimeout(() => (signingOut.current = false), 1500);
    router.push("/");
    sessionStore.write(() => null);
    toast.info("You've been signed out");
  }, [router, toast]);

  const deleteAccount = useCallback(() => {
    const current = sessionStore.read();
    if (!current) return;
    const drop = <T,>(all: Record<string, T>) => {
      const { [current.email]: _removed, ...rest } = all;
      return rest;
    };
    accountsStore.write(drop);
    ordersStore.write(drop);
    addressesStore.write(drop);
    wishlistsStore.write(drop);
    signingOut.current = true;
    setTimeout(() => (signingOut.current = false), 1500);
    router.push("/");
    sessionStore.write(() => null);
    toast.info("Your account has been deleted");
  }, [router, toast]);

  const isSigningOut = useCallback(() => signingOut.current, []);

  const requireAuth = useCallback(
    (path: string) => (e?: React.MouseEvent) => {
      if (sessionStore.read()) return; // let the link navigate
      e?.preventDefault();
      openLogin({ next: path });
    },
    [openLogin],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
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
    [user, isLoginOpen, openCount, loginMode, openLogin, closeLogin, signIn, signUp, updateUser, signOut, deleteAccount, isSigningOut, requireAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
