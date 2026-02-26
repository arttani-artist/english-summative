let currentPlayer = null;
let currentScene = "start";

let ammaStats = { ambition: 0, culture: 0, assimilation: 0 };
let appaStats = { ambition: 0, culture: 0, assimilation: 0 };

let currentMusic = null;

function playMusic(src) {
  if (currentMusic && currentMusic.src.includes(src)) return;

  if (currentMusic) {
    currentMusic.volume = 0;
    currentMusic.pause();
  }

  let music = new Audio(src);
  music.loop = true;
  music.volume = 0.4;
  music.play();
  currentMusic = music;
}

function updateStatsUI() {
  document.getElementById("amma-ambition").innerText = ammaStats.ambition;
  document.getElementById("amma-culture").innerText = ammaStats.culture;
  document.getElementById("amma-assimilation").innerText = ammaStats.assimilation;

  document.getElementById("appa-ambition").innerText = appaStats.ambition;
  document.getElementById("appa-culture").innerText = appaStats.culture;
  document.getElementById("appa-assimilation").innerText = appaStats.assimilation;
}

let typeSound = new Audio("sounds/typeclick.mp3");
typeSound.volume = 0.1;

function typeWriter(text) {
  const box = document.getElementById("text-box");
  box.innerText = "";
  let i = 0;

  let interval = setInterval(() => {
    if (i < text.length) {
      box.innerText += text[i];
      typeSound.currentTime = 0;
      typeSound.play();
      i++;
    } else {
      clearInterval(interval);
    }
  }, 25);
}

function loadScene(name) {
  let scene = scenes[name];
  currentScene = name;

  if (scene.music) playMusic(scene.music);
  if (scene.background)
    document.getElementById("scene-background").style.backgroundImage =
      `url(${scene.background})`;

  document.getElementById("timeline").innerText = scene.timeline || "";

  const left = document.getElementById("left-image");
  const right = document.getElementById("right-image");

  if (scene.leftImage) {
    left.src = scene.leftImage;
    left.style.display = "block";
  } else left.style.display = "none";

  if (scene.rightImage) {
    right.src = scene.rightImage;
    right.style.display = "block";
  } else right.style.display = "none";

  let text = scene.dynamic ? generateEnding() : scene.text;
  typeWriter(text);

  if (scene.statChanges && currentPlayer) {
    let stats = currentPlayer === "amma" ? ammaStats : appaStats;
    for (let key in scene.statChanges) {
      stats[key] += scene.statChanges[key];
    }
  }

  updateStatsUI();

  let choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = "";

  scene.choices.forEach(choice => {
    let btn = document.createElement("button");
    btn.innerText = choice.text;

    btn.onclick = () => {
      document.getElementById("click-sound").play();
      if (choice.setPlayer) currentPlayer = choice.setPlayer;
      loadScene(choice.next);
    };

    choicesDiv.appendChild(btn);
  });
}

function generateEnding() {
  let totalAmbition = ammaStats.ambition + appaStats.ambition;
  let totalCulture = ammaStats.culture + appaStats.culture;
  let totalAssim = ammaStats.assimilation + appaStats.assimilation;

  let text = "all roads led here.\n\n";

  if (totalAmbition > totalCulture && totalAmbition > totalAssim)
    text += "you built your future through drive.\n\n";
  else if (totalCulture > totalAssim)
    text += "you carried your roots forward.\n\n";
  else
    text += "you adapted and reshaped yourselves.\n\n";

  text += "and somehow, you met.";

  return text;
}

/* Keep your scenes object exactly as you already wrote it */

loadScene(currentScene);
