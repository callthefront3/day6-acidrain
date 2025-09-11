import { CharSelectScene } from "/scenes/CharSelectScene.js";
import { GameScene } from "/scenes/GameScene.js";
import { ScoreBoardScene } from "/scenes/ScoreBoardScene.js";

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'game-container',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 600,
        height: 800
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [ CharSelectScene, GameScene, ScoreBoardScene ]
};

new Phaser.Game(config);

const input = document.getElementById('textInput'); 
const canvas = document.querySelector('canvas');

function updateInputPosition() {
  const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  const keyboardThreshold = window.innerHeight * 0.7; // 화면의 70% 이하로 줄어들면 키보드 등장으로 간주

  if (viewportHeight < keyboardThreshold) { // 키보드 등장
      const offsetBottom = window.innerHeight - viewportHeight - (window.visualViewport?.offsetTop || 0);
      input.style.bottom = (10 + offsetBottom) + "px";
  } else { // 키보드 사라짐
      if(input.getAttribute('maxlength')) {
        input.style.bottom = (window.innerHeight - canvas.getBoundingClientRect().bottom + 150) + "px";
      } else {
        input.style.bottom = (window.innerHeight - canvas.getBoundingClientRect().bottom + 50) + "px";
      }
  }
}

// 초기 위치 설정
updateInputPosition();

// viewport가 변할 때마다 갱신
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", updateInputPosition);
} else {
  // visualViewport가 없으면 window resize로 대체
  window.addEventListener("resize", updateInputPosition);
}
