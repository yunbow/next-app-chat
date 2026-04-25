import { MessageSquare, Shield, Users, Zap } from "lucide-react";

export const metadata = {
  title: "About",
};

export default function AboutPage() {
  const features = [
    {
      icon: MessageSquare,
      title: "リアルタイムチャット",
      description: "グループチャットやダイレクトメッセージで、リアルタイムにコミュニケーション。",
    },
    {
      icon: Users,
      title: "フレンド管理",
      description: "フレンドリクエストやブロック機能で、つながりを管理。",
    },
    {
      icon: Shield,
      title: "セキュリティ",
      description: "暗号化通信とCSRF対策で、安全なコミュニケーションを提供。",
    },
    {
      icon: Zap,
      title: "高速・軽量",
      description: "最新のWeb技術を活用した、高速で快適な操作体験。",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4">Chat について</h1>
      <p className="text-muted-foreground mb-8">
        Chatは、Next.js 14で構築されたモダンなリアルタイムチャットアプリケーションです。
        グループチャット、ダイレクトメッセージ、フレンド管理、通知機能を備えています。
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {features.map((feature) => (
          <div key={feature.title} className="rounded-lg border p-4">
            <feature.icon className="h-8 w-8 text-primary mb-3" />
            <h2 className="text-lg font-semibold mb-1">{feature.title}</h2>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
