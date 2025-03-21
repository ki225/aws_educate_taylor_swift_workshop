import { BedrockAgentRuntimeClient, InvokeFlowCommand } from "@aws-sdk/client-bedrock-agent-runtime";
import type { Schema } from "../../data/resource";
import { env } from '$amplify/env/BusinessAnalyzer';
// import { env } from '../../../.amplify/generated/env/BusinessAnalyzer';

export const REGION = env.REGION;
export const FLOW_ID = env.FLOW_ID;
export const FLOW_ALIAS_ID = env.FLOW_ALIAS_ID;

export const handler: Schema["BusinessAnalyzer"]["functionHandler"] = async (event) => {
  try {
    const client = new BedrockAgentRuntimeClient({ 
      region: REGION,
      maxAttempts: 3
    });
    
   const command = new InvokeFlowCommand({
      flowAliasIdentifier: FLOW_ALIAS_ID,
      flowIdentifier: FLOW_ID,
      inputs: [
        {
          content: {
            document: event.arguments.prompt || ''
          },
          nodeName: "FlowInputNode",
          nodeOutputName: "document"
        }
      ],
      enableTrace: true,
    });

    let responseText  = "";
    const response = await client.send(command);
    console.log(" INFO Response", response); 
   
    if (response.responseStream) {
      console.log(" INFO responseStream", response.responseStream);
 
     for await (const chunkEvent of response.responseStream!) {
         const { flowOutputEvent } = chunkEvent;
         if (flowOutputEvent?.content?.document) {
           responseText += flowOutputEvent.content.document;
         }
       }
     } 
 
     if (!responseText) {
       responseText = "No response received from the flow."
     }
     console.log(" FINAL output", responseText);
 
     return {
       title: responseText.split(" ").slice(0, 10).join(" ") as string,
       description: responseText.split(" ").slice(10).join(" ") as string,
     };
     
   } catch (error) {
     console.error('Error:', error);
     throw error;
   }
 };