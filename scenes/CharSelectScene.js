export class CharSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CharSelectScene' });

        this.nickname = '';
        this.character = 1;
        
        this.portraits = null;
        this.textInput = null;

        this.startGameListener = null;
    }

    preload() {
        this.load.script('webfont', 'js/webfont.js');

        this.load.image('background', 'assets/background.png');
        this.load.image('window_big', 'assets/window_big.png');
        this.load.image('button', 'assets/button.png');

        this.load.spritesheet('face1', 'assets/face1.png', { frameWidth: 200, frameHeight: 200 });
        this.load.spritesheet('face2', 'assets/face2.png', { frameWidth: 200, frameHeight: 200 });
        this.load.spritesheet('face3', 'assets/face3.png', { frameWidth: 200, frameHeight: 200 });
        this.load.spritesheet('face4', 'assets/face4.png', { frameWidth: 200, frameHeight: 200 });
    }

    create() {
        // 배경
        this.add.image(300, 400, 'background')
            .setInteractive();

        this.add.image(300, 400, 'window_big')
            .setInteractive();

        // 캐릭터 선택
        this.portraits = this.add.group({ classType: Phaser.GameObjects.Sprite });

        const centerX = 300;
        const centerY = 300;
        const offsetX = 100;
        const offsetY = 100;

        const positions = [
            [centerX - offsetX, centerY - offsetY],
            [centerX + offsetX, centerY - offsetY],
            [centerX - offsetX, centerY + offsetY],
            [centerX + offsetX, centerY + offsetY]
        ];

        ['face1', 'face2', 'face3', 'face4'].forEach((face, i) => {
            const [x, y] = positions[i];
            const sprite = this.add.sprite(x, y, face)
                .setInteractive()
                .on('pointerdown', () => {
                    this.character = i + 1;
                    this.portraitSelected();
                });
            this.portraits.add(sprite);
        });

        this.portraitSelected();

        // 닉네임 입력
        this.textInput = document.getElementById('textInput');
        this.textInput.setAttribute('maxlength', '8');

        this.startGameListener = (event) => {
            if (event.key === 'Enter' && this.textInput.value !== '') {
                this.textInput.removeEventListener('keydown', this.startGameListener);
                this.scene.start('GameScene', { nickname: this.textInput.value, character: this.character });
            }
        };
        this.textInput.addEventListener('keydown', this.startGameListener);

        // 게임 시작하기 버튼
        const button = this.add.image(300, 630, 'button')
            .setInteractive()
            .on('pointerover', () => {
                button.setScale(1.1);
                button.setTint(0xdddddd);
            })
            .on('pointerout', () => {
                button.setScale(1);
                button.clearTint();
            })
            .on('pointerdown', () => {
                if (this.textInput.value !== '') {
                    this.textInput.removeEventListener('keydown', this.startGameListener);
                    this.scene.start('GameScene', { nickname: this.textInput.value, character: this.character });
                }
            });
    }

    update() {

    }

    portraitSelected() {
        this.portraits.getChildren().forEach(p => p.setAlpha(0.5));
        this.portraits.getChildren()[this.character - 1].setAlpha(1.0);
    }

    inputFocused() {
        document.getElementById('textInput').focus();
    }

    inputUnFocused() {
        document.getElementById('textInput').blur();
    }
}
