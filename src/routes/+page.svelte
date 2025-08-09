<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { GoogleGenAI, Type, type LiveMusicSession } from '@google/genai';
  import Canvas from '$lib/components/Canvas.svelte';
  import {prompt} from '$lib/prompt'

	let apiKey = $state("");
  let lastEditTime = 0;
  const editInterval = 1000 * 5; // 5 seconds

  let session: LiveMusicSession;
  let ai: GoogleGenAI;

	async function main() {
		ai = new GoogleGenAI({
			apiVersion: 'v1alpha',
			apiKey,
		});
		const audioCtx = new AudioContext();
		const channels = 2;
		const sampleRate = 48000;
		const frameCount = 1024; // Replace with actual frame count
		const audioBuffer = audioCtx.createBuffer(channels, frameCount, sampleRate);
		let nextPlayTime = audioCtx.currentTime;
		session = await ai.live.music.connect({
			model: 'models/lyria-realtime-exp',
			callbacks: {
				onmessage: (message) => {
					if (audioCtx.state === 'suspended') {
                        audioCtx.resume();
                    }

                    const chunk = message.serverContent?.audioChunks?.[0];
                    if (!chunk?.data) return;

                    const audioDataString = atob(chunk.data);
                    const uint8Array = new Uint8Array(audioDataString.length).map((_, i) =>
                        audioDataString.charCodeAt(i)
                    );

                    // Create a 16-bit integer view of the byte data (assumes little-endian)
                    const int16Array = new Int16Array(uint8Array.buffer);

                    const frameCount = int16Array.length / channels;
                    if (frameCount === 0) return;

                    const audioBuffer = audioCtx.createBuffer(channels, frameCount, sampleRate);

                    for (let channel = 0; channel < channels; channel++) {
                        const bufferData = audioBuffer.getChannelData(channel);
                        for (let i = 0; i < frameCount; i++) {
                            // Normalize 16-bit signed int to a float between -1.0 and 1.0
                            bufferData[i] = int16Array[i * channels + channel] / 32768.0;
                        }
                    }

                    const source = audioCtx.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(audioCtx.destination);

                    if (audioCtx.currentTime > nextPlayTime) {
                        nextPlayTime = audioCtx.currentTime;
                    }

                    source.start(nextPlayTime);

                    nextPlayTime += audioBuffer.duration;
				},
				onerror: (error) => {
					console.error('music session error:', error);
				},
				onclose: () => {
					console.log('Lyria RealTime stream closed.');
				}
			}
		});
		await session.setWeightedPrompts({
			weightedPrompts: [{ text: '', weight: 1.0 }]
		});
		await session.setMusicGenerationConfig({
			musicGenerationConfig: { bpm: 90, temperature: 1.0 }
		});
		session.play();
	}

  async function canvasUpdate(imageData: string) {
    const now = Date.now();
    if (now - lastEditTime < editInterval) return;
    lastEditTime = now;
    // Ask Gemini to clasify the image
    if (!ai) return;
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: [
        {
          inlineData: {
            mimeType: "image/png",
            data: imageData.replace('data:image/png;base64,', '')
          },
        },
        {
          text: prompt
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: {
              type: Type.STRING,
            },
            keywords: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
            },
          },
        },
      },
    });
    const result = JSON.parse(response.text);
    await session.setWeightedPrompts({
			weightedPrompts: [{ text: result.keywords.join(','), weight: 1.0 }]
		});
  }
</script>


<input bind:value={apiKey} placeholder="Enter your API key...">
<button onclick={main}>Continue</button>
<Canvas onCanvasUpdate={canvasUpdate} />
