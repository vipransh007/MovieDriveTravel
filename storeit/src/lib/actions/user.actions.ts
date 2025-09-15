"use server";

import { Account, Client, ID, Query } from "node-appwrite";
import { createAdminClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { cookies } from "next/headers";

const sessionCookieName = `a_session_${appwriteConfig.projectId}`;

export const handleError = (error: unknown, contextMessage: string) => {
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

export const createAccount = async ({ fullName, email, password }: { fullName: string; email: string; password: string }) => {
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
            accountId,
            {
                fullName,
                email,
                avatar: "",
                accountId,
            }
        );

        return JSON.stringify({ accountId });
    } catch (error) {
        handleError(error, "Failed to create account");
    }
};

export const signIn = async ({ email, password }: { email: string; password: string }) => {
    try {
        const client = new Client()
            .setEndpoint(appwriteConfig.endpointUrl)
            .setProject(appwriteConfig.projectId);
        const account = new Account(client);
        const session = await account.createSession(email, password);
        (await cookies()).set(sessionCookieName, session.secret);
        return JSON.stringify({ session });
    } catch (error) {
        handleError(error, "Failed to sign in");
    }
};
