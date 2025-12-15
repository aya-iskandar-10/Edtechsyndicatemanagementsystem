import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  projectId,
  publicAnonKey,
} from "./utils/supabase/info";
import { LandingPage } from "./components/LandingPage";
import { ApplicationForm } from "./components/ApplicationForm";
import { MemberDashboard } from "./components/MemberDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { AuthModal } from "./components/AuthModal";
import { AdminSetup } from "./components/AdminSetup";
import { QuickTest } from "./components/QuickTest";

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey,
);

type View = "landing" | "application" | "member" | "admin";

export default function App() {
  const [currentView, setCurrentView] =
    useState<View>("landing");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(
    null,
  );
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">(
    "signin",
  );
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      setIsAuthenticated(true);
      setUserId(session.user.id);
      setAccessToken(session.access_token);

      // Check if user is admin
      const isAdminUser =
        session.user.user_metadata?.role === "admin";
      setIsAdmin(isAdminUser);

      // Check if user has an application
      if (!isAdminUser) {
        await checkUserApplication(session.user.id);
      }
    }
    setInitializing(false);
  };

  const checkUserApplication = async (uid: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-71a69640/application/${uid}`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        },
      );

      if (response.ok) {
        setCurrentView("member");
      }
    } catch (error) {
      console.error("Error checking application:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUserId(null);
    setAccessToken(null);
    setCurrentView("landing");
  };

  const handleApply = () => {
    if (!isAuthenticated) {
      setAuthMode("signup");
      setShowAuthModal(true);
    } else {
      setCurrentView("application");
    }
  };

  const handleSignIn = () => {
    setAuthMode("signin");
    setShowAuthModal(true);
  };

  const handleAuthSuccess = async (
    token: string,
    uid: string,
  ) => {
    setIsAuthenticated(true);
    setUserId(uid);
    setAccessToken(token);
    setShowAuthModal(false);

    // Check if admin or has application
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const isAdminUser =
      session?.user?.user_metadata?.role === "admin";
    setIsAdmin(isAdminUser);

    if (!isAdminUser && authMode === "signup") {
      setCurrentView("application");
    } else if (!isAdminUser) {
      await checkUserApplication(uid);
    }
  };

  const handleApplicationSubmitted = () => {
    setCurrentView("member");
  };

  const handleAdminAccess = () => {
    if (!isAuthenticated) {
      setAuthMode("signin");
      setShowAuthModal(true);
    } else if (isAdmin) {
      setCurrentView("admin");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {currentView === "landing" && (
        <LandingPage
          onApply={handleApply}
          onSignIn={handleSignIn}
          onAdminAccess={handleAdminAccess}
          isAuthenticated={isAuthenticated}
          isAdmin={isAdmin}
          onSignOut={handleSignOut}
        />
      )}

      {currentView === "application" && (
        <ApplicationForm
          userId={userId!}
          accessToken={accessToken!}
          onSubmitted={handleApplicationSubmitted}
          onBack={() => setCurrentView("landing")}
        />
      )}

      {currentView === "member" && (
        <MemberDashboard
          userId={userId!}
          accessToken={accessToken!}
          onBack={() => setCurrentView("landing")}
          onSignOut={handleSignOut}
        />
      )}

      {currentView === "admin" && (
        <AdminDashboard
          accessToken={accessToken!}
          onBack={() => setCurrentView("landing")}
          onSignOut={handleSignOut}
        />
      )}

      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
          supabase={supabase}
        />
      )}

      {/* Admin Setup Instructions */}
      {currentView === "landing" && !isAuthenticated && (
        <AdminSetup />
      )}
      {/* Quick Test Component */}
      {currentView === "landing" && <QuickTest />}
    </div>
  );
}