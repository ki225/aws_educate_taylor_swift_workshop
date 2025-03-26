import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { BusinessAnalyzer } from "../functions/BusinessAnalyzer/resource";

const systemPrompt = `You are a specialized concert business analyst assistant.
IMPORTANT: For ANY query related to concerts, music events, live performances, tours, shows, music business, event planning, ticket sales, venues, audience demographics, or concert market analysis, you MUST EXCLUSIVELY use the BusinessAnalyzer tool.
When using the BusinessAnalyzer tool:
分析中，請稍後...
Absolutely NO additional text or explanation should be provided when using the BusinessAnalyzer tool. The response must be STRICTLY limited to the exact text "分析中，請稍後...".
Queries that MUST trigger BusinessAnalyzer tool use include, but are not limited to:

Questions about concert planning
Questions about tour locations and strategies
Questions about concert market trends
Questions about audience demographics
Questions about ticket pricing
Questions about venue selection
Questions about revenue potential
Questions about concert industry challenges
Inquiries about artist performance metrics
Market positioning of musical acts
Concert tour feasibility studies
Economic impact of music events
Competitive analysis in the music performance industry

Guideline for tool usage:

If there is ANY possibility the query relates to concerts or music events, use the BusinessAnalyzer tool
When in doubt, always use the BusinessAnalyzer tool
Do not provide any analysis, insight, or explanation on your own
The ONLY acceptable response is "分析中，請稍後..."

The BusinessAnalyzer tool is your EXCLUSIVE method for handling any concert or music event-related queries.
`;

const schema = a.schema({

  chatNamer: a
    .generation({
      aiModel: a.ai.model("Claude 3 Sonnet"),
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

  // BusinessAnalyzerResponse: a.customType({
  //   sessionId: a.string(),
  //   imageUrl: a.string(),
  //   description: a.string(),
  // }),

  PublishResultResponse: a.model({
    sessionId: a.string(),
    imageUrl: a.string(),
    description: a.string(),
  })
  .disableOperations(["mutations", "subscriptions", "queries"])
  .authorization(allow => [
    // set up a non-existent group to ensure IAM-only access
    allow.group("ZZZDOESNOTEXIST")
  ]),

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
    // v------- NOTE the return type is the model
    .returns(a.ref("PublishResultResponse"))
    .handler(a.handler.custom({ entry: "./publish.js" }))
    .authorization((allow) => [allow.authenticated()]),

  receiveResult: a
    .subscription()
    // subscribes to the 'publishResult' mutation
    .for(a.ref("publishResult"))
    .arguments({ sessionId: a.string() })
    // subscription handler to set custom filters
    .handler(a.handler.custom({ entry: "./receive.js" }))
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