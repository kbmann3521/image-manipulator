const express = require('express');
const Replicate = require('replicate');
const { writeFile, readFile } = require('fs/promises');

const app = express();
const port = 3000;

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY, // API key is set as a GitHub secret
});

app.use(express.json());

app.post("/image/generate", async (req, res) => {
  try {
    const {
      prompt = "Default prompt",
      cfg = 4.5,
      seed = null,
      steps = 40,
      aspect_ratio = "1:1",
      output_format = "jpg",  // Supports "jpg" or "webp"
      output_quality = 90,
      prompt_strength = 0.85,
      image = null
    } = req.body;

    const input = {
      prompt,
      cfg,
      seed,
      steps,
      aspect_ratio,
      output_format,
      output_quality,
      prompt_strength,
      image,
    };

    const output = await replicate.run("stability-ai/stable-diffusion-3.5-large", { input });

    if (!output || output.length === 0) {
      return res.status(500).json({ error: "Failed to generate image." });
    }

    const imagePaths = [];
    for (const [index, item] of Object.entries(output)) {
      const filePath = `output_${index}.${output_format}`;
      await writeFile(filePath, item);
      imagePaths.push(filePath);
    }

    res.json({ message: "Image(s) generated successfully!", files: imagePaths });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Image generation failed.", details: error.message });
  }
});

app.listen(port, () => {
  console.log(`igen.js running at http://localhost:${port}`);
});
