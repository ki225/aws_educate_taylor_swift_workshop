"use client";

import { ConversationsContext } from "@/providers/ConversationsProvider";
import { Button } from "@aws-amplify/ui-react";
import { useRouter } from "next/navigation";
import * as React from "react";

export const CreateChat = () => {
  const router = useRouter();
  const { createConversation } = React.useContext(ConversationsContext);

  const handleClick = async () => {
    const conversation = await createConversation();
    if (conversation) {
      router.push(`/chat/${conversation.id}`);
    }
  };
  return <Button onClick={handleClick}>Create chat</Button>;
};