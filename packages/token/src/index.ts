import express from "express";
import type { TransactionRequest } from "./types.js";
import { TransactionRequestSchema } from "./types.js";
const app = express();
const PORT = process.env.PORT || 8888;

app.use(express.json());

app.post("/api/reward", (req, res) => {
  const result = TransactionRequestSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).send({ error: result.error });
    return;
  }
  const transactionRequest: TransactionRequest =
    result.data as TransactionRequest;
  res.json({
    ...transactionRequest,
    timestamp: new Date().toISOString(),
    note: "placeholder only",
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", uptime: process.uptime() });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;
