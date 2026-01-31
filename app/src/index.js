import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({
    service: "Scientific Data Harvester",
    status: "running",
    message: "Backend service is ready for data collection"
  });
});

app.listen(PORT, () => {
  console.log(`Scientific Data Harvester running on port ${PORT}`);
});
