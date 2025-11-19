import express from "express";
import cors from "cors";
import {GoogleGenerativeAI} from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = gemini.getGenerativeModel({
  model: "models/gemini-2.5-flash-lite-preview-09-2025",
});
//model for emoji -> keywords

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;
const LASTFM_BASE_URL = "https://ws.audioscrobbler.com/2.0/";
//api for getting songs by keywords

async function itunes_url(track_name, artist_name) {  //if song found, return url for playing
    const query = `${track_name} ${artist_name}`; //search query
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
      query
    )}&entity=song&limit=1`;
    const response = await fetch(url);//fetch request
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].previewUrl || "";
    }
  return "";
}
//

app.post("/emoji-to-keywords", async (req, res) => { //convert emoji to keywords
    const { emoji } = req.body;
    const prompt = `Convert this emoji into 4 simple mood words.Return only the words, comma-separated.
    Emoji: ${emoji}`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const keywords = text
      .split(",") //format
      .map((k) => k.trim().toLowerCase())
      .filter((k) => k);
    res.json({ keywords });
});

app.post("/songs", async (req, res) => {
    const {keywords, minMatches = 1} = req.body;//min match 1 to keywords
    const lowerKeywords = keywords.map((k) => k.toLowerCase()); //format
    const allTracks = new Map();

    for (const keyword of lowerKeywords) {
        const tagUrl = `${LASTFM_BASE_URL}?method=tag.getTopTracks&tag=${encodeURIComponent(
          keyword
        )}&api_key=${LASTFM_API_KEY}&format=json&limit=50`;
        const response = await fetch(tagUrl);
        const data = await response.json();

        if (data.tracks && data.tracks.track) {
          const tracks = Array.isArray(data.tracks.track) 
            ? data.tracks.track 
            :[data.tracks.track];
          tracks.forEach((track) => {
            const trackKey = `${track.name.toLowerCase()}_${track.artist.name.toLowerCase()}`;
            if (!allTracks.has(trackKey)) {
              allTracks.set(trackKey, {
                trackName: track.name,
                artistName: track.artist.name,
                lastfmUrl: track.url,
                imageUrl: track.image && track.image[3] ? track.image[3]["#text"] : "",
              });
            }
          });
        }
    }
    let tracks = Array.from(allTracks.values()).slice(0, 20);
    const tracksWithPreview = await Promise.all(
      tracks.map(async (track, index) => {
        if (index > 0) {
          await new Promise(resolve => setTimeout(resolve, 100 * index));
        }
        const previewUrl = await itunes_url(track.trackName, track.artistName);
        return {
          ...track,
          previewUrl: previewUrl,
          collectionName: "",
        };
      })
    );
    res.json({ songs: tracksWithPreview });
});

app.listen(3000, () => {});
