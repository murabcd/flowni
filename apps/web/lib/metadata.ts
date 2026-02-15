import type { Metadata } from "next";

type MetadataInput = {
  title: string;
  description?: string;
};

export const createMetadata = ({
  title,
  description,
}: MetadataInput): Metadata => ({
  title,
  description,
});
