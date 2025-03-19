"use client";
import {
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  TextField,
  View,
} from "@aws-amplify/ui-react";
import * as React from "react";
import { LuCheck, LuMenu, LuPencil, LuTrash2, LuX } from "react-icons/lu";

import { Conversation } from "@/client";
import { ConversationsContext } from "@/providers/ConversationsProvider";
import Link from "next/link";
import { useParams } from "next/navigation";

interface FormElements extends HTMLFormControlsCollection {
  conversationName: HTMLInputElement;
}
interface ConversationFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

export const ConversationItem = ({
  conversation,
}: {
  conversation: Conversation;
}) => {
  const { deleteConversation, updateConversation } =
    React.useContext(ConversationsContext);
  const [editing, setEditing] = React.useState(false);
  const { id } = useParams();

  const handleSubmit = (e: React.FormEvent<ConversationFormElement>) => {
    e.preventDefault();
    updateConversation({
      ...conversation,
      name: e.currentTarget.elements.conversationName.value,
    });
    setEditing(false);
  };

  return (
    <div
      className={`relative group px-3 py-2 rounded-lg text-sm hover:bg-gray-200 ${
        conversation.id === id ? "bg-gray-300 font-medium" : ""
      }`}
    >
      <Flex direction="row" key={conversation.id} alignItems="center">
        <Flex direction="column" flex="1">
          {editing ? (
            <View as="form" onSubmit={handleSubmit}>
              <TextField
                label="Conversation name"
                name="conversationName"
                labelHidden
                defaultValue={conversation.name}
                variation="quiet"
                innerEndComponent={
                  <>
                    <Button
                      size="small"
                      onClick={() => {
                        setEditing(false);
                      }}
                      variation="link"
                    >
                      <LuX />
                    </Button>
                    <Button size="small" type="submit" variation="link">
                      <LuCheck />
                    </Button>
                  </>
                }
              />
            </View>
          ) : (
            <Link href={`/chat/${conversation.id}`}>
              {conversation.name ?? "A Conversation Start!"}
            </Link>
          )}
        </Flex>
        <div className="h-3 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            <Menu
              size="small"
              trigger={
                <MenuButton size="small" border="InactiveBorder">
                  <LuMenu />
                </MenuButton>
              }
            >
              <MenuItem gap="xs" onClick={() => setEditing(!editing)}>
                <LuPencil />
                <span>Rename</span>
              </MenuItem>
              <MenuItem
                gap="xs"
                onClick={() => deleteConversation({ id: conversation.id })}
              >
                <LuTrash2 />
                <span>Delete</span>
              </MenuItem>
            </Menu>
          </div>
        </div>
      </Flex>
    </div>
  );
};