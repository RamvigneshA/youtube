require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { YoutubeTranscript } = require("youtube-transcript");

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const isValidYouTubeId = (id) => /^[a-zA-Z0-9_-]{11}$/.test(id);

app.get("/transcript", async (req, res) => {
    const videoId = req.query.videoId;

    if (!videoId || !isValidYouTubeId(videoId)) {
        return res.status(400).json({ error: "Invalid or missing videoId parameter" });
    }

    try {
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        if (!transcript || transcript.length === 0) {
            throw new Error("No transcript available");
        }

        const text = transcript.map((entry) => entry.text).join(" ");
        res.json({ videoId, transcript: text });
    } catch (error) {
        console.error("Error fetching transcript:", error);
        res.status(500).json({ 
            error: "Failed to fetch transcript", 
            details: error.message || "Unknown error occurred" 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
