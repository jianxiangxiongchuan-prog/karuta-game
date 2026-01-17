const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#f5f5f5",
  scene: { preload, create }
};

new Phaser.Game(config);

// =====================
// 札1〜40の説明文（ここを書き換える）
// =====================
const cardDescriptions = {
  1: "札1の説明文",
  2: "札2の説明文",
  3: "札3の説明文",
  4: "札4の説明文",
  5: "札5の説明文",
  6: "札6の説明文",
  7: "札7の説明文",
  8: "札8の説明文",
  9: "札9の説明文",
  10: "札10の説明文",
  11: "札11の説明文",
  12: "札12の説明文",
  13: "札13の説明文",
  14: "札14の説明文",
  15: "札15の説明文",
  16: "札16の説明文",
  17: "札17の説明文",
  18: "札18の説明文",
  19: "札19の説明文",
  20: "札20の説明文",
  21: "札21の説明文",
  22: "札22の説明文",
  23: "札23の説明文",
  24: "札24の説明文",
  25: "札25の説明文",
  26: "札26の説明文",
  27: "札27の説明文",
  28: "札28の説明文",
  29: "札29の説明文",
  30: "札30の説明文",
  31: "札31の説明文",
  32: "札32の説明文",
  33: "札33の説明文",
  34: "札34の説明文",
  35: "札35の説明文",
  36: "札36の説明文",
  37: "札37の説明文",
  38: "札38の説明文",
  39: "札39の説明文",
  40: "札40の説明文"
};

function preload() {
  this.load.image("titleBg", "assets/title_bg.png");

  for (let i = 1; i <= 40; i++) {
    this.load.image(`card${i}`, `assets/cards/${i}.png`);
    this.load.audio(`voice${i}`, `assets/sounds/${i}.wav`);
  }

  this.load.audio("wrong.mp3", "assets/wrong.mp3");
  this.load.audio("correct.wav", "assets/correct.wav");
}

function create() {
  showTitle.call(this);
}

// =====================
// タイトル＋難易度選択
// =====================
function showTitle() {
  this.children.removeAll();

  this.add.image(400, 300, "titleBg").setDepth(100);

  this.add.text(400, 150, "美祢×台湾かるたゲーム", {
    fontSize: "36px",
    color: "#ffffff"
  }).setOrigin(0.5).setDepth(101);

  const levels = [
    { text: "かんたん", time: 7000 },
    { text: "ふつう", time: 4000 },
    { text: "むずかしい", time: 2500 },
    { text: "めいじん", time: 1500 }
  ];

  levels.forEach((lvl, i) => {
    const btn = this.add.text(400, 260 + i * 70, lvl.text, {
      fontSize: "22px",
      backgroundColor: "#ffffff",
      color: "#000",
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive().setDepth(101);

    btn.on("pointerdown", () => {
      this.cpuTime = lvl.time;
      this.children.removeAll();
      startGame.call(this);
    });
  });
}

// =====================
// ゲーム開始
// =====================
function startGame() {
  this.usedCount = 0;
  this.playerScore = 0;
  this.cpuScore = 0;
  this.isWaiting = false;

  this.wrongSound = this.sound.add("wrong.mp3");
  this.correctSound = this.sound.add("correct.wav");

  this.scoreText = this.add.text(20, 20,
    "あなた: 0　CPU: 0",
    { fontSize: "20px", color: "#000" }
  );

  this.cards = [];
  const cols = 8;
  const rows = 5;
  const w = 80;
  const h = 100;
  const startX = (800 - cols * w) / 2 + w / 2;
  const startY = 80;

  let id = 1;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const card = this.add.image(
        startX + x * w,
        startY + y * h,
        `card${id}`
      ).setDisplaySize(w - 6, h - 6).setInteractive();

      card.cardId = id;
      card.isTaken = false;

      card.on("pointerdown", () => {
        if (this.isWaiting || card.isTaken) return;
        if (card !== this.correctCard) {
          this.wrongSound.play();
          return;
        }
        handleCorrect.call(this, card, "player");
      });

      this.cards.push(card);
      id++;
    }
  }

  // 説明文エリア
  this.descBox = this.add.rectangle(400, 470, 700, 90, 0xffffff)
    .setDepth(1000).setVisible(false);

  this.descText = this.add.text(400, 470, "", {
    fontSize: "18px",
    color: "#000",
    wordWrap: { width: 660 }
  }).setOrigin(0.5).setDepth(1001).setVisible(false);

  this.nextBtn = this.add.text(400, 540, "次へ", {
    fontSize: "22px",
    backgroundColor: "#ffffff",
    color: "#000",
    padding: { x: 20, y: 10 }
  }).setOrigin(0.5).setDepth(1001).setInteractive().setVisible(false);

  this.nextBtn.on("pointerdown", () => nextRound.call(this));

  nextRound.call(this);
}

// =====================
// 次の札
// =====================
function nextRound() {
  if (this.usedCount >= 40) {
    showResult.call(this);
    return;
  }

  this.isWaiting = false;
  this.descBox.setVisible(false);
  this.descText.setVisible(false);
  this.nextBtn.setVisible(false);

  const remaining = this.cards.filter(c => !c.isTaken);
  this.correctCard = Phaser.Utils.Array.GetRandom(remaining);

  this.sound.play(`voice${this.correctCard.cardId}`);

  this.cpuTimer = this.time.delayedCall(this.cpuTime, () => {
    if (!this.isWaiting) {
      handleCorrect.call(this, this.correctCard, "cpu");
    }
  });
}

// =====================
// 正解処理（★ここ修正）
// =====================
function handleCorrect(card, who) {
  this.isWaiting = true;
  if (this.cpuTimer) this.cpuTimer.remove();

  card.isTaken = true;
  card.setAlpha(0.3);
  this.usedCount++;

  // ★プレイヤーのみピンポン
  if (who === "player") {
    this.correctSound.play();
  }

  if (who === "player") this.playerScore++;
  else this.cpuScore++;

  this.scoreText.setText(
    `あなた: ${this.playerScore}　CPU: ${this.cpuScore}`
  );

  const bigCard = this.add.image(400, 260, `card${card.cardId}`)
    .setDisplaySize(220, 280)
    .setDepth(1000);

  this.descBox.setVisible(true);
  this.descText.setText(cardDescriptions[card.cardId]);
  this.descText.setVisible(true);
  this.nextBtn.setVisible(true);

  this.nextBtn.once("pointerdown", () => {
    bigCard.destroy();
  });
}

// =====================
// 結果画面
// =====================
function showResult() {
  this.children.removeAll();

  let result = "引き分け！";
  if (this.playerScore > this.cpuScore) result = "あなたの勝ち！";
  if (this.playerScore < this.cpuScore) result = "CPUの勝ち！";

  this.add.rectangle(400, 300, 800, 600, 0x000000).setAlpha(0.6);

  this.add.text(400, 220,
    `結果\nあなた: ${this.playerScore}\nCPU: ${this.cpuScore}\n${result}`,
    { fontSize: "28px", color: "#ffffff", align: "center" }
  ).setOrigin(0.5);

  const retry = this.add.text(400, 380, "もう一度遊ぶ", {
    fontSize: "22px",
    backgroundColor: "#ffffff",
    color: "#000",
    padding: { x: 20, y: 10 }
  }).setOrigin(0.5).setInteractive();

  retry.on("pointerdown", () => showTitle.call(this));
}
