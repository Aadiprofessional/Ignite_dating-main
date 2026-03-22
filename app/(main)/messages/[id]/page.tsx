import { ChatPageClient } from "@/components/chat/ChatPageClient";
import { mockMatches } from "@/lib/mockMatches";

type ChatPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return mockMatches.map((match) => ({ id: match.id }));
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { id } = await params;
  return <ChatPageClient id={id} />;
}
