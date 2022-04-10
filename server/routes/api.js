const express = require("express");
const router = express.Router();
const matchmaker = require("../matchmaker");

router.get("/waiting_room", (req, res) => {
	res.json(Object.keys(matchmaker.waiting_room));
});

router.get("/room", (req, res) => {
	res.json(Object.keys(matchmaker.room));
});

module.exports = router;
