import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
    let { slug } = req.query;
    const client = await clientPromise;

    try {
        const db = client.db("urlShortener");
        const collection = db.collection("shortenedUrls");
        const isPlus = slug.endsWith('+');

        if (isPlus) {
          slug = slug.substring(0, slug.length - 1);
        }

        const shortenedUrl = await collection.findOne({ shortUrl: slug });

        if (isPlus && shortenedUrl) {
          return res.status(200).json({ visitCount: shortenedUrl.visitCount });
        }

        if (shortenedUrl) {
            collection.updateOne({ _id: shortenedUrl._id }, { $inc: { visitCount: 1 } });

            res.writeHead(302, { Location: shortenedUrl.originalUrl });
            res.end();
        } else {
            res.writeHead(307, { Location: "/404?error=URL NOT FOUND" });
            res.end();

        }
    } catch (error) {
        res.writeHead(307, { Location: "/404?error="+error.message.toString() });
        res.end();

    }
};
