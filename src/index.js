module.exports = function solveSudoku(matrix) {
	let sudoku = new Sudoku(matrix);
	sudoku.solution();
	return sudoku.getSolutionMatrix();
};

class Sudoku {
	constructor(matrix) {
		this._matrix = matrix;
		this._decided = [];
	}

	// find sudoku solution
	solution() {
		// search - count of blank cells
		// lastSearch - count of empty cells previous iteration
		// count - number of iterations
		let search = this._init();
		let lastSearch = 0;
		let count = 0;

		while (search > 0) {

			for (let i = 0; i < 9; i++) {
				for (let j = 0; j < 9; j++) {

					// if cell is empty
					if (this._decided[i][j][0] === 0) {
						search = this._searchSingle(i, j, search);

						if (count > 0) {
							search = this._searchHideSingle(i, j, search);
						}
					}
				}
			}

			// if the iteration did not change the number of found elements - break
			if (lastSearch === search) {
				break;
			}
			lastSearch = search;
		}

		// if sudoku doesn't have solution and if sudoku isn't fail
		if (!this.isDecided() && !this.isFailed()) {
			this._recursionSearch();
		}
	}

	getSolutionMatrix() {
		let result = [];

		for (let i = 0; i < 9; i++) {
			result.push([]);
			for (let j = 0; j < 9; j++) {
				result[i][j] = this._decided[i][j][0];
			}
		}

		return result;
	}

	_init() {
		let search = 0;

		for (let i = 0; i < 9; i++) {
			this._decided.push([]);

			for (let j = 0; j < 9; j++) {
				let result = [];

				// if cell is empty, add array of candidates, else add just value
				if (this._matrix[i][j] === 0) {
					result = [0, [1, 2, 3, 4, 5, 6, 7, 8, 9]];
					search++;
				} else {
					result = [this._matrix[i][j]];
				}

				this._decided[i].push(result);
			}
		}

		return search;
	}

	// search single candidates. If count of candidates is 1, add candidate. return count of empty cells
	_searchSingle(i, j, search) {
		this._decided[i][j][1] = this._uniqueValueOfArray(this._decided[i][j][1], this._colContent(i));
		this._decided[i][j][1] = this._uniqueValueOfArray(this._decided[i][j][1], this._rowContent(j));
		this._decided[i][j][1] = this._uniqueValueOfArray(this._decided[i][j][1], this._sectionContent(i, j));
		return this._pushValue(i, j, search);
	}

	// search hide candidates. If the column or row value in the cell is unique, add it value. return count of empty cells
	_searchHideSingle(i, j, search) {
		let arrCall = [
			this._uniqueValueOfArray(this._decided[i][j][1], this._colHideContent(i, j)),
			this._uniqueValueOfArray(this._decided[i][j][1], this._rowHideContent(j, i)),
		];

		for (let k = 0; k < arrCall.length; k++) {
			let result = arrCall[k];

			if (result.length === 1) {
				this._decided[i][j][1] = result;
				search = this._pushValue(i, j, search);
				break;
			}
		}

		return search;
	}

	//finds unique values from 2 arrays and add it in result
	_uniqueValueOfArray(arr1, arr2) {
		let result = [];

		arr1.forEach(item => {
			let index = arr2.indexOf(item);
			// if arr2 doesn't have item, add item in result
			if (index === -1) {
				result.push(item);
			}
		});

		return result;
	}

	// add in result non-empty values in column
	_colContent(i) {
		let result = [];

		for (let j = 0; j < 9; j++) {
			if (this._decided[i][j][0] !== 0) {
				result.push(this._decided[i][j][0]);
			}
		}

		return result;
	}

	// add in result non-empty values in row
	_rowContent(j) {
		let result = [];

		for (let i = 0; i < 9; i++) {
			if (this._decided[i][j][0] !== 0) {
				result.push(this._decided[i][j][0]);
			}
		}

		return result;
	}

	// add in result non-empty values in section
	_sectionContent(iElem, jElem) {
		// define start coordinates of section
		let [col, row] = this._startSection(iElem, jElem);
		let result = [];

		for (let i = col; i < col + 3; i++) {
			for (let j = row; j < row + 3; j++) {
				if (this._decided[i][j][0] !== 0) {
					result.push(this._decided[i][j][0]);
				}
			}
		}

		return result;
	}

	// add in result candidates from empty cells
	_colHideContent(i, row) {
		let result = [];

		for (let j = 0; j < 9; j++) {
			if (j !== row && this._decided[i][j][0] === 0) {
				result = [].concat(result, this._decided[i][j][1]);
			}
		}

		return result;
	}

	// add in result candidates from empty rows
	_rowHideContent(j, col) {
		let result = [];

		for (let i = 0; i < 9; i++) {
			if (i !== col && this._decided[i][j][0] === 0) {
				result = [].concat(result, this._decided[i][j][1]);
			}
		}

		return result;
	}

	// compute start coordinates of section
	_startSection(i, j) {
		return [Math.floor(i / 3) * 3, Math.floor(j / 3) * 3];
	}

	// if cell has only one candidate, push candidate in cell. Count of candidates decrease
	_pushValue(i, j, search) {
		if (this._decided[i][j][1].length === 1) {
			this._decided[i][j][0] = this._decided[i][j][1][0];
			search--;
		}
		return search;
	}

	//checks if a solution is found
	isDecided() {
		let isDecide = true;

		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {
				if (this._decided[i][j][0] === 0) {
					isDecide = false;
					break;
				}
			}
		}

		return isDecide;
	};

	//check if cell of value is 0 and cell doesn't have candidates
	isFailed() {
		let isFail = false;

		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {
				if (this._decided[i][j][0] === 0 && !this._decided[i][j][1].length) {
					isFail  = true;
				}
			}
		}

		return isFail;
	}

	_returnDecide() {
		return this._decided;
	}

	_recursionSearch() {
		// create new matrix and search cell with min count candidates and define iMin and jMin of this cell
		let newMatrix = [[], [], [], [], [], [], [], [], []];
		let iMin = -1, jMin = -1, minCount = 0;

		//fill newMatrix  with the values of decided
		for (let i = 0; i < 9; i++) {
			newMatrix[i].length = 9;
			for (let j = 0; j < 9; j++) {
				newMatrix[i][j] = this._decided[i][j][0];

				// if a cell doesn't have value and the cell has the least length candidates
				if (this._decided[i][j][0] === 0 && (this._decided[i][j][1].length < minCount || minCount === 0)) {
					minCount = this._decided[i][j][1].length;
					iMin = i;
					jMin = j;
				}
			}
		}

		return this._recursionMethod(newMatrix, iMin, jMin, minCount)
	};

	_recursionMethod(matrix, i, j, count) {
		// push in matrix one of candidates while we won't find a solution
		for (let k = 0; k < count; k++) {
			matrix[i][j] = this._decided[i][j][1][k];

			//recursion
			let sudoku = new Sudoku(matrix);
			sudoku.solution();
			if (sudoku.isDecided()) {
				this._decided = sudoku._returnDecide();
				return;
			}
		}
	}
}
