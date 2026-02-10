import { GoogleGenerativeAI } from "@google/generative-ai";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
app.use(bodyParser.json({ limit: "10kb" }));

const OFFICIAL_EMAIL = "labhansh1965.be23@chitkara.edu.in";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const success = (data) => ({
  is_success: true,
  official_email: OFFICIAL_EMAIL,
  data
});

const failure = (code) => ({
  is_success: false,
  official_email: OFFICIAL_EMAIL,
  data: null,
  error_code: code
});

const fibonacci = (n) => {
  if (n < 0 || n > 100) return null;
  let a = 0, b = 1;
  const res = [];
  for (let i = 0; i < n; i++) {
    res.push(a);
    [a, b] = [b, a + b];
  }
  return res;
};

const isPrime = (n) => {
  if (!Number.isInteger(n) || n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
};

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);

app.post("/bfhl", async (req, res) => {
  try {
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json(failure("INVALID_BODY"));
    }

    const keys = Object.keys(req.body);
    if (keys.length !== 1) {
      return res.status(400).json(failure("MULTIPLE_KEYS_NOT_ALLOWED"));
    }

    const key = keys[0];
    const value = req.body[key];

    if (key === "fibonacci") {
      if (!Number.isInteger(value)) {
        return res.status(422).json(failure("INVALID_FIBONACCI_INPUT"));
      }
      const data = fibonacci(value);
      if (!data) {
        return res.status(422).json(failure("FIBONACCI_OUT_OF_RANGE"));
      }
      return res.json(success(data));
    }

    if (key === "prime") {
      if (!Array.isArray(value)) {
        return res.status(422).json(failure("INVALID_PRIME_INPUT"));
      }
      return res.json(success(value.filter(isPrime)));
    }

    if (key === "lcm") {
      if (!Array.isArray(value) || value.length === 0) {
        return res.status(422).json(failure("INVALID_LCM_INPUT"));
      }
      return res.json(success(value.reduce((a, b) => lcm(a, b))));
    }

    if (key === "hcf") {
      if (!Array.isArray(value) || value.length === 0) {
        return res.status(422).json(failure("INVALID_HCF_INPUT"));
      }
      return res.json(success(value.reduce((a, b) => gcd(a, b))));
    }

    if (key === "AI") {
      if (typeof value !== "string" || value.length > 500) {
        return res.status(422).json(failure("INVALID_AI_INPUT"));
      }
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(value);
      return res.json(success(result.response.text().trim()));
    }

    return res.status(400).json(failure("UNKNOWN_KEY"));
  } catch {
    return res.status(500).json(failure("INTERNAL_SERVER_ERROR"));
  }
});

app.get("/health", (req, res) => {
  res.json({
    is_success: true,
    official_email: OFFICIAL_EMAIL
  });
});

export default app;
