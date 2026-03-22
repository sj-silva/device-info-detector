import express from "express";
import { DateTime } from "luxon";
import { UAParser } from "ua-parser-js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Servir arquivos estáticos da pasta 'public'
app.use(express.static("public"));

// Rota principal que envia os dados via JSON para o frontend
app.get("/api/device-info", (req, res) => {
  const now = DateTime.now().setZone("Europe/Madrid");
  const localTime = now.toFormat("dd/MM/yyyy HH:mm:ss");

  const parser = new UAParser();
  parser.setUA(req.headers["user-agent"]);

  const result = parser.getResult();

  const deviceInfo = {
    usedBrowser: result.browser.name || "Unknown",
    browserVersion: result.browser.version || "",
    cpu: result.cpu.architecture || "unknown",
    opSystem: result.os.name || "Unknown",
    osVersion: result.os.version || "",
    type: result.device.type || "desktop",
    model:
      result.device.model ||
      (result.device.type ? "Model not identified" : "PC-Computer"),
    vendor:
      result.device.vendor ||
      (result.device.type ? "Manufacturer not identified" : "N/A"),
    localTime: localTime,
    timezone: "Europe/Madrid",
  };

  res.json(deviceInfo);
});

// Rota principal serve o arquivo HTML
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Exportar para Vercel
export default app;
