import { Handler } from "aws-lambda";
import { BedrockAgentRuntimeClient, InvokeFlowCommand } from "@aws-sdk/client-bedrock-agent-runtime";
import type { Schema } from "../../data/resource";
// import { env } from '$amplify/env/BusinessAnalyzer';

// import  variables from environment
const REGION = "us-east-1";
const FLOW_ID = "0F7YTNFAWH";
const FLOW_ALIAS_ID = "LJ5ZK9RTKM";

// Adjust the function handler's return type to match the actual return type.
export const handler: Handler = async (
  event
): Promise<(string | null)[]> => {  // Return type matching what the handler actually returns
  const client = new BedrockAgentRuntimeClient({ region: REGION });

  const command = new InvokeFlowCommand({
    flowIdentifier: FLOW_ID,
    flowAliasIdentifier: FLOW_ALIAS_ID,
    inputs: [
      {
        content: {
          document: event.arguments.prompt ?? null, // Ensure document is never undefined
        },
        nodeName: "FlowInputNode",
        nodeOutputName: "document",
      },
    ],
  });

  let flowResponse: (string | null)[] = [];

  try {
    const response = await client.send(command);

    if (response.responseStream) {
      for await (const chunkEvent of response.responseStream) {
        const { flowOutputEvent, flowCompletionEvent } = chunkEvent;

        if (flowOutputEvent) {
          flowResponse.push(JSON.stringify(flowOutputEvent, null, 2));
          console.log("Flow output event:", flowOutputEvent);
        } else if (flowCompletionEvent) {
          flowResponse.push(JSON.stringify(flowCompletionEvent, null, 2));
          console.log("Flow completion event:", flowCompletionEvent);
        }
      }
    } else {
      console.error("No response stream found");
      return [];  // Or some other default error response
    }

  } catch (error) {
    console.error("Error invoking Bedrock Flow:", error);
    return [];
  }

  return flowResponse;
};
