/**
 * Game Logic
 *
 */
let numOfPlayers = 0;
let nextTurn = true;
let nextEnemy = 0;
let gameText = '';
let specialCard = '';
let enemy1Cards = 0;
let enemy2Cards = 0;
let enemy3Cards = 0;
let openCardStack = '';
let playerCards = [];

function updateGame() {
    if (gameText.startsWith('Du bist dran')) {
        gameText = 'Du bist am Zug';
    }
    changeGameText(gameText);

    changeMiddleDiv();

    changePlayerDiv();

    $('#card-stack-0').empty();
    cssClasses = '';
    if (numOfPlayers === 2) {
        cssClasses = ' small-card';
    } else {
        cssClasses = ' big-card';
    }
    if (nextEnemy === 1 && !nextTurn) {
        cssClasses += ' active-player-glow';
    }
    for (let i = 0; i < enemy1Cards; i++) {
        $('#card-stack-0').append(`<img class="cardNotClickable buzz-out-on-hover${cssClasses}" src="../assets/images/assets/Deck.png">`);
    }

    if (numOfPlayers >= 3) {
        $('#card-stack-1').empty();
        let cssClasses = '';
        if (nextEnemy === 2 && !nextTurn) {
            cssClasses = ' active-player-glow';
        }
        for (let i = 0; i < enemy2Cards; i++) {
            $('#card-stack-1').append(`<img class="cardNotClickable buzz-out-on-hover big-card${cssClasses}" src="../assets/images/assets/Deck.png">`);
        }
    }

    if (numOfPlayers === 4) {
        $('#card-stack-3').empty();
        let cssClasses = '';
        if (nextEnemy === 3 && !nextTurn) {
            cssClasses = ' active-player-glow';
        }
        for (let i = 0; i < enemy3Cards; i++) {
            $('#card-stack-3').append(`<img class="cardNotClickable buzz-out-on-hover big-card${cssClasses}" src="../assets/images/assets/Deck.png">`);
        }
    }

    activateDroppable();
}

/**
 * Event Listeners
 *
 */
function chooseColor(color) {
    $.ajax({
        method: 'GET',
        url: '/setspecial/' + specialCard + '/' + color.toLowerCase(),
        dataType: 'text',

        error: () => {
            alert('Could not set special card!');
        }
    });
}

function chooseColorScreen() {
    $('#open-and-covered-cards').empty();

    const colors = ['Blue', 'Red', 'Green', 'Yellow'];
    let id = '';
    specialCard.charAt(2) === 'C' ? id = 'C' : id = 'D';
    for(let i = 0; i < 4; i++) {
        $('#open-and-covered-cards').append(`<img onclick="chooseColor('${colors[i]}')" class="cardClickable" style="margin-left: 5px;" src="../assets/images/assets/${colors[i]}_${id}.png" width="5%">`);
    }
}

function changeMiddleDiv() {
    $('#open-and-covered-cards').empty();
    $('#open-and-covered-cards').append(`<img id="deck-card" onclick="getCard()" class="cardClickable stacks-padding" src="../assets/images/assets/Deck.png" width="5%">`);
    $('#open-and-covered-cards').append(`<img id="open-card-stack" class="dropzone stacks-padding" src="../assets/images/assets/${openCardStack.replace(' ', '_')}.png" width="5%">`);
}

function changePlayerDiv() {
    if (numOfPlayers === 2) {
        $('#card-stack-1').empty();
    } else {
        $('#card-stack-2').empty();
    }
    let cssClasses = '';
    if (nextTurn) {
        cssClasses = ' active-player-glow';
    }
    if (numOfPlayers <= 3) {
        cssClasses += ' small-card';
    } else {
        cssClasses += ' big-card';
    }
    playerCards.forEach((card) => {
        const cardHtml = `
        <span class="container-dropzone">
            <span class="dropzone draggable-dropzone--occupied">
                <img id="${card}" class="item-draggable cardClickable${cssClasses}" src="${'../assets/images/assets/' + card.replace(' ', '_') + '.png'}">
            </span>
        </span>`;

        if (numOfPlayers === 2) {
            $('#card-stack-1').append(cardHtml);
        } else {
            $('#card-stack-2').append(cardHtml);
        }
    })
}

function changeGameText(text) {
    $('#game-text').text(text);
}

function getCard() {
    $.ajax({
        method: 'GET',
        url: '/get',
        dataType: 'text',

        error: () => {
            alert('Could not get card!');
        }
    });
}

/**
 * Utility Functions
 *
 */
function Sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

/**
 * Draggable Library
 *
 */
function activateDroppable() {
    let onDropzone = false;
    let dragMove = 0;

    const droppable = new Draggable.Droppable(document.querySelectorAll('.container-dropzone'), {
        draggable: '.item-draggable',
        dropzone: '.dropzone',
        classes: {
            'source:dragging': 'hide-card',
            'mirror': 'mirror-card',
        },
    });

    droppable.on('drag:move', () => {
        dragMove++;
    });

    droppable.on('droppable:dropped', () => {
        onDropzone = true;
        const card = document.getElementById('open-card-stack');
        card.classList.add('card-deck-dropzone');
    });

    droppable.on('droppable:returned', () => {
        onDropzone = false;
        const card = document.getElementById('open-card-stack');
        card.classList.remove('card-deck-dropzone');
    });

    droppable.on('droppable:stop', (event) => {
        const card = event.dragEvent.originalSource.id;
        if (onDropzone || dragMove <= 1) {
            if (card.toString().startsWith('S')) {
                $.ajax({
                    method: 'GET',
                    url: '/choosecolor/' + card,
                    dataType: 'text',

                    success: () => {
                        $('#open-card-stack').removeClass('draggable-dropzone--occupied');
                    },
                    error: () => {
                        alert('Could not set card!');
                    }
                });
            } else {
                $.ajax({
                    method: 'GET',
                    url: '/set/' + card,
                    dataType: 'text',

                    success: () => {
                        $('#open-card-stack').removeClass('draggable-dropzone--occupied');
                    },
                    error: () => {
                        alert('Could not set card!');
                    }
                });
            }
        } else {
            dragMove = 0;
        }
    });
}

