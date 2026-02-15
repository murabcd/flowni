import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { dbCli } from "../drizzle/db-cli";
import { schema } from "../drizzle/schema";
import { keys } from "../keys";

const env = keys();

const githubProvider =
  env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
    ? {
        github: {
          clientId: env.GITHUB_CLIENT_ID,
          clientSecret: env.GITHUB_CLIENT_SECRET,
        },
      }
    : {};

export const auth = betterAuth({
  database: drizzleAdapter(dbCli, {
    provider: "pg",
    schema,
  }),
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  socialProviders: githubProvider,
  user: {
    additionalFields: {
      organizationId: {
        type: "string",
        required: false,
      },
      organizationRole: {
        type: "string",
        required: false,
      },
    },
  },
});
