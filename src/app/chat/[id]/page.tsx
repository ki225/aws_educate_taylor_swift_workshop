import { Chat } from "./Chat";

export default async function ChatPage({ params }: { params: { id: string } }) {
  return <Chat id={params.id} />;
}