/**
 * Create Rain
 *
 */
function randRange(maxNum, minNum) {
    return (Math.floor(Math.random(10) * (maxNum - minNum + 1)) + minNum);
}

function createRain() {
    for (let i = 0; i < 950; i++) {

        let dropLeft = randRange(0, 3000);
        let dropTop = randRange(-1000, 1000);
        $('.rain').append('<div class="drop" id="drop'+ i +'"></div>');
        $('#drop' + i).css('left', dropLeft);
        $('#drop' + i).css('top', dropTop);
    }
}

/**
 * Winning & Loosing Screen
 *
 */
const swalHtml = `
    <form style="margin: 5px 5px 5px 5px !important;" action="/new/2">
        <input type="submit" class="btn-new-game" value="New Game: 2 Players"/>
    </form>
    <form style="margin: 5px 5px 5px 5px !important;" action="/new/3">
        <input type="submit" class="btn-new-game" value="New Game: 3 Players"/>
    </form>
    <form style="margin: 5px 5px 5px 5px !important;" action="/new/4">
        <input type="submit" class="btn-new-game" value="New Game: 4 Players"/>
    </form>
`;

async function winningScreen() {
    changeGameText("");
    Swal.fire({
        title: 'Gl??ckwunsch, du hast gewonnen!',
        width: 600,
        padding: '3em',
        allowOutsideClick: false,
        showConfirmButton: false,
        html: swalHtml,
    });

    const jsConfetti = new JSConfetti();
    await Sleep(100);
    while (true) {
        jsConfetti.addConfetti();
        await Sleep(3000);
    }
}

function loosingScreen() {
    changeGameText("");
    Swal.fire({
        title: 'Du hast leider verloren',
        width: 600,
        padding: '3em',
        allowOutsideClick: false,
        showConfirmButton: false,
        html: swalHtml,
    });

    createRain();
}

/**
 * Automatic Gameplay
 *
 */
async function nextStep() {
    if (gameText !== 'Du bist am Zug' && gameText !== 'W??hle eine Farbe' && gameText !== 'Gl??ckwunsch, du hast gewonnen!' &&
        gameText !== 'Du hast leider verloren') {
        await Sleep(1000);
        $.ajax({
            method: 'GET',
            url: '/dostep',
            dataType: 'text',

            error: () => {
                alert('Next step not possible!');
            }
        });
    }
}

function iconBar() {
    $('#undo').on('click', () => {
        $.ajax({
            method: 'GET',
            url: '/undo',
            dataType: 'text',

            error: () => {
                alert('Undo Not Possible!');
            }
        });
    });
    $('#redo').on('click', () => {
        $.ajax({
            method: 'GET',
            url: '/redo',
            dataType: 'text',

            error: () => {
                alert('Undo Not Possible!');
            }
        });
    });
    $('#save').on('click', () => {
        $.ajax({
            method: 'GET',
            url: '/save',
            dataType: 'text',

            error: () => {
                alert('Undo Not Possible!');
            }
        });
    });
}

function connectWebSocket() {
    let websocket = new WebSocket("ws://localhost:9000/websocket");
    websocket.setTimeout

    websocket.onopen = function(event) {
        console.log("Connected to Websocket");

        $.ajax({
            method: 'GET',
            url: '/json',
            dataType: 'json',

            success: (result) => {
                loadGame(result);
            },
            error: () => {
                alert('Could not load Json!');
            }
        });
    }

    websocket.onclose = function () {
        console.log('Connection with Websocket Closed!');
    };

    websocket.onerror = function (error) {
        console.log('Error in Websocket Occured: ' + error);
    };

    websocket.onmessage = function (e) {
        if (typeof e.data === "string") {
            if (e.data === "GameWon") {
                winningScreen();
            } else if (e.data === "GameLost") {
                loosingScreen();
            } else if (e.data.toString().startsWith("GameNotChanged")) {
                if(e.data.toString().length > 14) {
                    let json = JSON.parse(e.data.toString().substring(15));
                    loadGame(json);
                }
            } else if (e.data.toString().startsWith("ChooseColor")) {
                specialCard = e.data.toString().substring(13, 16);
                chooseColorScreen();
                changeGameText(e.data.toString().substring(16));
            } else {
                let json = JSON.parse(e.data);
                loadGame(json);
            }
        }

    };
}

function loadGame(json) {
    numOfPlayers = json.game.numOfPlayers;
    nextTurn = json.game.nextTurn;
    nextEnemy = json.game.nextEnemy;
    gameText = json.game.gameText;
    specialCard = json.game.specialCard;
    enemy1Cards = json.game.enemy1Cards;
    enemy2Cards = json.game.enemy2Cards;
    enemy3Cards = json.game.enemy3Cards;
    openCardStack = json.game.openCardStack;
    playerCards = json.game.playerCards;

    updateGame();

    if(window.location.href.includes('new') || window.location.href.includes('load') || window.location.href.includes('save')) {
        nextStep();
    }
}


/**
 * On Load
 *
 */
$(document).ready(function() {
    iconBar();
    connectWebSocket();
});