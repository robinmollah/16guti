const express = require("express");
const router = express.Router();
const matchmaker = require("../matchmaker");

router.get("/waiting_room", (req, res) => {
  res.json(matchmaker.waiting_room);
});

module.exports = router;
