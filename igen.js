import express from 'express';
import Replicate from 'replicate';

const app = express();
const port = 3000; // You can change this to any port you prefer

app.use(express.json());

// Set up a route that will call your igen.js functionality
app.post('/run-image', async (req, res) => {
  try {
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
      userAgent: 'https://www.npmjs.com/package/create-replicate',
    });

    const model = 'stability-ai/stable-diffusion-3.5-large:e6c4657fe1b3f078fb26d68a1413bc8013e2b085504dd84a33e26e16fb95a593';
    const input = {
      cfg: 4.5,
      steps: 40,
      prompt: req.body.prompt || '~*~aesthetic~*~ #boho #fashion, full-body 30-something woman laying on microfloral grass, candid pose, overlay reads Stable Diffusion 3.5, cheerful cursive typography font',
      aspect_ratio: '1:1',
      output_format: 'webp',
      output_quality: 90,
      prompt_strength: 0.85,
    };

    console.log('Using model:', model);
    console.log('With input:', input);
    console.log('Running...');

    const output = await replicate.run(model, { input });

    console.log('Done!', output);
    
    res.json({ success: true, output });
  } catch (error) {
    console.error('Error running the model:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
