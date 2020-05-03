/***********************Description: A blackjack game with computer***********************************/

var toggleButton = document.getElementById('toggle-button')
var statisticTable = document.getElementById('statistic-table')

toggleButton.addEventListener('click', ()=>{
    statisticTable.classList.toggle('invi');
})

//This is the object to store all the data for the game.
var blackjackGame = {
    'you': {'scoreSpan': '#your-blackjack-result', 'div': '#your-box', 'score': 0, 'cardNum': 0, scoreArray : [], 'ace': 0, checkWin: [], 'blackjack': false},
    'dealer': {'scoreSpan': '#dealer-blackjack-result', 'div': '#dealer-box', 'score': 0, 'cardNum': 0, scoreArray : [], 'ace': 0, checkWin: [], 'blackjack': false},
    'cards': ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'K', 'A', 'Q'],
    'cardsMap': {'2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 10, 'Q': 10, 'K': 10, 'A': [11, 10, 1]},
    'wins': 0,
    'losses': 0,
    'draws': 0,
    'isHit': false,      //to check if player has clicked Hit button or not
    'isStand': false,    //to check if player has clicked Stand button or not
    'turnsOver': false   //to check if both player has finished their turn
};

//Initialize the game at first
const YOU = blackjackGame['you'];
const DEALER = blackjackGame['dealer'];

const hitSound = new Audio('sounds/swish.m4a');
const winSound = new Audio('sounds/cash.mp3');
const lostSound = new Audio('sounds/aww.mp3');

document.querySelector('#blackjack-hit-button').addEventListener('click', blackjackHit);
document.querySelector('#blackjack-stand-button').addEventListener('click', dealerLogic);
document.querySelector('#blackjack-deal-button').addEventListener('click', blackjackDeal);

/*When you click on the Hit button. You cannot click this again if:
1. You have already clicked on Stand button 
2. You have 5 cards in hand
3. You have BLACKJACK */
function blackjackHit() {
    if(blackjackGame['isStand'] === false && blackjackGame.you.cardNum < 5 && blackjackGame.you.blackjack != true) {
        let card = randomCard();
        showCard(card, YOU);
        updateScore(card, YOU);
        showScore(YOU);
        blackjackGame.you.cardNum++;
        blackjackGame['isHit'] = true;
    }
}

