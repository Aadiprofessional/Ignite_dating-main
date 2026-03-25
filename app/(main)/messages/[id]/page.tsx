import { ChatPageClient } from "@/components/chat/ChatPageClient";

type ChatPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function ChatPage({ params }: ChatPageProps) {
  const { id } = await params;
  return <ChatPageClient id={id} />;
}
