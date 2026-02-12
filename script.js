//stats

let currentPlayer = null;

let ammaStats = { ambition: 0, fear: 0, culture: 0, assimilation: 0, risk: 0 };
let appaStats = { ambition: 0, fear: 0, culture: 0, assimilation: 0, risk: 0 };

//music

let currentMusic = null;

function playMusic(src) {
  if (currentMusic) currentMusic.pause();

  currentMusic = new Audio(src);
  currentMusic.loop = true;
  currentMusic.volume = 0.3;
  currentMusic.play();
}

//identity bar thingy

function updateIdentityBar() {
  let stats = currentPlayer === "amma" ? ammaStats : appaStats;

  let cultureVsAssim = stats.culture - stats.assimilation;

  let width = 50 + cultureVsAssim * 5;
  width = Math.max(10, Math.min(90, width));

  let bar = document.getElementById("identity-bar");
  bar.style.width = width + "%";

  if (cultureVsAssim > 0) {
    bar.style.background = "maroon";
  } else if (cultureVsAssim < 0) {
    bar.style.background = "navy";
  } else {
    bar.style.background = "purple";
  }
}

//scene thingy

let currentScene = "start";

const scenes = {

  start: {
    text: "choose your character!",
    timeline: "",
    leftImage: "",
    rightImage: "",
    music: "sounds/opening.mp3",
    choices: [
      { text: "play as saradha", next: "amma_intro", setPlayer: "amma" },
      { text: "play as satish", next: "appa_intro", setPlayer: "appa" }
    ]
  },

  amma_intro: {
    text: "text",
    timeline: "Chennai, year",
    leftImage: "images/amma.png",
    music: "sounds/india_theme.mp3",
    statChanges: { culture: 1, fear: 1 },
    choices: [
      { text: "continue", next: "amma_arrival" }
    ]
  },

  appa_intro: {
    text: "text",
    timeline: "Chennai, year",
    leftImage: "images/appa.png",
    music: "sounds/india_theme.mp3",
    statChanges: { ambition: 1, risk: 1 },
    choices: [
      { text: "uh", next: "appa_arrival" }
    ]
  }

};

//scene loading thingy

function loadScene(sceneName) {
  const game = document.getElementById("game");
  game.classList.add("fade-out");

  setTimeout(() => {

    let scene = scenes[sceneName];
    currentScene = sceneName;

    document.getElementById("story-text").innerText = scene.text;
    document.getElementById("timeline").innerText = scene.timeline || "";

    document.getElementById("left-image").src = scene.leftImage || "";
    document.getElementById("right-image").src = scene.rightImage || "";

    if (scene.music) playMusic(scene.music);

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
        if (choice.setPlayer) currentPlayer = choice.setPlayer;
        loadScene(choice.next);
      };

      choicesDiv.appendChild(button);
    });

    game.classList.remove("fade-out");

  }, 800);
}

loadScene(currentScene);
