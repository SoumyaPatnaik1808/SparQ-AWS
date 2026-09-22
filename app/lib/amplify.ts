import { Amplify } from "@aws-amplify/core";

const configuredEndpoint = process.env.NEXT_PUBLIC_APPSYNC_GRAPHQL_URL;

function getGraphQLEndpoint() {
  if (!configuredEndpoint) {
    return undefined;
  }

  return configuredEndpoint
    .replace(/^wss:/, "https:")
    .replace("appsync-realtime-api", "appsync-api");
}

const endpoint = getGraphQLEndpoint();

if (endpoint) {
  Amplify.configure({
    API: {
      GraphQL: {
        endpoint,
        region: process.env.NEXT_PUBLIC_AWS_REGION || "ap-south-1",
        defaultAuthMode: "apiKey",
        apiKey: process.env.NEXT_PUBLIC_APPSYNC_API_KEY,
      },
    },
  });
}