"use client";
import { ConversationsContext } from "@/providers/ConversationsProvider";
import { Flex, ScrollView } from "@aws-amplify/ui-react";
import * as React from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { ConversationItem } from "./ConversationItem";

export const Sidebar = ({ children }: React.PropsWithChildren) => {
  const { conversations } = React.useContext(ConversationsContext);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <Flex direction="row" height="100%">
      <div
        className={`relative transition-all duration-300 ${
          isCollapsed ? "w-14" : "w-80"
        }`}
        style={{ overflow: "hidden" }}
      >
        <Flex direction="column" height="100%">
          <Flex
            direction="row"
            justifyContent="space-between"
            paddingTop="small"
            paddingRight="small"
          >
            {!isCollapsed && (
              <div className="text-xl font-bold px-4 text-gray-700 dark:text-white">
                The AI Tour
              </div>
            )}
            <button
              className="p-2 ml-3 rounded-full hover:bg-[#f7d6b5] dark:hover:bg-gray-500"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <LuChevronRight className="dark:text-white" />
              ) : (
                <LuChevronLeft className="dark:text-white" />
              )}
            </button>
          </Flex>

          {!isCollapsed && (
            <>
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
            </>
          )}
        </Flex>
      </div>
    </Flex>
  );
};
