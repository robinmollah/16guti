import Phaser from "phaser";
import { LINE_LENGTH } from "./index";

export function getLines() {
	let lines = [];

	// corner joining lines
	lines.push(new Phaser.Geom.Line(0, 0, LINE_LENGTH, LINE_LENGTH));
	lines.push(new Phaser.Geom.Line(0, LINE_LENGTH, LINE_LENGTH, 0));

	// diagonal lines
	lines.push(
		new Phaser.Geom.Line(
			LINE_LENGTH / 2,
			LINE_LENGTH,
			LINE_LENGTH,
			LINE_LENGTH / 2
		)
	);
	lines.push(
		new Phaser.Geom.Line(LINE_LENGTH / 2, LINE_LENGTH, 0, LINE_LENGTH / 2)
	);
	lines.push(
		new Phaser.Geom.Line(LINE_LENGTH / 2, 0, LINE_LENGTH, LINE_LENGTH / 2)
	);
	lines.push(new Phaser.Geom.Line(LINE_LENGTH / 2, 0, 0, LINE_LENGTH / 2));

	let dividend = LINE_LENGTH / 4;
	for (let i = 0; i < 5; i++) {
		lines.push(
			new Phaser.Geom.Line(0, dividend * i, LINE_LENGTH, dividend * i)
		);
		lines.push(
			new Phaser.Geom.Line(dividend * i, 0, dividend * i, LINE_LENGTH)
		);
	}

	return lines;
}
