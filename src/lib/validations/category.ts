import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug: lowercase letters, numbers and hyphens only"),
  parentId: z.string().cuid().optional().nullable(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
