import express from "express";
import { createServer } from "http";
import { initWs } from "./ws";
import cors from "cors";

const app = express();
app.use(cors());
const httpServer = createServer(app);

initWs(httpServer);

const port = process.env.PORT || 3001;

httpServer.listen(port, () => {
  console.log(`listening on *:${port}`);
});

app.get("/alive", async (req, res) => {
  try {
    return res.status(200).json({ message: "yes" })
  } catch (error) {
    return res.status(500).json({ message: "something went wrong" })
  }
})

app.listen(3002, () => {
  console.log(`httpServer is listing on port 3002`)
})
