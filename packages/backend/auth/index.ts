import type { auth } from "./auth";

export type Session = typeof auth.$Infer.Session;
export type User = Session["user"];

export const FlowniRole = {
  Admin: "admin",
  Editor: "editor",
  Member: "member",
} as const;

export type FlowniRole = (typeof FlowniRole)[keyof typeof FlowniRole];
