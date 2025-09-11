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
input.style.bottom = (window.innerHeight - canvas.getBoundingClientRect().bottom + 150) + "px";

if (window.visualViewport) {
  let lastHeight = window.visualViewport.height; // 이전 높이 저장

  window.visualViewport.addEventListener("resize", () => {
    if (window.visualViewport.height < lastHeight) { // 작아짐 -> 키보드 등장
        const offsetBottom = window.innerHeight - window.visualViewport.height - window.visualViewport.offsetTop;
        input.style.bottom = (10 + offsetBottom) + "px";
    } else { // 커짐 -> 키보드 사라짐
        input.style.bottom = (window.innerHeight - canvas.getBoundingClientRect().bottom + 150) + "px";
    }

    lastHeight = window.visualViewport.height; // 최신 높이 저장
  });
}
