let express = require('express');
let cors = require('cors');
let fs = require('fs');
let app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors({
	origin: (origin, callback) => {
		callback(null, true);
	}
}));

app.get('/', (req, res) => {
	res.json({
		status: "success",
		message: "running successfully"
	});
});

app.post('/gamestate/:id', (req, res) => {
	console.log(req.body);
	// TODO save game state with id
	let id = req.params.id;
	fs.writeFile('./server/states/game_' + id + ".json", JSON.stringify(req.body), (err) => {
		if(err){
			console.error("Error", err);
		}
	});
	res.json({
		status: "success",
		message: "successfully submitted",
		state: req.body
	});
});

app.get('/gamestate/:id', (req, res) => {
	// TODO
});

app.listen(PORT, () => {
	console.log("🍫 server listening", PORT);
})
