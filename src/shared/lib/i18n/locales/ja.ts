export type Translations = {
  metadata: {
    siteTitle: string;
    siteDescription: string;
  };
  common: {
    search: string;
    login: string;
    logout: string;
    register: string;
    cancel: string;
    or: string;
    view: string;
    nameNotSet: string;
    getStarted: string;
    submitting: string;
    loading: string;
    appName: string;
  };
  theme: {
    light: string;
    dark: string;
    system: string;
  };
  language: {
    ja: string;
    en: string;
  };
  nav: {
    home: string;
    dashboard: string;
    chats: string;
    friends: string;
    groups: string;
    createGroup: string;
    notifications: string;
    profile: string;
    settings: string;
    expand: string;
    collapse: string;
    unreadNotifications: string;
  };
  accessibility: {
    showPassword: string;
    hidePassword: string;
    switchLanguage: string;
    switchTheme: string;
    required: string;
    homeLink: string;
    footerNavigation: string;
    skipToContent: string;
    userMenu: string;
    mobileNavigation: string;
    selectLanguage: string;
    selectTheme: string;
    selectFontSize: string;
    selectColorVision: string;
  };
  footer: {
    terms: string;
    privacy: string;
    cookies: string;
    about: string;
    copyright: string;
  };
  login: {
    title: string;
    description: string;
    email: string;
    emailPlaceholder: string;
    password: string;
    submit: string;
    submitting: string;
    noAccount: string;
    invalidCredentials: string;
    failed: string;
    continueWithGoogle: string;
    continueWithGithub: string;
  };
  registration: {
    success: string;
    failed: string;
    submitting: string;
    complete: string;
    sendEmail: string;
    sending: string;
    title: string;
    description: string;
    name: string;
    namePlaceholder: string;
    passwordPlaceholder: string;
    emailSent: string;
    emailSentDescription: string;
    devPreview: string;
    devTo: string;
    devSubject: string;
    devBody: string;
    devBodyText: string;
    devLinkValid: string;
    backToLogin: string;
    alreadyHaveAccount: string;
    termsAgreePrefix: string;
    termsConnector: string;
    termsIncludingCookie: string;
    termsAgreeSuffix: string;
    termsLink: string;
    privacyLink: string;
    cookieLink: string;
  };
  landing: {
    hero: {
      badge: string;
      title: string;
      subtitle: string;
      cta: string;
      secondaryCta: string;
      statRealtime: string;
      statRealtimeLabel: string;
      statModes: string;
      statModesLabel: string;
      statSecure: string;
      statSecureLabel: string;
    };
    features: {
      title: string;
      subtitle: string;
      realtime: {
        title: string;
        description: string;
      };
      group: {
        title: string;
        description: string;
      };
      dm: {
        title: string;
        description: string;
      };
      notification: {
        title: string;
        description: string;
      };
    };
    workflow: {
      title: string;
      subtitle: string;
      step1Title: string;
      step1Description: string;
      step2Title: string;
      step2Description: string;
      step3Title: string;
      step3Description: string;
    };
    trust: {
      title: string;
      subtitle: string;
      securityTitle: string;
      securityDescription: string;
      imageTitle: string;
      imageDescription: string;
      themeTitle: string;
      themeDescription: string;
    };
    cta: {
      title: string;
      description: string;
    };
  };
  cookieConsent: {
    message: string;
    accept: string;
    decline: string;
  };
  logout: {
    title: string;
    confirm: string;
  };
  settings: {
    title: string;
    appearance: string;
    appearanceDescription: string;
    language: string;
    languageDescription: string;
    theme: string;
    themeDescription: string;
    fontSize: string;
    fontSizeDescription: string;
    fontSizeSmall: string;
    fontSizeMedium: string;
    fontSizeLarge: string;
    colorVision: string;
    colorVisionDescription: string;
    colorVisionNormal: string;
    colorVisionProtanopia: string;
    colorVisionDeuteranopia: string;
    colorVisionTritanopia: string;
    account: string;
    accountDescription: string;
    loginHistory: string;
    loginHistoryDescription: string;
    changePassword: string;
    changePasswordDescription: string;
  };
};

