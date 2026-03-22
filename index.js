import express from "express";
import { DateTime } from "luxon";
import { UAParser } from "ua-parser-js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());

// Servir arquivos estáticos da pasta 'public'
app.use(express.static("public"));

// Middleware: pedir ao browser os Client Hints de alta entropia
app.use((req, res, next) => {
  res.setHeader(
    "Accept-CH",
    "Sec-CH-UA-Model, Sec-CH-UA-Platform, Sec-CH-UA-Platform-Version, Sec-CH-UA-Full-Version-List, Sec-CH-UA-Mobile, Sec-CH-UA-Arch",
  );
  // Manter os hints por 1 hora
  res.setHeader("Critical-CH", "Sec-CH-UA-Model");
  next();
});

// Rota principal que envia os dados via JSON para o frontend
app.get("/api/device-info", (req, res) => {
  const now = DateTime.now().setZone("Europe/Madrid");
  const localTime = now.toFormat("dd/MM/yyyy HH:mm:ss");

  const parser = new UAParser();
  parser.setUA(req.headers["user-agent"]);
  const result = parser.getResult();

  // Modelo vindo do Client Hint (real) ou fallback do UA-Parser
  const hintModel = req.headers["sec-ch-ua-model"]?.replace(/"/g, "").trim();
  const parsedModel = result.device.model;

  // "K" é o placeholder que o Chrome envia quando reduz o UA — ignorar
  const isReducedPlaceholder = parsedModel === "K";
  const model =
    hintModel && hintModel !== ""
      ? hintModel
      : !isReducedPlaceholder && parsedModel
        ? parsedModel
        : null;

  const deviceInfo = {
    usedBrowser: result.browser.name || "Unknown",
    browserVersion: result.browser.version || "",
    cpu:
      result.cpu.architecture ||
      req.headers["sec-ch-ua-arch"]?.replace(/"/g, "") ||
      "unknown",
    opSystem:
      result.os.name ||
      req.headers["sec-ch-ua-platform"]?.replace(/"/g, "") ||
      "Unknown",
    osVersion:
      result.os.version ||
      req.headers["sec-ch-ua-platform-version"]?.replace(/"/g, "") ||
      "",
    type: result.device.type || "desktop",
    model:
      model || (result.device.type ? "Model not identified" : "PC-Computer"),
    vendor:
      result.device.vendor ||
      (result.device.type ? "Manufacturer not identified" : "N/A"),
    localTime: localTime,
    timezone: "Europe/Madrid",
    // Debug: expor o hint bruto para confirmar que chegou
    _hint_model_raw: req.headers["sec-ch-ua-model"] || null,
  };

  res.json(deviceInfo);
});

// Rota para receber o modelo detectado pelo frontend via JS (fallback)
app.post("/api/device-model", (req, res) => {
  const { model } = req.body;
  res.json({ received: model || null });
});

// Rota principal serve o arquivo HTML
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Exportar para Vercel
export default app;
