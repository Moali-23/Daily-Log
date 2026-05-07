import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { auth, googleProvider, isFirebaseConfigured } from "./firebase";

export interface AuthState {
  user: User | null;
  loading: boolean;
  isFirebaseConfigured: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: isFirebaseConfigured,
    isFirebaseConfigured,
    error: null,
  });

  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(
      auth,
      (u) => setState((s) => ({ ...s, user: u, loading: false, error: null })),
      (e) => setState((s) => ({ ...s, loading: false, error: e.message }))
    );
    return unsub;
  }, []);

  async function signIn() {
    if (!auth) {
      setState((s) => ({ ...s, error: "Firebase is not configured." }));
      return;
    }
    try {
      setState((s) => ({ ...s, error: null, loading: true }));
      await signInWithPopup(auth, googleProvider);
    } catch (e: any) {
      // Popup blocked or unsupported (e.g. some mobile browsers) → fall back to redirect
      if (
        e?.code === "auth/popup-blocked" ||
        e?.code === "auth/popup-closed-by-user" ||
        e?.code === "auth/cancelled-popup-request" ||
        e?.code === "auth/operation-not-supported-in-this-environment"
      ) {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (e2: any) {
          setState((s) => ({ ...s, error: e2?.message ?? "Sign-in failed", loading: false }));
          return;
        }
      }
      setState((s) => ({ ...s, error: e?.message ?? "Sign-in failed", loading: false }));
    } finally {
      setState((s) => ({ ...s, loading: false }));
    }
  }

  async function signOut() {
    if (!auth) return;
    await fbSignOut(auth);
  }

  return { ...state, signIn, signOut };
}

export type AuthApi = ReturnType<typeof useAuth>;
