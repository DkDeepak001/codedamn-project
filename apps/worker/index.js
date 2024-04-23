const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');


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

          // Read current Caddyfile
          fs.readFile('/etc/caddy/Caddyfile', 'utf8', (err, data) => {
            if (err) {
              console.error(`Error reading Caddyfile: ${err}`);
              return res.status(500).send('Error reading Caddyfile');
            }

            // Check if domains already exist
            const domain1 = `${userId}.terminal.dkdeepak001.com`;
            const domain2 = `${userId}.output.dkdeepak001.com`;

            if (data.includes(domain1)) {
              // Update port for domain1
              data = data.replace(new RegExp(`${domain1}\\s*{[^}]*reverse_proxy\\s+[^:]+:\\d+}`), `${domain1} {\n\treverse_proxy 10.182.0.3:${ports1}\n}`);
            } else {
              // Add new configuration for domain1
              data += `\n${domain1} {\n\treverse_proxy 10.182.0.3:${ports1}\n}`;
            }

            if (data.includes(domain2)) {
              // Update port for domain2
              data = data.replace(new RegExp(`${domain2}\\s*{[^}]*reverse_proxy\\s+[^:]+:\\d+}`), `${domain2} {\n\treverse_proxy 10.182.0.3:${ports2}\n}`);
            } else {
              // Add new configuration for domain2
              data += `\n${domain2} {\n\treverse_proxy 10.182.0.3:${ports2}\n}`;
            }

            // Write updated Caddyfile
            fs.writeFile('/etc/caddy/Caddyfile', data, 'utf8', (err) => {
              if (err) {
                console.error(`Error updating Caddyfile: ${err}`);
                return res.status(500).send('Error updating Caddyfile');
              }
              console.log(`Caddyfile updated successfully for user: ${userId}`);
              res.send(`User ${userId} created successfully`);
            });
          });
        }


        if (stderr) res.status(500).json({ message: stderr.toString() })

      });
    }
  });

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


