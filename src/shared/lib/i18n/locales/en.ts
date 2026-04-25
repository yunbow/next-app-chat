import type { Translations } from "./ja";

export const en: Translations = {
  // Metadata (for SEO)
  metadata: {
    siteTitle: "Chat - Real-time Chat",
    siteDescription: "Real-time chat application for instant messaging",
  },

  // Common
  common: {
    search: "Search...",
    login: "Login",
    logout: "Logout",
    register: "Sign Up",
    cancel: "Cancel",
    or: "or",
    view: "View",
    nameNotSet: "No Name",
    getStarted: "Get Started",
    submitting: "Submitting...",
    loading: "Loading...",
    appName: "Chat",
  },

  // Theme
  theme: {
    light: "Light",
    dark: "Dark",
    system: "System",
  },

  // Language
  language: {
    ja: "日本語",
    en: "English",
  },

  // Navigation
  nav: {
    home: "Home",
    dashboard: "Dashboard",
    chats: "Chats",
    friends: "Friends",
    groups: "Groups",
    createGroup: "Create Group",
    notifications: "Notifications",
    profile: "Profile",
    settings: "Settings",
    expand: "Expand",
    collapse: "Collapse",
    unreadNotifications: "{count} unread notifications",
  },

  // Accessibility
  accessibility: {
    showPassword: "Show password",
    hidePassword: "Hide password",
    switchLanguage: "Switch language",
    switchTheme: "Switch theme",
    required: "Required",
    homeLink: "Back to home",
    footerNavigation: "Footer navigation",
    skipToContent: "Skip to main content",
    userMenu: "User menu",
    mobileNavigation: "Mobile navigation",
    selectLanguage: "Select language",
    selectTheme: "Select theme",
    selectFontSize: "Select font size",
    selectColorVision: "Select color vision mode",
  },

  // Footer
  footer: {
    terms: "Terms of Service",
    privacy: "Privacy Policy",
    cookies: "Cookie Policy",
    about: "About",
    copyright: "© 2026 Chat. All rights reserved.",
  },

  // Login
  login: {
    title: "Login",
    description: "Sign in to your account",
    email: "Email",
    emailPlaceholder: "email@example.com",
    password: "Password",
    submit: "Login",
    submitting: "Logging in...",
    noAccount: "Don't have an account?",
    invalidCredentials: "Invalid email or password",
    failed: "Login failed",
    continueWithGoogle: "Continue with Google",
    continueWithGithub: "Continue with GitHub",
  },

  // Registration
  registration: {
    success: "Registration complete. Please log in.",
    failed: "Registration failed",
    submitting: "Registering...",
    complete: "Complete registration",
    sendEmail: "Send registration email",
    sending: "Sending...",
    title: "Sign Up",
    description: "Fill in your details to get started",
    name: "Name",
    namePlaceholder: "Your display name",
    passwordPlaceholder: "At least 6 characters",
    emailSent: "Verification email sent",
    emailSentDescription: "Click the link in the email to complete your registration.",
    devPreview: "Development: Email preview",
    devTo: "To",
    devSubject: "Subject",
    devBody: "Body",
    devBodyText: "Thank you for registering with Chat. Click the link below to complete your registration.",
    devLinkValid: "This link is valid for 24 hours.",
    backToLogin: "Back to login",
    alreadyHaveAccount: "Already have an account?",
    termsAgreePrefix: "By creating an account, you agree to the ",
    termsConnector: " and ",
    termsIncludingCookie: " (including {cookie})",
    termsAgreeSuffix: ".",
    termsLink: "Terms of Service",
    privacyLink: "Privacy Policy",
    cookieLink: "Cookie use",
  },

  // Landing Page
  landing: {
    hero: {
      badge: "Real-time chat app",
      title: "Chat",
      subtitle: "A focused workspace for direct messages, group conversations, notifications, and image sharing that keeps daily communication moving.",
      cta: "Get started for free",
      secondaryCta: "Login",
      statRealtime: "Instant",
      statRealtimeLabel: "message delivery",
      statModes: "DM / Group",
      statModesLabel: "conversation modes",
      statSecure: "Light / Dark",
      statSecureLabel: "theme support",
    },
    features: {
      title: "What you can do with Chat",
      subtitle: "Chat keeps conversations, people, and notifications easy to scan so you can return to what matters quickly.",
      realtime: {
        title: "Real-time Communication",
        description: "Instant message delivery for smooth chat experience",
      },
      group: {
        title: "Group Chat",
        description: "Create and manage group chats with multiple people",
      },
      dm: {
        title: "Direct Messages",
        description: "Private one-on-one messaging",
      },
      notification: {
        title: "Notifications",
        description: "Never miss important messages with our notification system",
      },
    },
    workflow: {
      title: "From first message to follow-up in one flow",
      subtitle: "Find people, start conversations, and return through unread states and notifications.",
      step1Title: "Find the right people",
      step1Description: "Use friends to organize who you talk with and reach the right person quickly.",
      step2Title: "Keep the conversation moving",
      step2Description: "Switch between DMs and group chats, with image messages when text is not enough.",
      step3Title: "Catch what changed",
      step3Description: "Unread states and notifications make important updates easier to revisit.",
    },
    trust: {
      title: "Built for everyday use",
      subtitle: "Authentication, responsive UI, and theme controls make Chat practical for repeated daily workflows.",
      securityTitle: "Authenticated accounts",
      securityDescription: "Credentials and OAuth login support user-specific conversations.",
      imageTitle: "Image messages",
      imageDescription: "Share context visually when a plain text message is not enough.",
      themeTitle: "Readable anywhere",
      themeDescription: "Light and dark themes with responsive layouts adapt to your device.",
    },
    cta: {
      title: "Give every conversation a clear place",
      description: "From personal DMs to team group chats, Chat keeps communication organized in one app.",
    },
  },

  // Cookie Consent
  cookieConsent: {
    message: "We use cookies to improve our service. By clicking 'Accept', you agree to our use of cookies.",
    accept: "Accept",
    decline: "Decline",
  },

  // Logout
  logout: {
    title: "Logout",
    confirm: "Are you sure you want to logout?",
  },

  // Settings
  settings: {
    title: "Settings",
    appearance: "Appearance",
    appearanceDescription: "Language and theme settings",
    language: "Display Language",
    languageDescription: "Select display language",
    theme: "Theme",
    themeDescription: "Light, dark, or system preference",
    fontSize: "Font Size",
    fontSizeDescription: "Adjust text size",
    fontSizeSmall: "Small",
    fontSizeMedium: "Medium",
    fontSizeLarge: "Large",
    colorVision: "Visual Support",
    colorVisionDescription: "Display for color vision characteristics",
    colorVisionNormal: "Normal",
    colorVisionProtanopia: "Protanopia (Red)",
    colorVisionDeuteranopia: "Deuteranopia (Green)",
    colorVisionTritanopia: "Tritanopia (Blue)",
    account: "Account Information",
    accountDescription: "Email, user ID, and account deletion",
    loginHistory: "Login History",
    loginHistoryDescription: "View recent login history",
    changePassword: "Change Password",
    changePasswordDescription: "Change your password",
    subscription: "Subscription",
    subscriptionDescription: "Manage your current plan and billing",
  },

  billing: {
    title: "Subscription",
    currentPlan: "Current Plan",
    upgrade: "Upgrade",
    downgrade: "Downgrade",
    manage: "Manage Plan",
    currentBadge: "Current Plan",
    renewsAt: "Renews on {date}",
    cancelAt: "Cancels on {date}",
    successMessage: "Your subscription has been updated",
    canceledMessage: "Subscription change was canceled",
    freePlan: "Free",
    basicPlan: "Basic",
    premiumPlan: "Premium",
    freePlanDescription: "Basic features, completely free",
    basicPlanDescription: "More features and storage",
    premiumPlanDescription: "All features with no limits",
    freePlanPrice: "Free",
    basicPlanPrice: "$9/mo",
    premiumPlanPrice: "$19/mo",
    redirecting: "Redirecting to checkout...",
    portalError: "Failed to open billing portal",
    checkoutError: "Failed to start checkout",
  },
};
