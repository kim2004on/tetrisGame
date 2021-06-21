`use strict`;

import BLOCKS from './block.js'

const tetrisGameBtn = document.querySelector(".tetris-game__btn")
const gameTimer = document.querySelector(".tetris-game__timer")
const tetrisGameField =  document.querySelector(".tetris-game__field__lists");
const gamePopUp = document.querySelector(".tetris-game__popUp");
const gamePopUpMessage = document.querySelector(".tetris-game__popUp__text");
const gameScore = document.querySelector(".tetris-game__score");
const restartBtn = document.querySelector(".tetris-game__text-restart");

const GAME_ROWS = 20;
const GAME_COLS = 10;
let DURATION = 500;

let score = 0;
let started = false;

let downInterval = undefined;
let timier = undefined;

let tempMovingItem;

const movingItem = {
    type : "",
    direction : 0,
    top: 0,
    left: 0,
};

tetrisGameBtn.addEventListener('click',() => {
    if(started) {
        stopGame('REPLAY❓');
    } else {
        startGame();
    }
});

restartBtn.addEventListener('click', () => {
    gamePopUp.style.display = 'none'; 
    tetrisGameField.innerHTML = "";
    startGame();
})

//게임 시작
function startGame() {
    for(let i=0 ; i < GAME_ROWS ; i++) {
        prependNewLine();
    }
    DURATION = 500;
    gameTimer.innerText = `0:0`;
    started = true;
     tempMovingItem = { ...movingItem}
     generateNewBlock();
     showButton();
     showStopButton('fa-stop', `fa-play` );
     startTimer();
    
}

//게임 중지 or 패배
function stopGame(popUpMessage) {
    showStopButton(`fa-play`, 'fa-stop' );
    started = false;
    hideButton();
    clearInterval(downInterval);
    gamePopUpShow(popUpMessage);
    clearInterval(timier);
    document.removeEventListener('keydown', keyDownEvents);
    
}

//팝업 
function gamePopUpShow(message) {
    gamePopUp.style.display = 'flex'; 
    gamePopUpMessage.innerText = message;
}

//버튼 관련
function showButton() {
    gameTimer.style.visibility = 'visible';
    gameScore.style.visibility = 'visible';
    tetrisGameBtn.style.visibility = 'visible';
}
function hideButton() {
    tetrisGameBtn.style.visibility = 'hidden';
}
function showStopButton(add, remove) {
    const icon = document.querySelector(".fas");
    icon.classList.add(add);
    icon.classList.remove(remove);
}

//테트리스 판 생성
function prependNewLine() {
    const li =  document.createElement("li");
    const ul = document.createElement("ul");
    for(let j =0 ; j < GAME_COLS ; j ++) {
        const matrix = document.createElement("li");
        ul.prepend(matrix);
    }
    li.prepend(ul);
    tetrisGameField.prepend(li);
}

//블럭 생산
function renderBlocks(moveType="") {
const {type, direction, top, left} = tempMovingItem; //하나씩 변수로 사용할 수 있도록 디스트럭션 처리
const movingBlocks = document.querySelectorAll(".moving");
movingBlocks.forEach(moving => {
    moving.classList.remove(type, 'moving');
})
BLOCKS[type][direction].some(block => {
    if(time === 20) {
        DURATION = 400;
    }
    if(time === 40) {
        DURATION = 300;
    }
    if(time === 60) {
        DURATION = 200;
    }
    const x = block[0] + left ;
    const y = block[1] + top;
    const target = tetrisGameField.childNodes[y] ? tetrisGameField.childNodes[y].childNodes[0].childNodes[x]: null;
    const isAvailable = chexkEmpty(target);
    if(isAvailable){
        target.classList.add(type, 'moving');
    }
    else{
        tempMovingItem = {...movingItem};
       
        if(moveType === 'retry'){
            stopGame('Game Lose💢');
            return;
        }
        setTimeout(() => {
        
            renderBlocks('retry');    // 재귀함수 : 조심 콜스택 멕시멈 에러 방지 이벤트 루프안에 넣지말고 외부로 빼서 태스트큐에 넣었다가 다음턴에 할 수 있도록
            if( moveType=== 'top'){
                seizeBlock();
            
            }
        }, 0);                  //셋타임 아웃 활용  다음턴 실행  뺑뺑이 방지
       return true;
    }
})
    movingItem.left = left;
    movingItem.top = top;
    movingItem.direction = direction;
}

//블럭 고정
function seizeBlock(){
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving => {
        moving.classList.remove('moving');
        moving.classList.add('seized');
    })
    checkMatch();
    
}

//체크 후 점수 플러스 블럭제거 및 생산
function checkMatch() {
    document.removeEventListener('keydown', keyDownEvents);
    const childNodes = tetrisGameField.childNodes;
    childNodes.forEach(child => {
        let matched = true;
        child.children[0].childNodes.forEach(li => {
            if(!li.classList.contains('seized')){
                matched = false;
            }
        })
        if(matched) {
            child.remove();
            prependNewLine();
            score++;
            gameScore.innerText = score;
        }
    })
    generateNewBlock();
}

let time = 0;
//타이머부분
function startTimer() {
    time = 0;
    timier = setInterval(() => {
        time ++;
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        gameTimer.innerText = `${minutes}:${seconds}`;
    }, 1000);
}


//기존 블럭 저장 > 새 블럭 생성
function generateNewBlock() {
   
    clearInterval(downInterval);
    downInterval = setInterval(() => {
            moveBlock('top', 1)
    }, DURATION);
    document.addEventListener('keydown', keyDownEvents);
    const blockArray = Object.entries(BLOCKS); // 객체를 반복문을 돌리려고 감싸고 length 해서 결과 얻음
    const randomIndex = Math.floor(Math.random() * blockArray.length);
    movingItem.type = blockArray[randomIndex][0]
    movingItem.top = 0;
    movingItem.left = 3;
    movingItem.direction = 0;
    tempMovingItem = {...movingItem}
    renderBlocks();
}


//이동 유무 체크
function chexkEmpty(target){
    if(!target || target.classList.contains('seized')){
        return false;
    }
    return true;
}

//블럭 이동
function moveBlock(moveType, amount) {
    tempMovingItem[moveType] += amount;
    renderBlocks(moveType);

    
}


//블럭 방향 전환
function chageDirection() {
    const direction = tempMovingItem.direction;
    direction === 3 ? tempMovingItem.direction = 0 : tempMovingItem.direction += 1;
    renderBlocks();
}

//스페이스 블록 쭉 내려옴
function dropBlock() {
    document.removeEventListener('keydown', keyDownEvents);
    clearInterval(downInterval);
    downInterval = setInterval(() => {
                moveBlock('top', 1)
    }, 10);
}

//화살표 이벤트\
    function keyDownEvents(e) {
        switch(e.keyCode){
            case 39:
                moveBlock('left', 1);
                break;
            case 37:
                moveBlock('left', -1);
                break;
            case 38:
                chageDirection();
                break;
            case 32:
                dropBlock();
                break;       
            default:
                break;
        }
    }

