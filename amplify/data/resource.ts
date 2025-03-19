import { type ClientSchema, a, defineData, defineFunction } from '@aws-amplify/backend';
import { BusinessAnalyzer } from '../functions/BusinessAnalyzer/resource';

export const getWeather = defineFunction({
  name: 'getWeather',
  entry: './getWeather.ts'
})

const systemPrompt = `You are an intelligent assistant that determines if a user's input is relevant to a business scenario.
        Follow these strict rules:
        - If the input is related to business topics (e.g., finance, sales, marketing, management), call "BusinessAnalyzer".
        - If the input is unrelated (e.g., casual chat, personal topics, general knowledge), respond with "This message is unrelated." and do NOT call any tools.
        - You MUST classify the message correctly before deciding whether to call the tool.
        - Always be accurate and strict in classification.`

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any unauthenticated user can "create", "read", "update", 
and "delete" any "Todo" records.
=========================================================================*/
const schema = a.schema({
  // Todo: a
  //   .model({
  //     content: a.string(),
  //   })
  //   .authorization((allow) => [allow.guest()]),

  chatNamer: a
    .generation({
      aiModel: a.ai.model("Claude 3 Haiku"),
      systemPrompt: `You are a helpful assistant that writes descriptive names for conversations. Names should be 2-10 words long`,
    })
    .arguments({
      content: a.string(),
    })
    .returns(
      a.customType({
        name: a.string(),
      })
    )
    .authorization((allow) => [allow.authenticated()]),
  
    chat: a.conversation({
        aiModel: a.ai.model("Claude 3 Sonnet"),
        systemPrompt:JSON.stringify(`You are an intelligent assistant.
        Follow these strict rules:
        - If the input is related to business topics (e.g., finance, sales, marketing, management), call "BusinessAnalyzer".
        - You MUST classify the message correctly before deciding whether to call the tool.
        - Always be accurate and strict in classification.`).slice(1, -1),
        tools: [
          a.ai.dataTool({
            name: "BusinessAnalyzer",
            description: "BusinessAnalyzer is a tool that helps users with business-related tasks.",
            // model: a.ref('Post'),
            // modelOperation: "list",
            query: a.ref('BusinessAnalyzer')
          }),
          a.ai.dataTool({
            name: 'getWeather',
            query: a.ref('getWeather'),
            description: 'Provide the current weather for the city.'
          })
        ],
      }).authorization((allow) => allow.owner()),

      BusinessAnalyzer: a
      .query()
      .arguments({
        prompt: a.string(),
      })
      .returns(a.string().array())
      .handler(a.handler.function(BusinessAnalyzer))
      .authorization((allow) => [allow.authenticated()]),
      
      getWeather: a
      .query()
      .arguments({ city: a.string()})
      .returns(a.string())
      .handler(a.handler.function(getWeather))
      .authorization((allow) => [allow.authenticated()]),
    });

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    // defaultAuthorizationMode: 'iam',
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
