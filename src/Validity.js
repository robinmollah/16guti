/**
 * Convert orientation index to matrix corientation indices
 * For example: 9 -> 1, 4
 */
export function convertToMatrixCoord(index){
	return [Math.floor(index / 5), index % 5];
}

export function rowColumnOfMat(index){
	return {
		"row": Math.floor(index/5),
		"col": index % 5
	}
}

/**
 * Convert matrix indices to orientation index
 * @param row
 * @param column
 * @returns {*}
 */
export function convertToOrientation(row, column){
	return row * 5 + column;
}

export function inBound(value){
	return value >= 0 && value < 5;
}
