var victoryAudio = new Audio('audio/victory.mp3')

//Get a reference to the stage and output
var stage = document.querySelector("#stage");
var output = document.querySelector("#output");

//Add a keyboard listener
window.addEventListener("keydown", keydownHandler, false);

//The game map
var map =
[
  [0, 2, 0, 0, 0, 0, 0, 3],
  [0, 0, 0, 1, 0, 0, 2, 0],
  [0, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 2, 0, 0, 1],
  [0, 2, 1, 0, 0, 0, 2, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 2]
];

//The game objects map
var gameObjects =
[
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 5, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [4, 0, 0, 0, 0, 0, 0, 0]
];

//Map code
var TILE = 0;
var HOUSE = 1;
var SKELETON = 2;
var ZELDA = 3;
var CHAR = 4;
var GANON = 5;

//The size of each cell
var SIZE = 64;

//The number of rows and columns
var ROWS = map.length;
var COLUMNS = map[0].length;

//Find the char's and ganon's start positions
var charRow;
var charColumn;
var ganonRow;
var ganonColumn;

for (var row = 0; row < ROWS; row++) {
    for (var column = 0; column < COLUMNS; column++) {
        if (gameObjects[row][column] === CHAR) {
            charRow = row;
            charColumn = column;
        }
        if (gameObjects[row][column] === GANON) {
            ganonRow = row;
            ganonColumn = column;
        }
    }
}

//Arrow key codes
var UP = 38;
var DOWN = 40;
var RIGHT = 39;
var LEFT = 37;

//The game variables
var elixirs = 10;
var rupees = 10;
var experience = 0;
var gameMessage = "Use the arrow keys to find your way to rescue Zelda.";

render();

function keydownHandler(event) {
    switch (event.keyCode) {
        case UP:
            if (charRow > 0) {
                //Clear the char's current cell
                gameObjects[charRow][charColumn] = 0;

                //Subract 1 from the char's row
                charRow--;

                //Apply the char's new updated position to the array
                gameObjects[charRow][charColumn] = CHAR;
            }
            break;

        case DOWN:
            if (charRow < ROWS - 1) {
                gameObjects[charRow][charColumn] = 0;
                charRow++;
                gameObjects[charRow][charColumn] = CHAR;
            }
            break;

        case LEFT:
            if (charColumn > 0) {
                gameObjects[charRow][charColumn] = 0;
                charColumn--;
                gameObjects[charRow][charColumn] = CHAR;
            }
            break;

        case RIGHT:
            if (charColumn < COLUMNS - 1) {
                gameObjects[charRow][charColumn] = 0;
                charColumn++;
                gameObjects[charRow][charColumn] = CHAR;
            }
            break;
    }

    //find out what kind of cell the char is on
    switch (map[charRow][charColumn]) {
        case TILE:
            gameMessage = "You make your way through the forest."
            break;

        case SKELETON:
            fight();
            break;

        case HOUSE:
            trade();
            break;

        case ZELDA:
            endGame();
            break;
    }

    //Move the ganon
    moveMonster();


    //Find out if the char is touching the ganon
    if (gameObjects[charRow][charColumn] === GANON) {
        endGame();
    }

    //Subtract some elixirs each turn
    elixirs--;

    //Find out if the char has run out of elixirs or rupees
    if (elixirs <= 0 || rupees <= 0) {
        endGame();
    }

    //Render the game
    render();
}

