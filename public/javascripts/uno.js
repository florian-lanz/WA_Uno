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

function loadJson() {
    $.ajax({
        method: 'GET',
        url: '/json',
        dataType: 'json',

        success: (result) => {
            numOfPlayers = result.game.numOfPlayers;
            nextTurn = result.game.nextTurn;
            nextEnemy = result.game.nextEnemy;
            gameText = result.game.gameText;
            specialCard = result.game.specialCard;
            enemy1Cards = result.game.enemy1Cards;
            enemy2Cards = result.game.enemy2Cards;
            enemy3Cards = result.game.enemy3Cards;
            openCardStack = result.game.openCardStack;
            playerCards = result.game.playerCards;

            updateGame();

            if(window.location.href.includes('new') || window.location.href.includes('load') || window.location.href.includes('save')) {
                nextStep();
            }
        },
        error: () => {
            alert('Could not load Json!');
        }
    });
}

function updateGame() {
    if (gameText.startsWith('Du bist dran')) {
        gameText = 'Du bist am Zug';
    }
    $('#game-text').text(gameText);

    $('#open-and-covered-cards').empty();
    if (gameText === 'Wähle eine Farbe') {
        const colors = ['Blue', 'Red', 'Green', 'Yellow'];
        let id = '';
        if(specialCard.charAt(2) === 'C' ) {
            id = 'C';
        } else {
            id = 'D';
        }
        for(let i = 0; i < 4; i++) {
            $('#open-and-covered-cards').append(`<img onclick="chooseColor('${colors[i]}')" class="cardClickable" style="margin-left: 5px;" src="../assets/images/assets/${colors[i]}_${id}.png" width="5%">`);
        }
    } else {
        $('#open-and-covered-cards').append(`<img id="deck-card" onclick="getCard()" class="cardClickable stacks-padding" src="../assets/images/assets/Deck.png" width="5%">`);
        $('#open-and-covered-cards').append(`<img id="open-card-stack" class="dropzone stacks-padding" src="../assets/images/assets/${openCardStack.replace(' ', '_')}.png" width="5%">`);
    }

    if (numOfPlayers === 2) {
        $('#card-stack-1').empty();
    }else {
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

        success: () => {
            loadJson();
        },
        error: () => {
            alert('Could not set special card!');
        }
    });
}

function getCard() {
    $.ajax({
        method: 'GET',
        url: '/get',
        dataType: 'text',

        success: () => {
            loadJson();
        },
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
                        loadJson();
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
                        loadJson();
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
    Swal.fire({
        title: 'Glückwunsch, du hast gewonnen!',
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
    if (gameText !== 'Du bist am Zug' && gameText !== 'Wähle eine Farbe' && gameText !== 'Glückwunsch, du hast gewonnen!' &&
        gameText !== 'Du hast leider verloren') {
        await Sleep(1000);
        $.ajax({
            method: 'GET',
            url: '/dostep',
            dataType: 'text',

            success: () => {
                loadJson();
            },
            error: () => {
                alert('Next step not possible!');
            }
        });
    } else if (gameText === 'Glückwunsch, du hast gewonnen!') {
        console.log(gameText);
        await winningScreen();
    } else if (gameText === 'Du hast leider verloren') {
        loosingScreen();
    }
}

/**
 * On Load
 *
 */
$(document).ready(function() {
    loadJson();
});