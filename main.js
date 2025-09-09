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