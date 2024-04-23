import express from "express";
import { createServer } from "http";
import { initWs } from "./ws";
import cors from "cors";

const app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'https://codedamn-project-web.vercel.app'],
  methods: ["POST", "GET", "PUT"]
}));
const httpServer = createServer(app);

initWs(httpServer);

const port = process.env.PORT || 3001;

httpServer.listen(port, () => {
  console.log(`listening on *:${port}`);
});