/*When you click on the Stand button. You can not click this when:
1. You have not played your turn (click on the Hit button)
2. You have already clicked this button once (the bot is playing its turn)*/
async function dealerLogic() {
    if(blackjackGame['isHit'] === true && blackjackGame['isStand'] === false && blackjackGame.dealer.blackjack != true) {
        blackjackGame['isStand'] = true;
        
        while(DEALER['score'] < 16 && blackjackGame['isStand'] === true && blackjackGame.dealer.cardNum < 5) {
            let card = randomCard();
            showCard(card, DEALER);
            updateScore(card, DEALER);
            showScore(DEALER);
            blackjackGame.dealer.cardNum++;
            await sleep(1000);
        }
        
        blackjackGame['turnsOver'] = true;
        let winner = decideWinner();
        showResult(winner);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//Display the card on the table and play the sound
function showCard(card, activePlayer) {
    if(activePlayer['score'] <= 21) {
        let cardImage = document.createElement('img');
        cardImage.src = `images/${card}.png`;
        document.querySelector(activePlayer['div']).appendChild(cardImage);
        hitSound.play();
    } 
}

/*The Deal button. Can only be clicked once both players have played their turns.
This will reset the game and put everything back to the begining*/
function blackjackDeal() {
    if(blackjackGame['turnsOver'] === true) {
        let yourImages = document.querySelector('#your-box').querySelectorAll('img');
        let dealerImages = document.querySelector('#dealer-box').querySelectorAll('img');

        for(let i = 0; i < yourImages.length; i++){
            yourImages[i].remove();
        }
        for(let i = 0; i < dealerImages.length; i++){
            dealerImages[i].remove();
        }
        
        reset();
    }
}

//Reset the game data back
function reset() {
    YOU['score'] = 0;
    DEALER['score'] = 0;

    document.querySelector('#your-blackjack-result').textContent = 0;
    document.querySelector('#your-blackjack-result').style.color = 'white';

    document.querySelector('#dealer-blackjack-result').textContent = 0;
    document.querySelector('#dealer-blackjack-result').style.color = 'white';

    document.querySelector('#blackjack-result').textContent = "Let's play";
    document.querySelector('#blackjack-result').style.color = 'white';
     
    blackjackGame['you']['checkWin'] = [];
    blackjackGame['dealer']['checkWin'] = [];
    blackjackGame['you']['blackjack'] = false;
    blackjackGame['dealer']['blackjack'] = false;
    blackjackGame['you']['ace'] = 0;
    blackjackGame['dealer']['ace'] = 0;
    blackjackGame['you']['cardNum'] = 0;
    blackjackGame['dealer']['cardNum'] = 0; 
    blackjackGame['isHit'] = false;
    blackjackGame['isStand'] = false;
    blackjackGame['turnsOver'] = false;
    blackjackGame['you']['scoreArray'] = [];
    blackjackGame['dealer']['scoreArray'] = [];
}

//Random function to randomly choose the cards.
function randomCard() {
    let randomIndex = Math.floor(Math.random() * 13);
    return blackjackGame['cards'][randomIndex];
}

function updateScore(card, activePlayer) {
    /*All the cards value (scores) will be stored in the scoreArray array. This array will be used later to determine the optimal score for player*/
    /*The checkWin array stores the card itself (not the value of it). For example: "K" is still stored as "K". And this array is used to determin if the player has BLACKJACK or not */
    activePlayer.scoreArray.push(blackjackGame['cardsMap'][card]);
    activePlayer.checkWin.push(card);
    let checkWithouAce = false;  // The cards 10, J, Q, K (the first card picked) => this boolean will be true. This boolean + "A" card => BLACKJACK
    let checkAce = false;        // to check if the first card picked is "A" or not
    let checkWithAce = false;    // The cards 10, J, Q, K (the second card picked) => this boolean will be true. This boolean + checkAce => BLACKJACK
    
    if(activePlayer.checkWin[0] === '10' || activePlayer.checkWin[0] === 'J'  || 
       activePlayer.checkWin[0] === 'Q'  || activePlayer.checkWin[0] === 'K') {
        checkWithouAce = true;
    }else if(activePlayer.checkWin[0] === 'A') {
        checkAce = true;
        if(activePlayer.checkWin[1] === '10' || activePlayer.checkWin[1] === 'J'  || 
           activePlayer.checkWin[1] === 'Q'  || activePlayer.checkWin[1] === 'K') {
            checkWithAce = true;
        }
    }
    
    if(checkWithouAce && activePlayer.checkWin[1] === 'A' || checkAce && checkWithAce || activePlayer.checkWin[0] === 'A' && activePlayer.checkWin[1] === 'A') {
        activePlayer.blackjack = true;
        activePlayer.score = "BLACKJACK!";
        document.querySelector(activePlayer['scoreSpan']).style.color = "green";
    }else {
        if(card === 'A') {
            activePlayer.ace++;
            if(activePlayer['score'] + blackjackGame['cardsMap'][card][0] <= 21) {
                activePlayer['score'] += blackjackGame['cardsMap'][card][0];
            }else if(activePlayer['score'] + blackjackGame['cardsMap'][card][1] <= 21) {
                activePlayer['score'] += blackjackGame['cardsMap'][card][1];
            }else {
                activePlayer['score'] += blackjackGame['cardsMap'][card][2];
            }    
        }else {
            activePlayer['score'] += blackjackGame['cardsMap'][card];
        }
    
        /*When the player goes over 21 and has the Ace card, this will decide the optimal value for Ace card (if it is best to be 1, 10 or 11)*/
        if(activePlayer['score'] > 21 && activePlayer.ace != 0) {
            let score = 0;
            let max = 0;
            for(let i in activePlayer.scoreArray){
                if(!isNaN(activePlayer.scoreArray[i])) {
                    score += activePlayer.scoreArray[i];
                }
            }

            if(score + 11 <= 21) {
            max = score + 11;
            }else if(score + 10 <= 21) {
                max = score + 10;
            }else {
                max = score + 1;
            }
            activePlayer['score'] = max;
        } 
    }
}

//Display the score for players
function showScore(activePlayer) {
    if(activePlayer['score'] <= 21 && activePlayer['cardNum'] == 4 ){
        activePlayer.blackjack = true;
        document.querySelector(activePlayer['scoreSpan']).textContent = "BLACKJACK!";
        document.querySelector(activePlayer['scoreSpan']).style.color = "green";
    }else {
        if(activePlayer['score'] > 21) {
            document.querySelector(activePlayer['scoreSpan']).textContent = "BUST!";
            document.querySelector(activePlayer['scoreSpan']).style.color = "red";
        }else {
            document.querySelector(activePlayer['scoreSpan']).textContent = activePlayer['score'];
        }
    }  
}

/*Decide who win and return the winner
Also update the wins, draws and losses count in the table*/
function decideWinner() {
    let winner;
    if(blackjackGame['you']['blackjack'] === true && blackjackGame['dealer']['blackjack'] === false){
        blackjackGame['wins']++;
        winner = YOU;
    }else if(blackjackGame['you']['blackjack'] === false && blackjackGame['dealer']['blackjack'] === true) {
        blackjackGame['losses']++;
        winner = DEALER;
    }else if(blackjackGame['you']['blackjack'] === true && blackjackGame['dealer']['blackjack'] === true){
        blackjackGame['draws']++;   
    }else {
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
    }
   
    return winner;
}

//Set the display message/color for Win, Draw or Loss
function showResult(winner) {
    let message, messageColor;
    
    if(blackjackGame['turnsOver'] === true) {
        if(winner === YOU) {
            document.querySelector('#wins').textContent = blackjackGame['wins'];
            message = 'You won!';
            messageColor = 'green';
            winSound.play();
        }else if( winner === DEALER) {
            document.querySelector('#losses').textContent = blackjackGame['losses'];
            message = 'You lost';
            messageColor = 'red';
            lostSound.play();
        }else {
            document.querySelector('#draws').textContent = blackjackGame['draws'];
            message = 'Draw!';
            messageColor = 'yellow';
        }
        
        document.querySelector('#blackjack-result').textContent = message;
        document.querySelector('#blackjack-result').style.color = messageColor;
    } 
}
