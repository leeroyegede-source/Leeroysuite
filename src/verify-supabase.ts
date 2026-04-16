
import 'dotenv/config';
import { db } from './lib/db';
import { v4 as uuidv4 } from 'uuid';

async function main() {
    console.log("Starting verification...");

    const testEmail = `test-${Date.now()}@example.com`;
    const testUser = {
        email: testEmail,
        role: "user" as const,
        createdAt: new Date().toISOString(),
        status: "active" as const,
        disabledFeatures: []
    };

    console.log(`1. Saving User: ${testEmail}`);
    await db.saveUser(testUser);

    console.log("2. Fetching User");
    const fetchedUser = await db.getUser(testEmail);
    if (!fetchedUser || fetchedUser.email !== testEmail) {
        throw new Error("Failed to fetch user or email mismatch");
    }
    console.log("   User fetched successfully.");

    const websiteId = uuidv4();
    const testWebsite = {
        id: websiteId,
        userEmail: testEmail,
        name: "Verification Site",
        code: "<html></html>",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    console.log(`3. Saving Website: ${websiteId}`);
    await db.saveWebsite(testWebsite);

    console.log("4. Listing Websites");
    const websites = await db.listWebsites(testEmail);
    if (!websites.find(w => w.id === websiteId)) {
        throw new Error("Failed to find saved website in list");
    }
    console.log(`   Found ${websites.length} website(s).`);

    console.log("5. Deleting Website");
    await db.deleteWebsite(websiteId);

    const doubleCheck = await db.getWebsite(websiteId);
    if (doubleCheck) {
        throw new Error("Website should be deleted but was found");
    }
    console.log("   Website deleted successfully.");

    console.log("Verification COMPLETE. All checks passed.");
}

main().catch(err => {
    console.error("Verification FAILED:", err);
    process.exit(1);
});
