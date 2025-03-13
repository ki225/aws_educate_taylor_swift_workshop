// import { Authenticator } from '@aws-amplify/ui-react';
// import type { Schema } from '../../amplify/data/resource';
// import { Amplify } from 'aws-amplify';
// import '@aws-amplify/ui-react/styles.css';
// import outputs from '../../amplify_outputs.json';
// import { AIConversation, createAIHooks } from '@aws-amplify/ui-react-ai';
// Amplify.configure(outputs);

// // const client = generateClient<Schema>();

// const { useAIConversation } = createAIHooks

// export default function Page() {
//     return <h1>Hello, Next.js!</h1>
//   }

'use client'
import { Authenticator } from "@aws-amplify/ui-react";
import { AIConversation } from '@aws-amplify/ui-react-ai';
import { useAIConversation } from "../client";

export default function Page() {
  const [
    {
      data: { messages },
      isLoading,
    },
    handleSendMessage,
  ] = useAIConversation('chat');
  // 'chat' is based on the key for the conversation route in your schema.

  return (
    <Authenticator>
      <AIConversation
        messages={messages}
        isLoading={isLoading}
        handleSendMessage={handleSendMessage}
      />
    </Authenticator>
  );
}