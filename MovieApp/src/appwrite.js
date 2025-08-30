import { Client, Query, Databases, ID } from 'appwrite';

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;

const client = new Client();

client
    .setEndpoint('https://cloud.appwrite.io/v1') // Or your specific regional endpoint
    .setProject(PROJECT_ID);

const database = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {
    // Return early if the search term is empty
    if (!searchTerm) return;

    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal('searchTerm', searchTerm),
        ]);

        if (result.documents.length > 0) {
            // Document exists, so update its count
            const doc = result.documents[0];
            await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
                count: doc.count + 1,
            });
            console.log(`Updated count for: ${searchTerm}`);
        } else {
            // Document doesn't exist, so create it
            await database.createDocument(
                DATABASE_ID,
                COLLECTION_ID,
                ID.unique(),
                {
                    searchTerm: searchTerm,
                    count: 1, // Start the count at 1
                    movie_id: movie.id,
                    // CORRECTED: The domain is now 'tmdb.org'
                    poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                }
            );
            console.log(`Created new entry for: ${searchTerm}`);
        }
    } catch (error) {
        console.error("Appwrite service :: updateSearchCount :: error", error);
    }
};