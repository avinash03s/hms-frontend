export const askAI = async (question: string) => {
  const res = await fetch("http://localhost:9500/api/ai/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ question })
  });

  return await res.text();
};