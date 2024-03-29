import {
	convertToMatrixCoord,
	convertToOrientation,
	inBound,
	rowColumnOfMat,
} from "./Validity";
import { GUTI_COLOR, isBlank, TURN } from "./GutiManager";

let NOT_TURN = function () {
	return TURN === GUTI_COLOR.PLAYER1 ? GUTI_COLOR.PLAYER2 : GUTI_COLOR.PLAYER1;
};

/**
 * Valid moves of a guti in index position
 * @param index
 * @returns {[]}
 */
export function possibleMoves(orientation, index) {
	let matrixCord = convertToMatrixCoord(index);
	let validMoves = [];
	let row = matrixCord[0];
	let column = matrixCord[1];

	// Cross
	validMoves.push([row, column + 1]);
	validMoves.push([row, column - 1]);
	validMoves.push([row + 1, column]);
	validMoves.push([row - 1, column]);

	// Diags
	if (
		(row % 2 === 0 && column % 2 === 0) ||
    (row % 2 !== 0 && column % 2 !== 0)
	) {
		validMoves.push([row + 1, column + 1]);
		validMoves.push([row + 1, column - 1]);
		validMoves.push([row - 1, column - 1]);
		validMoves.push([row - 1, column + 1]);
	}

	validMoves = validMoves.map((value) => {
		// boundary check
		if (inBound(value[0]) && inBound(value[1]))
			return convertToOrientation(value[0], value[1]);
		else return -1;
	});
	let additionalMoves = [];
	validMoves = validMoves.filter(function (idx) {
		// Must be on empty place
		if (!isBlank(idx)) {
			if (orientation[idx] === NOT_TURN()) {
				// Got contact with a guti of opponent

				let me = rowColumnOfMat(index);
				let opponent = rowColumnOfMat(idx);
				if (me.col === opponent.col) {
					// Same column
					if (me.row < opponent.row) {
						// My guti is below opponents guti
						if (isBlank(convertToOrientation(opponent.row + 1, me.col))) {
							// valid move is above opponent
							additionalMoves.push(
								convertToOrientation(opponent.row + 1, me.col)
							);
						}
					} else if (me.row > opponent.row) {
						// My guti is above opponents guti
						if (isBlank(convertToOrientation(opponent.row - 1, me.col))) {
							// valid move is below opponent
							additionalMoves.push(
								convertToOrientation(opponent.row - 1, me.col)
							);
						}
					}
				} else if (me.row === opponent.row) {
					// same row
					if (me.col > opponent.col) {
						// Opp is in right side
						if (isBlank(convertToOrientation(me.row, opponent.col - 1))) {
							additionalMoves.push(
								convertToOrientation(me.row, opponent.col - 1)
							);
						}
					} else if (me.col < opponent.col) {
						// Opp is in left side
						if (isBlank(convertToOrientation(me.row, opponent.col + 1))) {
							additionalMoves.push(
								convertToOrientation(me.row, opponent.col + 1)
							);
						}
					}
				}

				return false;
			}
		}

		// Must be blank position to avoid putting on top of another GUTI
		return orientation[idx] === GUTI_COLOR.BLANK ? idx : false;
	});
	validMoves.push(...additionalMoves);
	return validMoves;
}
