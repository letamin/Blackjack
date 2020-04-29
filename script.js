//Description: A blackjack game with computer
let blackjackGame = {
    'you': {'scoreSpan': '#your-blackjack-result', 'div': '#your-box', 'score': 0},
    'dealer': {'scoreSpan': '#dealer-blackjack-result', 'div': '#dealer-box', 'score': 0},
    'cards': ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'K', 'A', 'Q'],
    'cardsMap': {'2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 10, 'Q': 10, 'K': 10, 'A': [11 , 10, 1]},
    'wins': 0,
    'losses': 0,
    'draws': 0,
    'isStand': false,
    'turnsOver': false
};

const YOU = blackjackGame['you'];
const DEALER = blackjackGame['dealer'];
var ace = false;
var scoreArray = [];
var stand = false;
var carNum = 0;

const hitSound = new Audio('sounds/swish.m4a');
const winSound = new Audio('sounds/cash.mp3');
const lostSound = new Audio('sounds/aww.mp3');

document.querySelector('#blackjack-hit-button').addEventListener('click', blackjackHit);
document.querySelector('#blackjack-stand-button').addEventListener('click', dealerLogic);
document.querySelector('#blackjack-deal-button').addEventListener('click', blackjackDeal);

function blackjackHit() {
    if(blackjackGame['isStand'] === false && carNum < 5) {
        let card = randomCard();
        showCard(card, YOU);
        updateScore(card, YOU);
        showScore(YOU);
        carNum++;
    } 
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function dealerLogic() {
    if(stand === false) {
        blackjackGame['isStand'] = true;
    
        while(DEALER['score'] < 16 && blackjackGame['isStand'] === true) {
            let card = randomCard();
            showCard(card, DEALER);
            updateScore(card, DEALER);
            showScore(DEALER);
            await sleep(1000);
        }
        
        blackjackGame['turnsOver'] = true;
        let winner = decideWinner();
        showResult(winner);
    }
    stand = true;
}

function showCard(card, activePlayer) {
    if(activePlayer['score'] <= 21) {
        let cardImage = document.createElement('img');
        cardImage.src = `images/${card}.png`;
        document.querySelector(activePlayer['div']).appendChild(cardImage);
        hitSound.play();
    } 
}

function blackjackDeal() {
    if(blackjackGame['turnsOver'] === true) {
        let yourImages = document.querySelector('#your-box').querySelectorAll('img');
        let dealerImages = document.querySelector('#dealer-box').querySelectorAll('img');

        for(let i = 0; i <yourImages.length; i++){
            yourImages[i].remove();
        }
        for(let i = 0; i < dealerImages.length; i++){
            dealerImages[i].remove();
        }

        YOU['score'] = 0;
        DEALER['score'] = 0;

        document.querySelector('#your-blackjack-result').textContent = 0;
        document.querySelector('#your-blackjack-result').style.color = 'white';

        document.querySelector('#dealer-blackjack-result').textContent = 0;
        document.querySelector('#dealer-blackjack-result').style.color = 'white';

        document.querySelector('#blackjack-result').textContent = "Let's play";
        document.querySelector('#blackjack-result').style.color = 'black';
        ace = false;
        scoreArray = [];
        blackjackGame['isStand'] = false;
        blackjackGame['turnsOver'] = false;
        stand = false;
        carNum = 0;
    }
}

function randomCard() {
    let randomIndex = Math.floor(Math.random() * 13);
    return blackjackGame['cards'][randomIndex];
}

function updateScore(card, activePlayer) {
    //All the cards will be stored in the scoreArray array. This array will be used later to determine the optimal score for player
    scoreArray.push(blackjackGame['cardsMap'][card]);
    if(card === 'A') {
        ace = true;
        if(activePlayer['score'] + blackjackGame['cardsMap'][card][0] <= 21) {
            activePlayer['score'] += blackjackGame['cardsMap'][card][0];
        } else if(activePlayer['score'] + blackjackGame['cardsMap'][card][1] <= 21) {
            activePlayer['score'] += blackjackGame['cardsMap'][card][1];
        } else {
            activePlayer['score'] += blackjackGame['cardsMap'][card][2];
        }    
    } else {
        activePlayer['score'] += blackjackGame['cardsMap'][card];
    }
    
    /*When the player goes over 21 and has the Ace card, this will decide the optimal value for Ace card.*/
    if(activePlayer['score'] > 21 && ace) {
        let score = 0;
        let max = 0;
        for(let i = 0; i < scoreArray.length; i++){
            if(!isNaN(scoreArray[i])) {
                score += scoreArray[i];
            }
        }
        if(score + 11 <= 21) {
            max = score + 11;
        } else if(score + 10 <= 21) {
            max = score + 10;
        } else {
            max = score + 1;
        }
        activePlayer['score'] = max;
    }
}

function showScore(activePlayer) {
    if(activePlayer['score'] > 21) {
        document.querySelector(activePlayer['scoreSpan']).textContent = "BUST!";
        document.querySelector(activePlayer['scoreSpan']).style.color = "red";
    } else {
        document.querySelector(activePlayer['scoreSpan']).textContent = activePlayer['score'];
    } 
}

/*Decide who win and return the winner
Also update the wins, draws and losses in the table*/
function decideWinner() {
    let winner;
    if(YOU['score'] <= 15){
        blackjackGame['losses']++;
        winner = DEALER;
    }else if(YOU['score'] <= 21) {
        if(YOU['score'] > DEALER['score'] || DEALER['score'] > 21) {
            blackjackGame['wins']++;
            winner = YOU;
        }else if(YOU['score'] < DEALER['score']) {
            blackjackGame['losses']++;
            winner = DEALER;
        }else if(YOU['score'] === DEALER['score']) {
            blackjackGame['draws']++;
        }
    }else if(YOU['score'] > 21 && DEALER['score'] <= 21) {
        blackjackGame['losses']++;
        winner = DEALER;
    }else if(YOU['score'] > 21 && DEALER['score'] > 21) {
        blackjackGame['draws']++;
    }
    
    return winner;
}

//Set the display message for Win, Draw or Loss
function showResult(winner) {
    let message, messageColor;
    
    if(blackjackGame['turnsOver'] === true) {
        if(winner === YOU) {
            document.querySelector('#wins').textContent = blackjackGame['wins'];
            message = 'You won!';
            messageColor = 'green';
            winSound.play();
        } else if( winner === DEALER) {
            document.querySelector('#losses').textContent = blackjackGame['losses'];
            message = 'You lost';
            messageColor = 'red';
            lostSound.play();
        } else {
            document.querySelector('#draws').textContent = blackjackGame['draws'];
            message = 'Draw!';
            messageColor = 'yellow';
        }
        
        document.querySelector('#blackjack-result').textContent = message;
        document.querySelector('#blackjack-result').style.color = messageColor;
    } 
}
