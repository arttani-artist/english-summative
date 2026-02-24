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
    text += "\n\nyou built your place.";
  }

  if (combined.culture > combined.assimilation) {
    text += "\n\nyou carried a piece home with you.";
  }

  if (combined.risk > 3) {
    text += "\n\nit began with faith in the risks.";
  }

  text += "\n\nand somehow, you came together.";

  return text;
}

//scenes

const scenes = {

  start: {
    text: "two journeys. what will you choose?",
    music: "sounds/opening.mp3",
    background: "images/airport.png",
    choices: [
      { text: "play as saradha", next: "amma_intro", setPlayer: "amma" },
      { text: "play as satish", next: "appa_intro", setPlayer: "appa" }
    ]
  },

  // amma path

  amma_intro: {
    text: "tamil nadu, late 1990s. you are moving to america whether you like it or not.",
    timeline: "chennai",
    background: "images/IIT.png",
    leftImage: "images/amma_neutral.png",
    statChanges: { culture: 1 },
    music: "sounds/india.mp3",
    choices: [
      { text: "accept it quietly", next: "amma_departure", statChanges: { fear: 1 } },
      { text: "argue about it", next: "amma_departure", statChanges: { ambition: 1 } }
    ]
  },

  amma_departure: {
    text: "the airport felt bigger than your whole world.",
    timeline: "chennai airport",
    background: "images/airport.png",
    leftImage: "images/amma_sad.png",
    statChanges: { fear: 1 },
    music: "sounds/airport.mp3",
    choices: [
      { text: "hold onto home", next: "amma_arrival", statChanges: { culture: 1 } },
      { text: "prepare for change", next: "amma_arrival", statChanges: { assimilation: 1 } }
    ]
  },

  amma_arrival: {
    text: "maryland felt loud and unfamiliar. but you have to adapt, right?",
    timeline: "maryland, united states",
    background: "images/maryland.png",
    leftImage: "images/amma_speaking.png",
    statChanges: { assimilation: 1 },
    music: "sounds/airport.mp3",
    choices: [
      { text: "blend in at school", next: "amma_identity_split", statChanges: { assimilation: 2 } },
      { text: "keep your traditions", next: "amma_identity_split", statChanges: { culture: 2 } }
    ]
  },

  amma_identity_split: {
    text: "your name sounded different here. it was hard to pronounce and you didnt feel like yourself when you heard your names on foreign tongues.",
    background: "images/maryland.png",
    leftImage: "images/amma_neutral.png",
    choices: [
      { text: "shorten your name from 'Saradha' to 'Sara'", next: "amma_growth", statChanges: { assimilation: 1 } },
      { text: "correct people", next: "amma_growth", statChanges: { culture: 1 } }
    ]
  },

  amma_growth: {
    text: "slowly, you built confidence. this is where you were met to be",
    leftImage: "images/amma_happy.png",
    statChanges: { ambition: 1 },
    choices: [
      { text: "focus on academics", next: "amma_hidden_memory", statChanges: { ambition: 1 } },
      { text: "focus on community", next: "amma_hidden_memory", statChanges: { culture: 1 } }
    ]
  },

  amma_hidden_memory: {
    requirement: function() {
      return ammaStats.culture >= 3;
    },
    fallback: "amma_pre_meeting",
    text: "a memory of home stayed with you longer than you expected.",
    background: "images/chennai.png",
    leftImage: "images/amma_sad.png",
    statChanges: { culture: 1 },
    choices: [{ text: "move forward", next: "amma_pre_meeting" }]
  },

  amma_pre_meeting: {
    text: "you had grown into someone connected between your two worlds.",
    leftImage: "images/amma_neutral.png",
    choices: [{ text: "continue", next: "meeting_scene" }]
  },

  // appa path

  appa_intro: {
    text: "you finished your undergrad degree. america feels like the next step.",
    timeline: "chennai",
    background: "images/chennai.png",
    rightImage: "images/appa_neutral.png",
    statChanges: { ambition: 1 },
    music: "sounds/india2.mp3",
    choices: [
      { text: "apply for phd programs", next: "appa_arrival", statChanges: { ambition: 1 } },
      { text: "consider industry work", next: "appa_arrival", statChanges: { risk: 1 } }
    ]
  },

  appa_arrival: {
    text: "syracuse was cold and unfamiliar.",
    timeline: "syracuse, united states",
    background: "images/syracuse.png",
    rightImage: "images/appa_speaking.png",
    statChanges: { assimilation: 1 },
    music: "sounds/airport.mp3",
    choices: [
      { text: "commit to phd", next: "appa_pressure", statChanges: { ambition: 2 } },
      { text: "reconsider your path", next: "appa_pressure", statChanges: { fear: 1 } }
    ]
  },

  appa_pressure: {
    text: "research was isolating at times.",
    rightImage: "images/appa_sad.png",
    statChanges: { fear: 1 },
    choices: [
      { text: "push forward", next: "appa_growth", statChanges: { ambition: 1 } },
      { text: "lean on community", next: "appa_growth", statChanges: { culture: 1 } }
    ]
  },

  appa_growth: {
    text: "you became more certain in what you wanted to do, but would you continue to vie for your PhD or pursue a different path?",
    rightImage: "images/appa_happy.png",
    choices: [
      { text: "take a leap of faith", next: "appa_pre_meeting", statChanges: { risk: 2 } },
      { text: "play it safe", next: "appa_pre_meeting", statChanges: { fear: 1 } }
    ]
  },

  appa_pre_meeting: {
    text: "your path had shaped you into someone ready.",
    rightImage: "images/appa_neutral.png",
    choices: [{ text: "continue", next: "meeting_scene" }]
  },

  // meeting

  meeting_scene: {
    dynamic: true,
    timeline: "the meeting",
    background: "images/maryland.png",
    leftImage: "images/amma_happy.png",
    rightImage: "images/appa_happy.png",
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

   const leftImg = document.getElementById("left-image");
const rightImg = document.getElementById("right-image");

  if (scene.leftImage) {
      leftImg.src = scene.leftImage;
      leftImg.style.display = "block";
} 
  else {
      leftImg.style.display = "none";
}

  if (scene.rightImage) {
      rightImg.src = scene.rightImage;
      rightImg.style.display = "block";
} 
  else {
      rightImg.style.display = "none";
}
    
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
