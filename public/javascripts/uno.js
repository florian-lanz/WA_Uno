const Color = {
    Red: "R",
    Blue: "B",
    Green: "G",
    Yellow: "Y",
    Special: "S"
};

const Value = {
    Zero: "0",
    One: "1",
    Two: "2",
    Three: "3",
    Four: "4",
    Five: "5",
    Six: "6",
    Seven: "7",
    Eight: "8",
    Nine: "9",
    DirectionChange: "D",
    Suspend: "S",
    PlusTwo: "+2",
    PlusFour: "+4",
    ColorChange: "C",
};

class Card {
    constructor(color, value) {
        this.color = color;
        this.value = value;
    }

    toString() {
        if (this.value === Value.PlusTwo || this.value === Value.PlusFour) {
            return this.color + this.value;
        }
        return this.color + "_" + this.value;
    }
}

class CardDeck {
    cardDeck = [];

    constructor() {
        for (const [colorKey, color] of Object.entries(Color)) {
            for (const [valueKey, value] of Object.entries(Value)) {
                if (color === Color.Special && (value === Value.ColorChange || value === Value.PlusFour)) {
                    for (let i = 0; i < 4; i++) {
                        this.cardDeck.push(new Card(color, value));
                    }
                } else if (color !== Color.Special && (value !== Value.ColorChange && value !== Value.PlusFour)) {
                    this.cardDeck.push(new Card(color, value));
                }
            }
        }
    }
}

let onDropzone = false;
let dragMove = 0;

$(document).ready(function() {
    nextStep();
});

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

droppable.on('droppable:dropped', (event) => {
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
        window.location = '/set/' + card;
    } else {
        dragMove = 0;
    }
});

async function nextStep() {
    await Sleep(1000);
    const gameText = document.getElementById('game-text');
    const state = gameText.innerText;
    if (state !== 'Du bist am Zug' && state !== 'Wähle eine Farbe' && state !== 'Glückwunsch, du hast gewonnen!' && state !== 'Du hast leider verloren') {
        window.location = '/dostep';
    } else if (state === 'Glückwunsch, du hast gewonnen!') {
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

        Swal.fire({
            title: 'Glückwunsch, du hast gewonnen!',
            width: 600,
            padding: '3em',
            closeOnClickOutside: false,
            showConfirmButton: false,
            html: swalHtml,
        });

        const jsConfetti = new JSConfetti();
        while (true) {
            await Sleep(3000);
            jsConfetti.addConfetti();
        }
    }
}

function Sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}