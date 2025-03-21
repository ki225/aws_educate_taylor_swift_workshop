import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { BusinessAnalyzer } from '../functions/BusinessAnalyzer/resource';

const schema = a.schema({

  // This adds a new generation route to your Amplify Data backend.
  BusinessAnalyzer: a
    .query()
    .arguments({
        prompt: a.string(),
      })
      .returns(
        a.customType({
          title: a.string(),
          description: a.string(),
        })
      )
      .authorization((allow) => allow.authenticated())
      .handler(a.handler.function(BusinessAnalyzer)),

  // This will add a new conversation route to your Amplify Data backend.
  chat: a.conversation({
      aiModel: a.ai.model("Claude 3 Sonnet"),
      systemPrompt: 
        "你是個專業的助理，若用戶詢問和商業分析相關的問題，就調用 Business Analyzer 來回答" +
        "，否則就表示問題不相關",
      
      // conversation routes can have multiple tools
      tools: [
        a.ai.dataTool({
          name: "Business Analyzer", 
          description:
            "這是用來作為商業分析的工具，" +
            "會調用 Amazon Bedrock Flow 來生成商業洞察圖表與報告來回答使用者有關商業市場的疑問",
          query: a.ref("BusinessAnalyzer"), 
        }),
      ],
    }).authorization((allow) => allow.owner()),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});