export const ja: Translations = {
  // Metadata (for SEO)
  metadata: {
    siteTitle: "Chat - リアルタイムチャット",
    siteDescription: "リアルタイムでメッセージをやり取りできるチャットアプリケーション",
  },

  // Common
  common: {
    search: "検索...",
    login: "ログイン",
    logout: "ログアウト",
    register: "新規登録",
    cancel: "キャンセル",
    or: "または",
    view: "見る",
    nameNotSet: "名前未設定",
    getStarted: "始める",
    submitting: "送信中...",
    loading: "読み込み中...",
    appName: "Chat",
  },

  // Theme
  theme: {
    light: "ライト",
    dark: "ダーク",
    system: "システム",
  },

  // Language
  language: {
    ja: "日本語",
    en: "English",
  },

  // Navigation
  nav: {
    home: "ホーム",
    dashboard: "ダッシュボード",
    chats: "チャット",
    friends: "フレンド",
    groups: "グループ",
    createGroup: "グループ作成",
    notifications: "通知",
    profile: "プロフィール",
    settings: "設定",
    expand: "展開",
    collapse: "折りたたむ",
    unreadNotifications: "{count}件の未読通知",
  },

  // Accessibility
  accessibility: {
    showPassword: "パスワードを表示",
    hidePassword: "パスワードを隠す",
    switchLanguage: "言語を切り替え",
    switchTheme: "テーマを切り替え",
    required: "必須",
    homeLink: "ホームへ戻る",
    footerNavigation: "フッターナビゲーション",
    skipToContent: "メインコンテンツへスキップ",
    userMenu: "ユーザーメニュー",
    mobileNavigation: "モバイルナビゲーション",
    selectLanguage: "言語を選択",
    selectTheme: "テーマを選択",
    selectFontSize: "フォントサイズを選択",
    selectColorVision: "色覚モードを選択",
  },

  // Footer
  footer: {
    terms: "利用規約",
    privacy: "プライバシーポリシー",
    cookies: "Cookieポリシー",
    about: "作成者",
    copyright: "© 2026 Chat. All rights reserved.",
  },

  // Login
  login: {
    title: "ログイン",
    description: "アカウントにログインしてください",
    email: "メールアドレス",
    emailPlaceholder: "email@example.com",
    password: "パスワード",
    submit: "ログイン",
    submitting: "ログイン中...",
    noAccount: "アカウントをお持ちでないですか？",
    invalidCredentials: "メールアドレスまたはパスワードが正しくありません",
    failed: "ログインに失敗しました",
    continueWithGoogle: "Google でログイン",
    continueWithGithub: "GitHub でログイン",
  },

  // Registration
  registration: {
    success: "登録が完了しました。ログインしてください。",
    failed: "登録に失敗しました",
    submitting: "登録中...",
    complete: "登録を完了する",
    sendEmail: "登録メールを送信",
    sending: "送信中...",
    title: "新規登録",
    description: "必要な情報を入力して登録",
    name: "名前",
    namePlaceholder: "表示名を入力",
    passwordPlaceholder: "6文字以上",
    emailSent: "確認メールを送信しました",
    emailSentDescription: "メールに記載されたリンクをクリックして、登録を完了してください。",
    devPreview: "開発環境: メールプレビュー",
    devTo: "宛先",
    devSubject: "件名",
    devBody: "本文",
    devBodyText: "Chatへのご登録ありがとうございます。以下のリンクをクリックして、登録を完了してください。",
    devLinkValid: "このリンクは24時間有効です。",
    backToLogin: "ログインページへ戻る",
    alreadyHaveAccount: "既にアカウントをお持ちですか？",
    termsAgreePrefix: "アカウントを登録することにより、",
    termsConnector: "と",
    termsIncludingCookie: "（{cookie}を含む）",
    termsAgreeSuffix: "に同意したとみなされます。",
    termsLink: "利用規約",
    privacyLink: "プライバシーポリシー",
    cookieLink: "Cookieの使用",
  },

  // Landing Page
  landing: {
    hero: {
      badge: "リアルタイムチャットアプリ",
      title: "Chat",
      subtitle: "グループ、ダイレクトメッセージ、通知、画像共有をひとつにまとめた、日々の会話が進み続けるワークスペース。",
      cta: "無料で始める",
      secondaryCta: "ログイン",
      statRealtime: "即時",
      statRealtimeLabel: "メッセージ配信",
      statModes: "DM / Group",
      statModesLabel: "会話モード",
      statSecure: "Light / Dark",
      statSecureLabel: "テーマ対応",
    },
    features: {
      title: "Chatでできること",
      subtitle: "必要な会話、相手、通知にすぐ戻れるよう、チャット体験をシンプルに整理しています。",
      realtime: {
        title: "リアルタイム通信",
        description: "メッセージが即座に届く、快適なチャット体験",
      },
      group: {
        title: "グループチャット",
        description: "複数人でのグループチャットを作成・管理",
      },
      dm: {
        title: "ダイレクトメッセージ",
        description: "1対1のプライベートなメッセージのやり取り",
      },
      notification: {
        title: "通知機能",
        description: "重要なメッセージを見逃さない通知システム",
      },
    },
    workflow: {
      title: "会話の開始から見逃し防止まで、ひとつの流れで",
      subtitle: "フレンドを見つけ、会話を始め、未読や通知から必要な場所へ戻れます。",
      step1Title: "相手を見つける",
      step1Description: "フレンド機能で会話相手を整理し、必要な人へすぐアクセスできます。",
      step2Title: "会話を進める",
      step2Description: "DMとグループチャットを切り替えながら、画像付きメッセージも送信できます。",
      step3Title: "見逃さない",
      step3Description: "未読管理と通知で、重要な更新をあとから追いやすくします。",
    },
    trust: {
      title: "毎日使うための基本を丁寧に",
      subtitle: "認証、レスポンシブUI、テーマ切り替えを備えた、実用向けのチャットアプリです。",
      securityTitle: "認証つきアカウント",
      securityDescription: "CredentialsとOAuthログインに対応し、利用者ごとの会話を扱えます。",
      imageTitle: "画像メッセージ",
      imageDescription: "テキストだけでは伝わりにくい内容も、画像付きで共有できます。",
      themeTitle: "読みやすい表示",
      themeDescription: "ライト/ダークテーマとレスポンシブUIで、端末に合わせて使えます。",
    },
    cta: {
      title: "会話を、すぐ始められる場所へ",
      description: "個人のDMからチームのグループチャットまで、Chatでまとめて管理できます。",
    },
  },

  // Cookie Consent
  cookieConsent: {
    message: "このサイトでは、サービスの向上のためにCookieを使用しています。Cookieの使用に同意いただける場合は「同意する」をクリックしてください。",
    accept: "同意する",
    decline: "拒否する",
  },

  // Logout
  logout: {
    title: "ログアウト",
    confirm: "ログアウトしますか？",
  },

  // Settings
  settings: {
    title: "設定",
    appearance: "外観",
    appearanceDescription: "表示言語とテーマの設定",
    language: "表示言語",
    languageDescription: "表示言語を選択",
    theme: "テーマ",
    themeDescription: "ライト、ダーク、またはシステム設定",
    fontSize: "フォントサイズ",
    fontSizeDescription: "テキストの大きさを調整",
    fontSizeSmall: "小",
    fontSizeMedium: "中",
    fontSizeLarge: "大",
    colorVision: "視覚サポート",
    colorVisionDescription: "色覚特性に応じた表示",
    colorVisionNormal: "標準",
    colorVisionProtanopia: "1型色覚（赤）",
    colorVisionDeuteranopia: "2型色覚（緑）",
    colorVisionTritanopia: "3型色覚（青）",
    account: "アカウント情報",
    accountDescription: "メールアドレス、ユーザーID、アカウント削除",
    loginHistory: "ログイン履歴",
    loginHistoryDescription: "最近のログイン履歴を確認",
    changePassword: "パスワード変更",
    changePasswordDescription: "パスワードを変更",
  },
};
