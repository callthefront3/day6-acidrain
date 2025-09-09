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
        this.add.image(300, 400, 'background');
        this.add.image(300, 400, 'window_big');

        // 캐릭터 선택
        this.portraits = this.add.group({ classType: Phaser.GameObjects.Sprite });

        this.portraits.add(
            this.add.sprite(200, 200, 'face1')
                .setScale(0.9)
                .setInteractive()
                .on('pointerdown', () => {
                    this.character = 1;
                    this.portraitSelected();
                })
        );

        this.portraits.add(
            this.add.sprite(400, 200, 'face2')
                .setScale(0.9)
                .setInteractive()
                .on('pointerdown', () => {
                    this.character = 2;
                    this.portraitSelected();
                })
        );

        this.portraits.add(
            this.add.sprite(200, 400, 'face3')
                .setScale(0.9)
                .setInteractive()
                .on('pointerdown', () => {
                    this.character = 3;
                    this.portraitSelected();
                })
        );

        this.portraits.add(
            this.add.sprite(400, 400, 'face4')
                .setScale(0.9)
                .setInteractive()
                .on('pointerdown', () => {
                    this.character = 4;
                    this.portraitSelected();
                })
        );

        this.portraitSelected();

        // 닉네임 입력
        WebFont.load({
            custom: {
                families: ['myfont']
            },
            active: () => {
                this.nicknameText = this.add.text(160, 520, '닉네임: ', { fontFamily: "myfont", fontSize: '20px', fill: '#fff' });
            }
        });

        this.textInput = document.getElementById('textInput');
        this.textInput.setAttribute('maxlength', '8');

        this.startGameListener = (event) => {
            if(event.key === 'Enter' && this.textInput.value !== '') {
                this.textInput.removeEventListener('keydown', this.startGameListener);
                this.scene.start('GameScene', { nickname: this.textInput.value, character: this.character });
            }
        };
        this.textInput.addEventListener('keydown', this.startGameListener);

        this.textInput.focus();
        document.querySelector('canvas').addEventListener('click', () => {
            this.textInput.focus();
        });

        // 게임 시작하기
        const button = this.add.image(300, 630, 'button')
            .setInteractive()
            .on('pointerover', () => {
                button.setScale(1.1);       // 10% 확대
                button.setTint(0xdddddd);   // 살짝 밝게
            })
            .on('pointerout', () => {
                button.setScale(1);         // 원래 크기로
                button.clearTint();         // 원래 색으로
            })
            .on('pointerdown', () => {
                if(this.textInput.value !== '') {
                    this.textInput.removeEventListener('keydown', this.startGameListener);
                    this.scene.start('GameScene', { 'nickname': this.textInput.value, 'character': this.character });
                }
            });

        
    }

    update(time, delta) {
        if (this.nicknameText) {
            if(this.textInput.value !== '') {
                this.nicknameText.setText('닉네임: ' + this.textInput.value);
            } else {
                this.nicknameText.setText('닉네임: 닉네임을 입력하세요' + this.textInput.value);
            }
        }
    }

    portraitSelected() {
        const alpha_05 = 0.5;

        this.portraits.getChildren().forEach(p => p.setAlpha(alpha_05));
        this.portraits.getChildren()[this.character - 1].setAlpha(1.0);
    }
}