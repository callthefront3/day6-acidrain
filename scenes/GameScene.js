export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });

        this.nickname = '';
        this.character = 1;
        this.score = 0;
        this.health = 100;
        this.level = 1;

        this.portrait = null;
        this.textInput = null;

        this.lyricsList = [];
        this.lyricsBlindList = [];
        this.lyricsSpawned = [];

        this.spawnTimer = 0;
        this.levelTimer = 0;

        this.typingText = null;
        this.nicknameText = null;
        this.scoreText = null;
        this.healthText = null;
    }

    init(data) {
        this.nickname = data.nickname;
        this.character = data.character;
        this.score = 0;
        this.lyricsSpawned = [];

    }

    preload() {
        this.load.text('lyrics', 'assets/lyrics.txt');
        this.load.text('lyrics_blind', 'assets/lyrics_blind.txt');
    }

    create() {
          this.events.once("shutdown", () => {
            this.score = 0;
            this.health = 100;
            this.level = 1;
        });
        
        // 배경
        this.add.image(300, 400, 'background')
                .setInteractive()
                .on('pointerdown', () => {
                    this.inputUnFocused();
                });

        // 얼굴 스프라이트
        const portrait_key = 'face' + this.character;
        this.portrait = this.add.sprite(100, 80, portrait_key).setScale(0.7);
        if (!this.anims.exists('joy')) {
            this.anims.create({ key: 'joy', frames: [{ key: portrait_key, frame: 0 }], frameRate: 20 });
            this.anims.create({ key: 'normal', frames: [{ key: portrait_key, frame: 1 }], frameRate: 20 });
            this.anims.create({ key: 'sad', frames: [{ key: portrait_key, frame: 2 }], frameRate: 20 });
        }
        this.portrait.play('normal');

        // 가사 불러오기
        this.lyricsList = this.cache.text.get('lyrics').split(/\r?\n/).filter(Boolean);
        this.lyricsBlindList = this.cache.text.get('lyrics_blind').split(/\r?\n/).filter(Boolean);

        // 그룹 생성
        this.raindrops = this.physics.add.group();

        // 웹폰트와 UI
        WebFont.load({
            custom: {
                families: ['myfont']
            },
            active: () => {
                this.typingText = this.add.text(300, 700, '[         ]', { fontFamily: "myfont", fontSize: '40px', color: '#fff' }).setOrigin(0.5, 0.5);
                this.typingText.setInteractive().on('pointerdown', () => {
                    this.inputFocused();
                });

                this.nicknameText = this.add.text(250, 40, this.nickname, { fontFamily: "myfont", fontSize: '20px', fill: '#fff' });
                this.scoreText = this.add.text(250, 60, '점수: 0', { fontFamily: "myfont", fontSize: '20px', fill: '#fff' });
                this.healthText = this.add.text(250, 80, 'HP: 100', { fontFamily: "myfont", fontSize: '20px', fill: '#fff' });
            }
        });

        // 텍스트 입력 DOM
        this.textInput = document.getElementById('textInput');
        this.textInput.value = '';
        this.textInput.removeAttribute('maxlength');

        this.textInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                this.checkTypedWord();
                this.inputUnFocused();
            }
        });
    }

    update(_, delta) {
        this.spawnTimer += delta;
        this.levelTimer += delta;

        if (this.typingText) {
            this.typingText.setText(`[ ${this.textInput.value} ]`);
        } else {
            this.typingText.setText('[         ]');
        }
        
        const spawnLimit = Math.min(2 + this.level, 10);

        if (this.spawnTimer > 1000 && this.raindrops.getLength() < spawnLimit) {
            if (Phaser.Math.Between(0, 100) <= 30) {
                this.spawnRain();
            }
            this.spawnTimer = 0;
        }

        this.raindrops.getChildren().forEach(raindrop => {
            if (raindrop.y > 750) {
                this.rainOnGround(raindrop);
            }
        });

        if (this.levelTimer > 30 * 1000) {
            this.level += 1;
            this.levelTimer = 0;
        }
    }

    inputFocused() {
        document.getElementById('textInput').focus();
        this.typingText.setStyle({ fontFamily: "myfont", fontSize: '40px', color: '#000', backgroundColor: '#fff' });
    }

    inputUnFocused() {
        document.getElementById('textInput').blur();
        this.typingText.setStyle({ fontFamily: "myfont", fontSize: '40px', color: '#fff', backgroundColor: '' });
    }

    spawnRain() {
        const randIdx = Phaser.Math.Between(0, this.lyricsList.length - 1);
        
        const raw = this.lyricsList[randIdx];
        const masked = this.lyricsBlindList[randIdx];
        
        this.lyricsSpawned.push({ raw, masking: masked });
        
        WebFont.load({
            custom: {
                families: ['myfont']
            },
            active: () => {
                const raindrop = this.add.text(0, -30, masked, { fontFamily: 'myfont', fontSize: '14px', fill: '#fff' });
                raindrop.setOrigin(0.5, 0.5);

                var x = Phaser.Math.Between(raindrop.displayWidth / 2, 600 - raindrop.displayWidth / 2);
                raindrop.x = x;

                this.raindrops.add(raindrop);
                this.raindrops.setVelocityY(Math.min(5 + this.level * 8, 44));
                // this.raindrops.setVelocityY(1200);
            }
        });
    }

    rainOnGround(raindrop) {
        this.raindrops.remove(raindrop, true, true);
        this.health -= 10;
        this.portrait.play('sad');

        this.time.delayedCall(3000, () => this.portrait.play('normal'));
        this.updateScoreAndHealth();

        if (this.health <= 0) this.gameOver();
    }

    checkTypedWord() {
        const typed = this.textInput.value.trim();
        const idx = this.lyricsSpawned.findIndex(item => item.raw === typed);

        if (idx !== -1) {
            const item = this.lyricsSpawned[idx];
            const drop = this.raindrops.getChildren().find(d => d.text === item.masking);
            if (drop) {
                this.raindrops.remove(drop, true, true);
                this.lyricsSpawned.splice(idx, 1);
                this.score += 10;
                this.portrait.play('joy');
                this.time.delayedCall(3000, () => this.portrait.play('normal'));
            }
        }

        this.textInput.value = '';
        if (this.typingText) {
            this.typingText.setText('').setOrigin(0.5, 0.5);
        }
        this.updateScoreAndHealth();
    }

    updateScoreAndHealth() {
        if (this.scoreText && this.healthText) {
            this.scoreText.setText(`점수: ${this.score}`);
            this.healthText.setText(`HP: ${this.health}`);
        }
    }

    gameOver() {
        const baseUrl = `${window.location.protocol}//${window.location.host}`;
        fetch(`${baseUrl}/submit-score`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nickname: this.nickname,
                character: this.character,
                score: this.score
            })
        });

        this.scene.start("ScoreBoardScene", { 'nickname': this.nickname, 'character': this.character, 'score': this.score });
    }
}