"use client";
import { ConversationsProvider } from "@/providers/ConversationsProvider";
import { Authenticator, Flex } from "@aws-amplify/ui-react";
import * as React from "react";

export const Layout = ({ children }: React.PropsWithChildren) => {
  return (
    <Authenticator>
      <ConversationsProvider>
        <Flex direction="row" width="100vw" height="100vh" overflow="hidden">
          {children}
        </Flex>
      </ConversationsProvider>
    </Authenticator>
  );
};