function moveMonster() {
    //The 4 possible directions that the ganon can move
    var UP = 1;
    var DOWN = 2;
    var LEFT = 3;
    var RIGHT = 4;

    //An array to store the valid direction that
    //the ganon is allowed to move in
    var validDirections = [];

    //The final direction that the ganon will move in
    var direction = undefined;

    //Find out what kinds of things are in the cells
    //that surround the ganon. If the cells contain tile,
    //push the corresponding direction into the validDirections array

    //MONSTER AI
    //If monster row and column is greater than char, remove these two directions
    if (charColumn > ganonColumn && charRow > ganonRow) {
        if (ganonRow > 0) {
            var thingAbove = map[ganonRow - 1][ganonColumn];
            if (thingAbove === TILE) {
                validDirections.push(DOWN);
            }
        }
        if (ganonColumn > 0) {
            var thingToTheLeft = map[ganonRow][ganonColumn - 1];
            if (thingToTheLeft === TILE) {
                validDirections.push(RIGHT);
            }
        }
    }
    //If monster column is greater and row is less than char, remove these two directions
    else if (charColumn > ganonColumn && charRow < ganonRow) {
        if (ganonRow > 0) {
            var thingAbove = map[ganonRow - 1][ganonColumn];
            if (thingAbove === TILE) {
                validDirections.push(UP);
            }
        }
        if (ganonColumn < COLUMNS - 1) {
            var thingToTheRight = map[ganonRow][ganonColumn + 1];
            if (thingToTheRight === TILE) {
                validDirections.push(RIGHT);
            }
        }
    }
    //If monster row is greater and column is less than char, remove these two directions
    else if (charColumn < ganonColumn && charRow > ganonRow) {
        if (ganonRow > 0) {
            var thingAbove = map[ganonRow - 1][ganonColumn];
            if (thingAbove === TILE) {
                validDirections.push(DOWN);
            }
        }
        if (ganonColumn > 0) {
            var thingToTheLeft = map[ganonRow][ganonColumn - 1];
            if (thingToTheLeft === TILE) {
                validDirections.push(LEFT);
            }
        }
    }
    //If monster row and column is less than char, remove these two directions
    else if (charColumn < ganonColumn && charRow > ganonRow) {
        if (ganonRow < ROWS - 1) {
            var thingBelow = map[ganonRow + 1][ganonColumn];
            if (thingBelow === TILE) {
                validDirections.push(UP);
            }
        }
        if (ganonColumn < COLUMNS - 1) {
            var thingToTheRight = map[ganonRow][ganonColumn + 1];
            if (thingToTheRight === TILE) {
                validDirections.push(LEFT);
            }
        }
    }
    //If there are equal, ganondorf has chance to move anywhere
    else {
        if (ganonRow < ROWS - 1) {
            var thingBelow = map[ganonRow + 1][ganonColumn];
            if (thingBelow === TILE) {
                validDirections.push(UP);
            }
        }
        if (ganonRow > 0) {
            var thingAbove = map[ganonRow - 1][ganonColumn];
            if (thingAbove === TILE) {
                validDirections.push(DOWN);
            }
        }
        if (ganonColumn < COLUMNS - 1) {
            var thingToTheRight = map[ganonRow][ganonColumn + 1];
            if (thingToTheRight === TILE) {
                validDirections.push(RIGHT);
            }
        }
        if (ganonColumn < COLUMNS - 1) {
            var thingToTheRight = map[ganonRow][ganonColumn + 1];
            if (thingToTheRight === TILE) {
                validDirections.push(LEFT);
            }
        }
    }

    //The validDirections array now contains 0 to 4 directions that the
    //contain TILE cells. Which of those directions will the ganon
    //choose to move in?

    //If a valid direction was found, Randomly choose one of the
    //possible directions and assign it to the direction variable
    if (validDirections.length !== 0) {
        var randomNumber = Math.floor(Math.random() * validDirections.length);
        direction = validDirections[randomNumber];
    }

    //Move the ganon in the chosen direction
    switch (direction) {
        case UP:
            //Clear the ganon's current cell
            gameObjects[ganonRow][ganonColumn] = 0;
            //Subtract 1 from the ganon's row
            ganonRow--;
            //Apply the ganon's new updated position to the array
            gameObjects[ganonRow][ganonColumn] = GANON;
            break;

        case DOWN:
            gameObjects[ganonRow][ganonColumn] = 0;
            ganonRow++;
            gameObjects[ganonRow][ganonColumn] = GANON;
            break;

        case LEFT:
            gameObjects[ganonRow][ganonColumn] = 0;
            ganonColumn--;
            gameObjects[ganonRow][ganonColumn] = GANON;
            break;

        case RIGHT:
            gameObjects[ganonRow][ganonColumn] = 0;
            ganonColumn++;
            gameObjects[ganonRow][ganonColumn] = GANON;
    }
}

function trade() {
    //Figure out how much elixirs the house has
    //and how much it should cost
    var housesElixirs = experience + rupees;
    var cost = Math.ceil(Math.random() * housesElixirs);

    //Let the player buy elixirs if there's enough rupees
    //to afford it
    if (rupees > cost) {
        elixirs += housesElixirs;
        rupees -= cost;
        experience += 2;

        gameMessage
          = "You buy " + housesElixirs + " elixirs"
          + " for " + cost + " rupees."
    }
    else {
        //Tell the player if they don't have enough rupees
        experience += 1;
        gameMessage = "You don't have enough rupees to buy any elixirs."
    }
}

function fight() {

    //The chars strength
    var charStrength = Math.ceil((elixirs + rupees) / 2);

    //A random number between 1 and the char's strength
    var skeletonStrength = Math.ceil(Math.random() * charStrength * 2);

    if (skeletonStrength > charStrength) {
        //The skeletons ransack the char
        var stolenRupees = Math.round(skeletonStrength / 2);
        rupees -= stolenRupees;

        //Give the player some experience for trying
        experience += 1;

        //Update the game message
        gameMessage
          = "You fight and LOSE " + stolenGold + " rupees."
          + " char's strength: " + charStrength
          + " skeleton's strength: " + skeletonStrength;
    }
    else {
        //You win the skeletons' rupees
        var skeletonGold = Math.round(skeletonStrength / 2);
        rupees += skeletonGold;

        //Add some experience
        experience += 2;

        //Update the game message
        gameMessage
          = "You fight and WIN " + skeletonGold + " rupees."
          + " char's strength: " + charStrength
          + " skeleton's strength: " + skeletonStrength;
    }
}

