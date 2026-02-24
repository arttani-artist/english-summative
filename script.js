// stats

let currentPlayer = null;
let currentScene = "start";

let ammaStats = { ambition: 0, fear: 0, culture: 0, assimilation: 0, risk: 0 };
let appaStats = { ambition: 0, fear: 0, culture: 0, assimilation: 0, risk: 0 };

// music

let currentMusic = null;

function fadeOut(audio, duration = 800) {
  if (!audio) return;

  let step = audio.volume / (duration / 50);
  let fade = setInterval(() => {
    if (audio.volume - step > 0) {
      audio.volume -= step;
    } else {
      audio.volume = 0;
      audio.pause();
      clearInterval(fade);
    }
  }, 50);
}

function playMusic(src) {
  if (currentMusic && currentMusic.src.includes(src)) return;

  fadeOut(currentMusic);

  let newMusic = new Audio(src);
  newMusic.loop = true;
  newMusic.volume = 0;
  newMusic.play();

  let fade = setInterval(() => {
    if (newMusic.volume < 0.3) {
      newMusic.volume += 0.02;
    } else {
      clearInterval(fade);
    }
  }, 50);

  currentMusic = newMusic;
}

// identity meter

function updateIdentityBar() {
  if (!currentPlayer) return;

  let stats = currentPlayer === "amma" ? ammaStats : appaStats;
  let diff = stats.culture - stats.assimilation;

  let width = 50 + diff * 5;
  width = Math.max(15, Math.min(85, width));

  let bar = document.getElementById("identity-fill");
  bar.style.width = width + "%";

  if (diff > 1) bar.style.background = "maroon";
  else if (diff < -1) bar.style.background = "navy";
  else bar.style.background = "purple";
}

// typewriter

let typeSound = new Audio("sounds/typeclick.mp3");
typeSound.volume = 0.1;

function typeWriter(text) {
  let element = document.getElementById("text-box");
  element.innerText = "";

  if (window.typeInterval) clearInterval(window.typeInterval);

  let i = 0;

  window.typeInterval = setInterval(() => {
    if (i < text.length) {
      element.innerText += text[i];

      if (text[i] !== " " && text[i] !== "\n") {
        typeSound.currentTime = 0;
        typeSound.play();
      }

      i++;
    } else {
      clearInterval(window.typeInterval);
    }
  }, 25);
}

// save system

function saveGame() {
  let saveData = {
    currentScene,
    currentPlayer,
    ammaStats,
    appaStats
  };

  localStorage.setItem("netra_game_save", JSON.stringify(saveData));
}

function loadGame() {
  let saveData = localStorage.getItem("netra_game_save");

  if (saveData) {
    saveData = JSON.parse(saveData);

    currentScene = saveData.currentScene;
    currentPlayer = saveData.currentPlayer;
    ammaStats = saveData.ammaStats;
    appaStats = saveData.appaStats;
  }
}

// meeting text

function generateMeetingText() {
  let combined = {
    ambition: ammaStats.ambition + appaStats.ambition,
    culture: ammaStats.culture + appaStats.culture,
    assimilation: ammaStats.assimilation + appaStats.assimilation,
    fear: ammaStats.fear + appaStats.fear,
    risk: ammaStats.risk + appaStats.risk
  };

  let text = "all the choices led here.";

  if (combined.ambition > combined.fear) {
    text += "\n\nyou were builders.";
  }

  if (combined.culture > combined.assimilation) {
    text += "\n\nyou carried home with you.";
  }

  if (combined.risk > 3) {
    text += "\n\nit began with a leap.";
  }

  text += "\n\nand somehow, your paths crossed.";

  return text;
}

// scenes

const scenes = {

  start: {
    text: "two journeys. one future.",
    music: "sounds/opening.mp3",
    background: "images/airport.png",
    choices: [
      { text: "play as saradha", next: "amma_intro", setPlayer: "amma" },
      { text: "play as satish", next: "appa_intro", setPlayer: "appa" }
    ]
  },

  amma_intro: {
    text: "tamil nadu, late 1990s.",
    timeline: "chennai",
    background: "images/IIT.png",
    leftImage: "images/amma_neutral.png",
    statChanges: { culture: 1 },
    music: "sounds/india.mp3",
    choices: [{ text: "continue", next: "amma_arrival" }]
  },

  amma_arrival: {
    text: "america felt loud.",
    timeline: "united states",
    background: "images/maryland.png",
    leftImage: "images/amma_speaking.png",
    statChanges: { assimilation: 1 },
    music: "sounds/arrival.mp3",
    choices: [{ text: "continue", next: "meeting_scene" }]
  },

  appa_intro: {
    text: "a degree finished.",
    timeline: "chennai",
    background: "images/chennai.png",
    rightImage: "images/appa_neutral.png",
    statChanges: { ambition: 1 },
    music: "sounds/india.mp3",
    choices: [{ text: "continue", next: "appa_arrival" }]
  },

  appa_arrival: {
    text: "uncertainty and opportunity.",
    timeline: "united states",
    background: "images/syracuse.png",
    rightImage: "images/appa_speaking.png",
    statChanges: { assimilation: 1 },
    music: "sounds/arrival.mp3",
    choices: [{ text: "continue", next: "meeting_scene" }]
  },

  meeting_scene: {
    dynamic: true,
    timeline: "the meeting",
    background: "images/maryland.png",
    leftImage: "images/amma_happy.png",
    rightImage: "images/appa_happy.png",
    music: "sounds/meeting.mp3",
    choices: [{ text: "restart", next: "start" }]
  }
};

// scene loader

function loadScene(sceneName) {

  const game = document.getElementById("game");
  game.classList.add("fade-out");

  setTimeout(() => {

    let scene = scenes[sceneName];
    currentScene = sceneName;

    if (scene.music) playMusic(scene.music);

    document.getElementById("timeline").innerText = scene.timeline || "";

    if (scene.background) {
      document.getElementById("scene-background").style.backgroundImage =
        `url(${scene.background})`;
    }

    document.getElementById("left-image").src = scene.leftImage || "";
    document.getElementById("right-image").src = scene.rightImage || "";

    let text = scene.dynamic ? generateMeetingText() : scene.text;

    typeWriter(text);

    if (scene.statChanges) {
      let stats = currentPlayer === "amma" ? ammaStats : appaStats;
      for (let key in scene.statChanges) {
        stats[key] += scene.statChanges[key];
      }
      updateIdentityBar();
    }

    let choicesDiv = document.getElementById("choices");
    choicesDiv.innerHTML = "";

    scene.choices.forEach(choice => {
      let button = document.createElement("button");
      button.innerText = choice.text;

      button.onclick = () => {
        document.getElementById("click-sound").play();

        if (choice.setPlayer) currentPlayer = choice.setPlayer;

        loadScene(choice.next);
        saveGame();
      };

      choicesDiv.appendChild(button);
    });

    game.classList.remove("fade-out");

  }, 800);
}

// start

loadGame();
loadScene(currentScene);
