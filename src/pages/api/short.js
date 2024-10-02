import validUrl from "valid-url"; // Import a URL validation library
import clientPromise from "../../lib/mongodb";

const siteUrl = process.env.SITE_URL;


const generateFullUrl = (shortUrl) => {
  return `${siteUrl}/${shortUrl}`;
}

export default async function handler(req, res) {
    const client = await clientPromise;

    if (!siteUrl) {
      res.status(500).json({ error: "SITE_URL env not found!" });
    }

    try {
        const db = client.db("urlShortener");
        const collection = db.collection("shortenedUrls");

        switch (req.method) {
            case "POST":
                const { originalUrl } = req.body;
                if (originalUrl && validUrl.isUri(originalUrl)) { // Check if it's a valid URL
                    const found = await collection.findOne({ originalUrl });

                    if (found) {
                      return res.status(200).json({ shortUrl: generateFullUrl(found.shortUrl) });
                    }

                    const randomStr = getRandomString(5);

                    await collection.insertOne({
                        shortUrl: randomStr,
                        visitCount: 0,
                        originalUrl,
                    });
                    res.status(200).json({ shortUrl: generateFullUrl(randomStr) });
                } else {
                    res.status(400).json({ error: "Invalid URL or Bad Request" });
                }
                break;
            default:
                res.status(405).end();
                break;
        }
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}

function getRandomString(length) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let randomString = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        randomString += charset.charAt(randomIndex);
    }
    return randomString;
}