function endGame() {
    if (map[charRow][charColumn] === ZELDA) {
        //Calculate the score
        var score = elixirs + rupees + experience;

        //Play Victory Music
        victoryAudio.play();

        //Display the game message
        document.getElementById("victoryText").innerText = "You did it. You rescued Zelda! " + "Final Score: " + score;
        showVictory();
    }
    else if (gameObjects[charRow][charColumn] === GANON) {
        document.getElementById("defeatText").innerText = "Ganondorf has defeated you!";
        showDefeat();
    }
    else {
        //Store string
        var defText = "";

        if (rupees <= 0) {
            defText += " You've run out of rupees!";
        }
        else {
            defText += " You've run out of elixirs!";
        }

        defText
          += " your journey ends here...";

        document.getElementById("defeatText").innerText = defText;

        showDefeat();
    }

    //Remove the keyboard listener to end the game
    window.removeEventListener("keydown", keydownHandler, false);
}

function render() {
    //Clear the stage of img cells
    //from the previous turn

    if (stage.hasChildNodes()) {
        for (var i = 0; i < ROWS * COLUMNS; i++) {
            stage.removeChild(stage.firstChild);
        }
    }

    //Render the game by looping through the map arrays
    for (var row = 0; row < ROWS; row++) {
        for (var column = 0; column < COLUMNS; column++) {
            //Create a img tag called cell
            var cell = document.createElement("img");

            //Set it's CSS class to "cell"
            cell.setAttribute("class", "cell");

            //Add the img tag to the <div id="stage"> tag
            stage.appendChild(cell);

            //Find the correct image for this map cell
            switch (map[row][column]) {
                case TILE:
                    cell.src = "images/tile.png";
                    break;

                case HOUSE:
                    cell.src = "images/house.png";
                    break;

                case SKELETON:
                    cell.src = "images/skeleton.png";
                    break;

                case ZELDA:
                    cell.src = "images/zelda.png";
                    break;
            }

            //Add the char and ganon from the gameObjects array
            switch (gameObjects[row][column]) {
                case CHAR:
                    cell.src = "images/character.png";
                    break;

                case GANON:
                    cell.src = "images/ganon.png";
                    break;
            }

            //Position the cell
            cell.style.top = row * SIZE + "px";
            cell.style.left = column * SIZE + "px";
        }
    }

    //Display the game message
    output.innerHTML = gameMessage;

    //Display the player's elixirs, rupees, and experience
    output.innerHTML
      += "<br>Rupees: " + rupees + ", Elixirs: "
      + elixirs + ", Experience: " + experience;
}
//Functions for switching between game screens
var menuAudio = new Audio('audio/menu.mp3');
var gameAudio = new Audio('audio/gerudo.mp3')
var isGameMuted;
var isTitleMuted = false;

function showGame() {
    document.getElementById("game").style.display = "block";
    document.getElementById("title").style.display = "none";
    menuAudio.pause();
    gameAudio.play();
    isGameMuted = false;
}
function showInstructions() {
    document.getElementById("instructions").style.display = "block";
    document.getElementById("title").style.display = "none";
    menuAudio.pause();
}
function showTitle() {
    document.getElementById("title").style.display = "block";
    document.getElementById("instructions").style.display = "none";
    playTitleTheme();
}
function showVictory() {
    document.getElementById("victory").style.display = "block";
    document.getElementById("game").style.display = "none";
    playTitleTheme();
}
function showDefeat() {
    document.getElementById("defeat").style.display = "block";
    document.getElementById("game").style.display = "none";
    gameAudio.pause;
    gameAudio.currentTime = 500;
    playTitleTheme();
}

function playTitleTheme() {
    menuAudio.play();
}
function playGameTheme() {
    gameAudio.play();
}
function muteTitle() {
    if (isTitleMuted == false) {
        menuAudio.currentTime = 500;
        isTitleMuted = true;
        document.getElementById("titleMute").innerText = "UNMUTE";
    }
    else {
        playTitleTheme();
        isTitleMuted = false;
        document.getElementById("titleMute").innerText = "MUTE";
    }
}
function muteGame() {
    if (isGameMuted == false) {
        gameAudio.currentTime = 500;
        isGameMuted = true;
        document.getElementById("gameMute").innerText = "UNMUTE";
    }
    else {
        playGameTheme();
        isGameMuted = false;
        document.getElementById("gameMute").innerText = "MUTE";
    }
}
function playVictoryTheme() {
    gameAudio.pause;
    gameAudio.currentTime = 500;
    victoryAudio.play();
}
function restart() {
    location.reload();
}

function gameLoad() {
    playTitleTheme();
    
    setInterval(function () {
        $("#naviBox").animate({ left: '+=430' }, 2000);
        $("#naviBox").animate({ top: '+=330' }, 2000);
        $("#naviBox").animate({ left: '-=430' }, 2000);
        $("#naviBox").animate(({ top: '-=330' }), 2000);
    }, 1000);
}


