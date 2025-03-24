import { extensions, util } from "@aws-appsync/utils";

// Subscription handlers must return a `null` payload on the request
export function request() {
  return { payload: null };
}

/**
 * @param {import('@aws-appsync/utils').Context} ctx
 */
export function response(ctx) {
  const filter = {
    sessionId: {
      eq: ctx.args.sessionId, // pub/sub for specific sessionId
    },
  };

  extensions.setSubscriptionFilter(util.transform.toSubscriptionFilter(filter));
  return ctx.result;
}
