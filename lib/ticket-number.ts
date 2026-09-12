import type { CategoryCode } from "@/app/generated/prisma/client";

type TransactionClient =
  Parameters<
    Parameters<typeof import("@/lib/prisma").prisma.$transaction>[0]
  > extends infer T
    ? T
    : never;
