import * as z from "zod"; 

export const apiResponse = z.object({
    success: z.boolean(),
    message: z.string(),
    messageCode: z.string(),
    data: z.any().optional(),
    timestamp: z.iso.datetime({ offset: true }),
});

export type ApiResponse = z.infer<typeof apiResponse>;