export const prompt = `Describe the mood and emotion the image conveys in about three short descriptive phrases, followed by one phrase suggesting suitable instruments, genres, and moods. Match the tone to the image — for example, use soft, peaceful descriptions for serene scenes and intense, aggressive ones for war or chaos. For heavy or violent scenes, use powerful instruments like heavy metal guitars or aggressive percussion. Use evocative words like 'calm', 'beautiful', 'tense', or 'furious' when appropriate. Keep descriptions concise, separated by commas, and do not explain or add extra text. If fewer than five descriptions fit accurately, use fewer to maintain precision. Do not use bullet points, just print the results, nothing else. A war is heavy metal for example. Outputs must include 2 or more instruments as well as 1 or more moods/genres One last thing: treat the image as real, even if it looks cartoonish or drawn. Prefer to use real instruments like the piano or the guitar (electric guitar is also good)`

export const safetySettings = [
  {
    category: "HARM_CATEGORY_HARASSMENT",
    threshold: "BLOCK_NONE",
  },
  {
    category: "HARM_CATEGORY_HATE_SPEECH",
    threshold: "BLOCK_NONE",
  },
  {
    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    threshold: "BLOCK_NONE",
  },
  {
    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
    threshold: "BLOCK_NONE",
  },
  {
    category: "HARM_CATEGORY_CIVIC_INTEGRITY",
    threshold: "BLOCK_NONE",
  },
];