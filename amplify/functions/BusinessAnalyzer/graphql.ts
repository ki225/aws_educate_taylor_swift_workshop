export const publishResult = /* GraphQL */ `
  mutation PublishResult($sessionId: String!, $imageUrl: String!, $description: String!) {
    publishResult(sessionId: $sessionId, imageUrl: $imageUrl, description: $description) {
      imageUrl
      description
    }
  }
`;