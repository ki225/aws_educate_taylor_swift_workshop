import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { BusinessAnalyzer } from "../functions/BusinessAnalyzer/resource";

const systemPrompt = `You are a specialized concert business analyst assistant.

IMPORTANT: For ANY query related to concerts, music events, live performances, tours, shows, music business, event planning, ticket sales, venues, audience demographics, or concert market analysis, you MUST EXCLUSIVELY use the BusinessAnalyzer tool.

When using the BusinessAnalyzer tool:
Just answer: "分析中，請稍後..."

Even if the question seems partially related to concerts or music events, always use the BusinessAnalyzer tool.

Examples of queries that MUST trigger BusinessAnalyzer tool use:
- Questions about concert planning
- Questions about tour locations and strategies
- Questions about concert market trends
- Questions about audience demographics
- Questions about ticket pricing
- Questions about venue selection
- Questions about revenue potential
- Questions about concert industry challenges

If uncertain whether a query relates to concerts or music events, err on the side of using the BusinessAnalyzer tool.`;

// 1. DO NOT modify, summarize, or add to the tool's response
// 2. Present the EXACT response from the tool without any additional commentary
// 3. DO NOT generate your own analysis or add your own insights
// 4. DO NOT apologize for or qualify the tool's response, even if it seems incomplete
// 5. If the tool returns an error, present that error message exactly as received

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

  chat: a
    .conversation({
      aiModel: a.ai.model("Claude 3 Sonnet"),
      systemPrompt: JSON.stringify(systemPrompt).slice(1, -1),
      tools: [
        a.ai.dataTool({
          name: "BusinessAnalyzer",
          description:
            "Analyzes concert business data and provides comprehensive business insights about concerts, tours, music events, and the live performance industry.",
          query: a.ref("BusinessAnalyzer"),
        }),
      ],
    })
    .authorization((allow) => allow.owner()),

  BusinessAnalyzerResponse: a.customType({
    imageUrl: a.string().required(),
    description: a.string().required(),
  }),

  BusinessAnalyzer: a
    .query()
    .arguments({
      sessionId: a.string(),
      prompt: a.string(),
    })
    // .returns(a.ref('BusinessAnalyzerResponse'))
    .handler(a.handler.function(BusinessAnalyzer).async())
    .authorization((allow) => [allow.authenticated()]),

  publishResult: a
    .mutation()
    .arguments({
      sessionId: a.string().required(),
      imageUrl: a.string().required(),
      description: a.string().required(),
    })
    // .returns(a.ref("BusinessAnalyzerResponse"))
    .returns(
      a.customType({
        imageUrl: a.string().required(),
        description: a.string().required(),
      })
    )
    .handler(a.handler.custom({ entry: "./publish.js" }))
    .authorization((allow) => [allow.authenticated()]),

  receiveResult: a
    .subscription()
    // subscribes to the 'publishResult' mutation
    .for(a.ref("publishResult"))
    .arguments({ sessionId: a.string() })
    // subscription handler to set custom filters
    .handler(a.handler.custom({ entry: "./receive.js" }))
    // authorization rules as to who can subscribe to the data
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
