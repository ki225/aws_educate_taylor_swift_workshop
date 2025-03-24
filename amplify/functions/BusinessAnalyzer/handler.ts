import {
  BedrockAgentRuntimeClient,
  InvokeFlowCommand,
} from "@aws-sdk/client-bedrock-agent-runtime";
import { AppSyncRequestIAM } from "./appsyncAutlUtil";
import { publishResult } from "./graphql";

// lambda environment variables
export const REGION = "us-east-1";
export const FLOW_ID = process.env.FLOW_ID!;
export const FLOW_ALIAS_ID = process.env.FLOW_ALIAS_ID!;

interface FlowResponse {
  content: {
    document: string;
  };
  nodeName: string;
  completionReason: string;
}

export const handler = async (
  // event: { arguments: { sessionId?: string | null; prompt?: string | null } },
  event: any,
  context: any
) => {
  console.log("Event received:", JSON.stringify(event));

  const flowResponse = await invokeBedrockFlow({
    flowIdentifier: FLOW_ID,
    flowAliasIdentifier: FLOW_ALIAS_ID,
    prompt: event.arguments.prompt!,
    region: REGION,
  });

  const documentContent = JSON.parse(flowResponse);

  let result = {
    sessionId: event.arguments.sessionId || "",
    imageUrl: "",
    description: "Something Wrong QQ",
  };

  if (documentContent.statusCode === "500") {
    console.error("Flow execution error:", documentContent);
    result = {
      sessionId: event.arguments.sessionId || "",
      imageUrl: "",
      description: `分析過程出錯: ${
        JSON.parse(documentContent.body).error || documentContent.body
      }`,
    };
  }

  if (documentContent.statusCode === "200") {
    console.log("Flow Success:", documentContent);
    result = {
      sessionId: event.arguments.sessionId || "",
      imageUrl:
        "https://20250329-aws-educate-taylor-swift-workshop.s3.ap-northeast-1.amazonaws.com/visualizations/attendance_distribution.png",
      description: `${
        JSON.parse(documentContent.body).suggestion || documentContent.body
      }`,
    };
  }

  try {
		const res = await AppSyncRequestIAM({
			config: {
				region: "us-east-1" as string,
				url: process.env.APP_SYNC_GRAPHQL_API_ENDPOINT as string,
			},
			operation: {
				operationName: 'PublishResult',
				query: publishResult,
				variables: {
					sessionId: result.sessionId,
          imageUrl: result.imageUrl,
          description: result.description,
				},
			},
		})
		console.log('the appsync res', res)
	} catch (e) {
		console.log('error', e)
	}
  
  return result;
};

export const invokeBedrockFlow = async ({
  flowIdentifier,
  flowAliasIdentifier,
  prompt,
  region = "us-east-1",
}: {
  flowIdentifier: string;
  flowAliasIdentifier: string;
  prompt: string;
  region: string;
}) => {
  const client = new BedrockAgentRuntimeClient({ region });

  const command = new InvokeFlowCommand({
    flowIdentifier,
    flowAliasIdentifier,
    inputs: [
      {
        content: {
          document: prompt,
        },
        nodeName: "FlowInputNode",
        nodeOutputName: "document",
      },
    ],
    enableTrace: true,
  });

  let flowResponse = {};
  const response = await client.send(command);

  if (response?.responseStream) {
    for await (const chunkEvent of response.responseStream) {
      const { flowOutputEvent, flowCompletionEvent } = chunkEvent;

      if (flowOutputEvent) {
        flowResponse = { ...flowResponse, ...flowOutputEvent };
        console.log("Flow output event:", flowOutputEvent);
      } else if (flowCompletionEvent) {
        flowResponse = { ...flowResponse, ...flowCompletionEvent };
        console.log("Flow completion event:", flowCompletionEvent);
      }
    }
  }

  console.log("FlowResponse:", flowResponse);

  return (flowResponse as FlowResponse).content.document;
};