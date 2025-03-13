import { Chat } from "./Chat";

// export default function ChatPage({ params }: { params: { id: string } }) {
//   return <Chat id={params.id} />;
// }

export default function ChatPage(props: any) {
  const { params } = props as { params: { id: string } };
  return <Chat id={params.id} />;
}