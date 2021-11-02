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

$(document).ready(function() {
    // let cardDeck = new CardDeck();
    // for (let i = 0; i < cardDeck.cardDeck.length; i++) {
    //     console.log(cardDeck.cardDeck[i].toString());
    // }
});

const droppable = new Draggable.Droppable(document.querySelectorAll('.container-dropzone'), {
    draggable: '.item-draggable',
    dropzone: '.dropzone'
});

droppable.on('droppable:dropped', (event) => {
    const card = document.getElementById('open-card-stack');
    card.classList.add('card-deck-dropzone');
});

droppable.on('droppable:stop', (event) => {
    const card = event.dragEvent.originalSource.id;
    window.location = '/set/' + card;
});