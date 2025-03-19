"use client";
import { ConversationsContext } from "@/providers/ConversationsProvider";
import { Flex, ScrollView } from "@aws-amplify/ui-react";
import * as React from "react";
import { ConversationItem } from "./ConversationItem";

export const Sidebar = ({ children }: React.PropsWithChildren) => {
  const { conversations } = React.useContext(ConversationsContext);

  return (
    <Flex direction="column" height="100%">
      <ScrollView flex="1">
        <Flex direction="column" padding="medium">
          {conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
            />
          ))}
        </Flex>
      </ScrollView>
      <Flex direction="row" padding="large">
        {children}
      </Flex>
    </Flex>
  );
};