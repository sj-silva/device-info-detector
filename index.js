import express from "express";
import { DateTime } from "luxon";
import { UAParser } from "ua-parser-js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Servir arquivos estáticos da pasta 'public'
app.use(express.static("public"));

// Rota principal que envia os dados via JSON para o frontend
app.get("/api/device-info", (req, res) => {
  const now = DateTime.now().setZone("Europe/Madrid");
  const localTime = now.toFormat("dd/MM/yyyy HH:mm:ss");

  const parser = new UAParser();
  parser.setUA(req.headers["user-agent"]);

  const result = parser.getResult();

  // Função para obter o tipo de dispositivo com ícone
  const getDeviceTypeIcon = (type) => {
    const types = {
      mobile: "📱 Smartphone",
      tablet: "📟 Tablet",
      desktop: "💻 Desktop",
      smarttv: "📺 Smart TV",
      console: "🎮 Console",
    };
    return types[type] || "💻 Desktop";
  };

  const deviceInfo = {
    usedBrowser: result.browser.name || "Unkown",
    browserVersion: result.browser.version || "",
    cpu: result.cpu.architecture || "unkown",
    opSystem: result.os.name || "Unkown",
    osVersion: result.os.version || "",
    type: result.device.type || "Desktop",
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

app.listen(port, () => {
  console.log(`🚀 Server listening on http://localhost:${port}`);
  console.log(`📍 Timezone: Europe/Madrid`);
  console.log(`📁 Static files: /public folder`);
});
