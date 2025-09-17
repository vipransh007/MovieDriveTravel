"use server";

// FIXED: Added 'Databases' to the import list
import { Account, Client, Databases, ID, Query } from "node-appwrite";
import { createAdminClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { cookies } from "next/headers";

const client = new Client().setEndpoint(appwriteConfig.endpointUrl)
        .setProject(appwriteConfig.projectId);


const sessionCookieName = `a_session_${appwriteConfig.projectId}`;

export const handleError = async (error: unknown, contextMessage: string) => {
    console.error(contextMessage, error);
    throw error;
};

const getUserByEmail = async (email: string) => {
    try {
        const { databases } = await createAdminClient();
        const result = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("email", email)]
        );
        return result.total > 0 ? result.documents[0] : null;
    } catch (error) {
        console.error("Error getting user by email:", error);
        return null;
    }
};

export const ensureUserDocument = async ({
    userId,
    email,
    fullName,
}: {
    userId: string;
    email: string;
    fullName?: string;
}) => {
    try {
        const { databases } = await createAdminClient();

        const existing = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("email", email)]
        );

        if (existing.total > 0) {
            return { accountId: existing.documents[0].$id };
        }

        await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            userId,
            {
                fullName: fullName ?? "",
                email,
                avatar: "",
                accountId: userId,
            }
        );

        return { accountId: userId };
    } catch (error) {
        handleError(error, "Failed to ensure user document");
    }
};

export const createAccount = async ({ fullName, email, password }: { fullName: string; email: string; password: string; }) => {
    try {
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            throw new Error("User already exists");
        }

        const { account, databases } = await createAdminClient();
        const accountId = ID.unique();
        await account.create(accountId, email, password, fullName);

        await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            accountId, // Using the same ID is great practice!
            {
                fullName,
                email,
                avatar: "",
                accountId,
            }
        );

        // After creating the account, we can immediately sign them in.
        const session = await account.createEmailPasswordSession(email, password);
        (await cookies()).set(sessionCookieName, session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });

        return JSON.stringify({ accountId });
    } catch (error) {
        handleError(error, "Failed to create account");
    }
};

export const signIn = async ({ email, password }: { email: string; password: string; }) => {
    try {
        // NOTE: It's better to use the admin client for consistency, but this works too.
        const { account } = await createAdminClient();

        // FIXED: Using the new, recommended method for email/password sessions.
        const session = await account.createEmailPasswordSession(email, password);

        // FIXED: cookies().set() should not be awaited. Added security options.
        (await
            // FIXED: cookies().set() should not be awaited. Added security options.
            cookies()).set(sessionCookieName, session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });

        return JSON.stringify(session);
    } catch (error) {
        handleError(error, "Failed to sign in");
    }
};