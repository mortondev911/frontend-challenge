class App {
  puzzleField = null;
  tiles = null;
  tilePositionList = [0];
  tileDimension = 0;
  size = 0;
  moves = 0;

  // using 4px as gutter space between tiles, divide puzzle field
  // into equal parts based on size variable
  static gutterSpacing = 4;

  initView = () => {
    // set default values
    this.puzzleField = document.querySelector(".puzzle");
    this.tiles = this.puzzleField?.getElementsByClassName("tile");

    const numberOfTiles =
      this.tiles?.length !== 8 && this.tiles?.length !== 15
        ? 8
        : this.tiles?.length;
    // rows and columns size based on tiles
    this.size = numberOfTiles === 8 ? 3 : 4;

    for (let i = 1; i <= numberOfTiles; i++) {
      this.tilePositionList.push(i);
    }
    // set a fixed width and height for puzzle field
    this.puzzleField.style.width = "500px";
    this.puzzleField.style.height = "500px";

    this.tileDimension =
      (500 - App.gutterSpacing * (this.size + 1)) / this.size;

    this.shuffle();
  };

  // Draw tiles is a one time operation that should and only runs
  // after window/document becomes ready; called after initView
  drawTiles = () => {
    // clear puzzle div for new list rending
    this.puzzleField.innerHTML = "";

    for (let i = 0; i < this.tilePositionList.length; i++) {
      const item = this.tilePositionList[i];
      if (item !== 0) {
        const tile = document.createElement("li");
        tile.classList.add("tile");
        tile.innerText = item.toString();

        // set height and width of tile
        tile.style.width = `${this.tileDimension}px`;
        tile.style.height = `${this.tileDimension}px`;

        // Get default tile row position using modulo of
        // size on index multiply tileDimension + vertical gutter spacing
        const positionOnXAxis = this.positionOnXYAxis(i % this.size);

        // Get default tile column position using index divided
        // by size multiply by tileDimension + horizontal gutter spacing
        const positionOnYAxis = this.positionOnXYAxis(
          Math.floor(i / this.size)
        );

        // set tile position based on XY
        tile.style.top = `${positionOnYAxis}px`;
        tile.style.left = `${positionOnXAxis}px`;

        // set custom data tribute on tile for position later tracking
        // this is set to current index
        tile.setAttribute("data-position-index", i.toString());

        // add click event listener on tile
        tile.addEventListener("click", this.onTileClick);

        window.onunload = () => {
          tile.removeEventListener("click", this.onTileClick);
        };

        // add tile to puzzle div
        this.puzzleField?.appendChild(tile);
      }
    }
  };

  onTileClick = (event) => {
    const tile = event.target;
    let canMoveXAxis = false,
      canMoveYAxis = false;

    // Move of tile is a based on a simple logic
    // this approach helps avoid creating 2D-arrays
    // when checking for moves. Instead we perceive the idea of
    // 2D-arrays by getting the current index of zero in our tilePositionList
    // 0 is the item in our array that we use as the empty tile
    // we also need to get the index of the item user is trying to move,
    // we get this by getting the data-position-index attribute set at rending
    //
    // We then base on a simple algo to check where we need to move to,
    // both on the XAxis or on YAxis. and this works since our games is either
    // 3x3 or 4x4
    //
    // Having this example as 3x3 array [1 2 8 0 3 7 6 4 5], we will have a game of
    // 1 2 8
    // 0 3 7
    // 6 4 5
    //
    // The index of 0 in our array will be 3, and if we want to

    // To move on the XAxis (Left<->Right)
    // ====================================
    // we will need to check if clicked tile data-position-index is
    // an immediate neighbor to index of 0 in our list
    // we can do so by check to the left side index of 0 minus 1
    // to right side index of 0 plus 1
    // if any of this index is the same as clicked tile index
    // we then check if click index is either the last tile on the
    // previous row above row which 0 can be located or the first
    // tile on the next row after row which can be located
    //
    // our formula is (Zi-1 === Ci && (Ci+1 % S !==0)) || (Zi+1 === Ci && (Ci % S !== 0))
    // where Zi is index of 0
    //       Ci is index of clicked tile
    //       S is the number of tiles per row

    // To move on the YAxis (Top<->Bottom)
    // ======================================
    // We will just need to check if the clicked tile index minus the size of the tiles per
    // row is equal to index of 0 or clicked tile index plus size of the tiles per row is
    // equal to index of 0
    //
    // our formula is (Ci-1 === Zi) || (Ci+1 === Zi)
    // where Zi is index of 0
    //       Ci is index of clicked tile

    const assignedIndex = tile.getAttribute("data-position-index");
    const currentTileVirtualPosition = parseInt(assignedIndex);
    const indexOfZero = this.tilePositionList.indexOf(0);

    // can move tile from bottom to top or bottom to top on Y axis
    if (
      currentTileVirtualPosition - this.size === indexOfZero ||
      currentTileVirtualPosition + this.size === indexOfZero
    ) {
      canMoveYAxis = true;
    }

    // can move tile from left to right or right to left on X axis
    else if (
      (indexOfZero - 1 === currentTileVirtualPosition &&
        (currentTileVirtualPosition + 1) % this.size !== 0) ||
      (indexOfZero + 1 === currentTileVirtualPosition &&
        currentTileVirtualPosition % this.size !== 0)
    ) {
      canMoveXAxis = true;
    }

    // Once we can move tile, we need to get the next position
    // and also swap the current position in our list with empty space (0)

    if (canMoveXAxis || canMoveYAxis) {
      // set new data-position-index with index of zero
      tile.setAttribute("data-position-index", indexOfZero.toString());
      this.tilePositionList = this.tilePositionList.map((tile, index) => {
        if (index === indexOfZero) {
          return this.tilePositionList[currentTileVirtualPosition];
        }
        if (index === currentTileVirtualPosition) {
          return 0;
        }
        return tile;
      });

      // Move position of tile based on direction we can move based on the position
      // of empty space
      if (canMoveYAxis) {
        tile.style.top = `${this.positionOnXYAxis(
          Math.floor(indexOfZero / this.size)
        )}px`;
      }
      if (canMoveXAxis) {
        tile.style.left = `${this.positionOnXYAxis(indexOfZero % this.size)}px`;
      }
      this.moves += 1;
      this.checkPuzzle();
    }
  };

  // calculate and return the next position of a moving tile
  // with gutter spacing
  positionOnXYAxis = (dXY) => {
    const tileDimensionWithGutter = this.tileDimension + App.gutterSpacing;
    return dXY * tileDimensionWithGutter + App.gutterSpacing;
  };

  // check if user solved puzzle
  checkPuzzle = () => {
    const maxLength = this.tilePositionList.length;
    let completed = true;
    for (let i = 0; i < maxLength - 1; i++) {
      const currentTile = this.tilePositionList[i];
      if (i + 1 !== currentTile || currentTile === 0) {
        completed = false;
        break;
      }
    }

    if (completed) {
      alert(`Puzzle completed in ${this.moves} moves`);
      this.shuffle();
    }
  };

  shuffle = () => {
    let m = this.tilePositionList.length,
      t,
      i;
    // While there remain elements to shuffle…
    while (m) {
      // Pick a remaining element…
      i = Math.floor(Math.random() * m--);

      // And swap it with the current element.
      t = this.tilePositionList[m];
      this.tilePositionList[m] = this.tilePositionList[i];
      this.tilePositionList[i] = t;
    }
    this.moves = 0;
    this.drawTiles();
  };
}

export default new App();
