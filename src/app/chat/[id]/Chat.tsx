"use client";
import { client, useAIConversation } from "@/client";
import BusinessAnalysisCard from "@/components/BusinessAnalysisCard";
import { ConversationsContext } from "@/providers/ConversationsProvider";
import { Avatar, View } from "@aws-amplify/ui-react";
import {
  AIConversation,
  type SendMesageParameters
} from "@aws-amplify/ui-react-ai";
import * as React from "react";
import ReactMarkdown from "react-markdown";

export const Chat = ({ id }: { id: string }) => {
  const { updateConversation } = React.useContext(ConversationsContext);
  const [initialMessageProcessed, setInitialMessageProcessed] = React.useState(false);
  const [
    {
      data: { messages, conversation },
      isLoading,
    },
    sendMessage,
  ] = useAIConversation("chat", { id });

  // Send initial message when component mounts
  React.useEffect(() => {
    const initialMessageKey = `initial_message_${id}`;
    const storedMessage = sessionStorage.getItem(initialMessageKey);

    if (storedMessage && conversation && !initialMessageProcessed && messages.length === 0) {
      const message = JSON.parse(storedMessage) as SendMesageParameters;
      sendMessage(message);
      setInitialMessageProcessed(true);
      sessionStorage.removeItem(initialMessageKey);

      // Generate chat name
      if (!conversation.name) {
        client.generations
          .chatNamer({
            content: message.content.map((content) =>
              'text' in content ? content.text ?? "" : ""
            ).join(""),
          })
          .then((res) => {
            if (res.data?.name) {
              updateConversation({
                id,
                name: res.data.name,
              });
            }
          });
      }
    }
  }, [id, conversation, messages.length, sendMessage, updateConversation, initialMessageProcessed]);

  const handleNewMessage = (message: SendMesageParameters) => {
    sendMessage(message);
    
    // Generate name for first user message if not already named
    if (!conversation?.name && messages.length === 0) {
      client.generations
        .chatNamer({
          content: message.content.map((content) =>
            'text' in content ? content.text ?? "" : ""
          ).join(""),
        })
        .then((res) => {
          if (res.data?.name) {
            updateConversation({
              id,
              name: res.data.name,
            });
          }
        });
    }
  };

  return (
    <View padding="large" flex="1">
      <AIConversation
        allowAttachments
        messages={messages}
        handleSendMessage={handleNewMessage}
        isLoading={isLoading}
        messageRenderer={{
          text: ({ text }) => <ReactMarkdown>{text}</ReactMarkdown>,
        }}
        avatars={{
          user: {
            avatar: <Avatar src="/images/user.png" />,
            username: "Swifties",
          },
          ai: {
            avatar: <Avatar src="/images/ai.png" />,
            username: "The AI Tour Assistant"
          }
        }}
        responseComponents={{
          Weather: {
              description: "UI to display the business analysis report",
              props: {
                  imageUrl: { type: "string" },
                  description: { type: "string" },
              },
              component: (props) => ( <BusinessAnalysisCard {...props}/> )
          }
      }}
      />
    </View>
  );
};