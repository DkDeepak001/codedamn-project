const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const { stdout } = require('process');


const app = express();
const PORT = 4000;
app.use(express.json());


app.post('/script', (req, res) => {
  const { userId, s3Url } = req.body;
  console.log(userId, s3Url);

  const arg1 = userId;
  const arg2 = s3Url;
  const command = `./deploy.sh ${arg1} ${arg2}`;

  exec(command, (error, dStdOut, stderr) => {
    if (error) {
      console.error(`Error deploying container: ${error}`);
      return res.status(500).send('Error deploying container');
    }

    if (dStdOut) {

      console.log(`Container deployed successfully for user: ${userId}`);
      console.log(`Script output: ${dStdOut}`);
      exec(`./port.sh ${arg1}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error config proxy: ${error}`);
          return res.status(500).send('Error Config reverse_proxy');
        }

        if (stderr) console.log(stderr, "err")

        if (stdout) {
          console.log(stdout, 'output RAW')
          const outputLines = stdout.trim().split('\n');
          console.log(outputLines, "outputLines")
          const ports1 = outputLines[0].split(":")[1].trim();
          const ports2 = outputLines[1].split(":")[1].trim();

          console.log(ports1, ports2);

          return res.status(200).json({
            message: `Container deployed successfully for user: ${userId}`,
            terminalUrl: `http://34.16.169.164:${ports1}`,
            outputUrl: `http://34.16.169.164:${ports2}`
          })
        }
        if (stderr) res.status(500).json({ message: stderr.toString() })

      })
    }
  });

});
app.get('/stop', (req, res) => {
  try {
    const { containerId, projectId } = req.query
    const arg1 = containerId;
    const command = `./stop.sh ${arg1}`;

    exec(command, (error, stdOut, stderr) => {
      if (stdout) {
        console.log('change status to stop', stdout, projectId)
      }
    })
    res.status(200).json({ meassage: "message" })
  } catch (e) {
    console.log(e)
  }
});

app.get('/health', (req, res) => {
  try {
    console.log("healthy");
    return res.status(200).json({ message: "healthy" });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ message: "something went wrong" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



