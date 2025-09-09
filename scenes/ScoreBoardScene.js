export class ScoreBoardScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ScoreBoardScene' });

        this.nickname = '';
        this.character = 1;
        this.score = 0;
    }

    init(data) {
        this.nickname = data.nickname;
        this.character = data.character;
        this.score = data.score;
    }

    preload() {
        
    }

    create() {
        // 배경
        this.add.image(300, 400, 'background');
        this.add.image(300, 400, 'window_big');

        // 다시하기 버튼
        const button = this.add.image(300, 620, 'button')
            .setInteractive()
            .on('pointerover', () => { button.setScale(1.1); button.setTint(0xdddddd); })
            .on('pointerout', () => { button.setScale(1); button.clearTint(); })
            .on('pointerdown', () => { 
                this.scene.start('GameScene', { nickname: this.nickname, character: this.character }); 
            });

        // WebFont + fetch 후 렌더링
        WebFont.load({
            custom: { families: ['myfont'] },
            active: async () => {
                let top10 = [];
                try {
                    const res = await fetch("http://localhost:3000/daily-rank-korea");
                    top10 = await res.json();
                } catch (err) {
                    console.error("Failed to fetch Top10:", err);
                }

                // Top8 출력
                top10.slice(0, 8).forEach((row, i) => {
                    this.add.sprite(160, 150 + i * 50, 'face' + row.character).setScale(0.2);
                    this.add.text(200, 150 + i * 50, row.nickname, { fontFamily: "myfont", fontSize: '20px', fill: '#fff' }).setOrigin(0, 0.5);
                    this.add.text(450, 150 + i * 50, row.score, { fontFamily: "myfont", fontSize: '20px', fill: '#fff' }).setOrigin(1, 0.5);
                });

                // 내 점수
                this.add.sprite(160, 550, 'face' + this.character).setScale(0.2);
                this.add.text(200, 550, this.nickname, { fontFamily: "myfont", fontSize: '20px', fill: '#fff' }).setOrigin(0, 0.5);
                this.add.text(450, 550, this.score, { fontFamily: "myfont", fontSize: '20px', fill: '#fff' }).setOrigin(1, 0.5);
            }
        });
    }

    update(time, delta) {
        
    }
}
