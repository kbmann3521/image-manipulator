import Replicate from "replicate";
const replicate = new Replicate();

const input = {
    image: "https://replicate.delivery/pbxt/Ing7Fa4YMk6YtcoG1YZnaK3UwbgDB5guRc5M2dEjV6ODNLMl/cat.jpg",
    scale: 2
};

const output = await replicate.run("nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa", { input });

import { writeFile } from "node:fs/promises";
await writeFile("output.png", output);
//=> output.png written to disk
