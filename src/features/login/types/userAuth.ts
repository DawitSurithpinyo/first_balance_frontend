import * as z from 'zod';

export const googleUser = z.object({
    userID: z.string(),
    userEmail: z.email(),
    userName: z.string(),
    signUpChoice: z.literal("GOOGLE"),
});

export type GoogleUser = z.infer<typeof googleUser>;


export const normalUser = z.object({
    userID: z.string(),
    userEmail: z.email(),
    userName: z.string(),
    signUpChoice: z.literal("MANUAL"),
});

export type NormalUser = z.infer<typeof normalUser>;


// export const guestUser = z.object({
//     userID: z.uuidv4(),
//     userName: z.string(),
//     signUpChoice: z.literal("GUEST"),
// });

// export type GuestUser = z.infer<typeof guestUser>;


// helper: Check against all types, return first that match
export const userTypes = z.union([googleUser, normalUser]);



export const csrfTokenObj = z.coerce.string<string>().min(20);

export type CsrfTokenType = z.infer<typeof csrfTokenObj>;