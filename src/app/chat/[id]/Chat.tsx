"use client";
import { client, useAIConversation } from "@/client";
import BusinessAnalysisCard from "@/components/BusinessAnalysisCard";
import { ConversationsContext } from "@/providers/ConversationsProvider";
import { Avatar, View } from "@aws-amplify/ui-react";
import {
  AIConversation,
  type SendMesageParameters,
} from "@aws-amplify/ui-react-ai";
import * as React from "react";
import ReactMarkdown from "react-markdown";
import { v4 as uuidv4 } from "uuid";

const businessAnalysisCardDescription = `
Displays concert business analysis reports from the BusinessAnalyzer tool.
The 'imageUrl' prop contains a relevant chart/graph url, and 'description' prop contains the complete analysis text.
This component should be used whenever the BusinessAnalyzer tool is invoked.
`;

export const Chat = ({ id }: { id: string }) => {
  const { updateConversation } = React.useContext(ConversationsContext);
  const [initialMessageProcessed, setInitialMessageProcessed] =
    React.useState(false);
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

    if (
      storedMessage &&
      conversation &&
      !initialMessageProcessed &&
      messages.length === 0
    ) {
      const message = JSON.parse(storedMessage) as SendMesageParameters;
      sendMessage(message);
      setInitialMessageProcessed(true);
      sessionStorage.removeItem(initialMessageKey);

      // Generate chat name
      if (!conversation.name) {
        client.generations
          .chatNamer({
            content: message.content
              .map((content) => ("text" in content ? content.text ?? "" : ""))
              .join(""),
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
  }, [
    id,
    conversation,
    messages.length,
    sendMessage,
    updateConversation,
    initialMessageProcessed,
  ]);

  React.useEffect(() => {
    const subscription = client.subscriptions
      .receiveResult({ sessionId: id })
      .subscribe({
        next: (data) => {
          console.log("receive result", data)
          if (data) {
            console.log("data!")
            const message =
              "請直接輸出 AMPLIFY_UI_tool JSON 格式，使用下列資料 render：" +
              "imageUrl:" +
              data.imageUrl +
              "description" +
              data.description;
            sendMessage(message as unknown as SendMesageParameters);
          }
        },
        error: (error) => {
          console.log("Sbuscription failed...", error)
        }
      });

    return () => subscription.unsubscribe();
  }, [id, client, sendMessage]);

  const handleNewMessage = (message: SendMesageParameters) => {
    sendMessage(message);

    // const messageWithSessionId = {
    //   ...message,
    //   sessionId: id, // 把 sessionId 加到訊息中
    // };

    // sendMessage(messageWithSessionId);

    // Generate name for first user message if not already named
    if (!conversation?.name && messages.length === 0) {
      client.generations
        .chatNamer({
          content: message.content
            .map((content) => ("text" in content ? content.text ?? "" : ""))
            .join(""),
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
        // allowAttachments
        messages={messages}
        handleSendMessage={handleNewMessage}
        isLoading={isLoading}
        aiContext={() => {
          return {
            sessionId: id,
          };
        }}
        messageRenderer={{
          text: ({ text }) => (
            <div className="dark:text-gray-200">
              <ReactMarkdown>{text}</ReactMarkdown>
            </div>
          ),
        }}
        avatars={{
          user: {
            avatar: <Avatar src="/images/user.png" />,
            username: "Swifties",
          },
          ai: {
            avatar: <Avatar src="/images/ai.png" />,
            username: "The AI Tour Assistant",
          },
        }}
        responseComponents={{
          BusinessAnalysis: {
            description: businessAnalysisCardDescription,
            props: {
              imageUrl: { type: "string" },
              description: { type: "string" },
            },
            component: (props) => <BusinessAnalysisCard {...props} />,
          },
        }}
      />
    </View>
  );
};

export function useBusinessAnalysisSubscription({ id, setMessages }) {
  React.useEffect(() => {
    const subscription = client.subscriptions
      .receiveResult({ sessionId: id })
      .subscribe({
        next: (data) => {
          const result = data;
          if (result) {
            const newAIMessage = {
              id: uuidv4(),
              type: "ai",
              component: {
                componentName: "BusinessAnalysis",
                props: {
                  imageUrl: result.imageUrl,
                  description: result.description,
                },
              },
            };
            setMessages((prev) => [...prev, newAIMessage]);
          }
        },
        error: (err) => {
          console.error("Subscription error:", err);
        },
      });

    return () => subscription.unsubscribe();
  }, [id, setMessages]);
}