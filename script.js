//stats

let currentPlayer = null;

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


//thing

function updateIdentityBar() {
  let stats = currentPlayer === "amma" ? ammaStats : appaStats;
  let diff = stats.culture - stats.assimilation;

  let width = 50 + diff * 5;
  width = Math.max(15, Math.min(85, width));

  let bar = document.getElementById("identity-bar");
  bar.style.width = width + "%";

  if (diff > 1) bar.style.background = "maroon";
  else if (diff < -1) bar.style.background = "navy";
  else bar.style.background = "purple";
}

//uh conditional dynamic text thingy

function getDynamicText(baseText, player) {
  let stats = player === "amma" ? ammaStats : appaStats;

  if (stats.fear > 3) {
    return baseText + "...";
  }

  if (stats.ambition > 3) {
    return baseText + "...";
  }

  return baseText;
}

//quotes from interview (add more ltr)
const quotes = {
  amma: {
    departure: "",
    arrival: "",
    identity: ""
  },
  appa: {
    decision: "",
    arrival: "",
    uncertainty: ""
  }
};

//scenes

let currentScene = "start";

const scenes = {

  start: {
    text: "Two journeys. One future.",
    timeline: "",
    music: "sounds/opening.mp3",
    choices: [
      { text: "Play as Saradha", next: "amma_intro", setPlayer: "amma" },
      { text: "Play as Satish", next: "appa_intro", setPlayer: "appa" }
    ]
  },

  //amma

  amma_intro: {
    text: "Tamil Nadu, late 1990s. Childhood felt contained.",
    timeline: "Chennai",
    statChanges: { culture: 1 },
    music: "sounds/india.mp3",
    choices: [{ text: "Continue", next: "amma_expectations" }]
  },

  amma_expectations: {
    text: "There were expectations. Quiet ones. Firm ones.",
    statChanges: { fear: 1 },
    choices: [
      { text: "Accept them", next: "amma_departure", statChanges: { culture: 1 } },
      { text: "Question them silently", next: "amma_departure", statChanges: { ambition: 1 } }
    ]
  },

  amma_departure: {
    text: "The move was decided. Not by you.",
    timeline: "Departure",
    statChanges: { fear: 1 },
    choices: [{ text: "Continue", next: "amma_arrival" }]
  },

  amma_hidden_memory: {
  requirement: function() {
    return ammaStats.culture > 3
  },
  fallback: "amma_pre_meeting",
  text: "a memory you never let go of.",
  choices: [{ text: "continue", next: "amma_pre_meeting" }]
},
    
  amma_arrival: {
    text: "America felt loud. Fast. Different.",
    timeline: "United States",
    statChanges: { assimilation: 1 },
    music: "sounds/arrival.mp3",
    choices: [{ text: "Continue", next: "amma_identity_split" }]
  },

  amma_identity_split: {
    text: "At school, your name sounded unfamiliar.",
    choices: [
      { text: "Blend in", next: "amma_choice_branch", statChanges: { assimilation: 2 } },
      { text: "Hold onto home", next: "amma_choice_branch", statChanges: { culture: 2 } }
    ]
  },

  amma_choice_branch: {
    text: "Identity became something you negotiated daily.",
    choices: [{ text: "Continue", next: "amma_pre_meeting" }]
  },

  amma_pre_meeting: {
    text: "Years later, you were steadier. Different, but whole.",
    choices: [{ text: "Continue", next: "meeting_scene" }]
  },

  //appa

  appa_intro: {
    text: "Tamil Nadu, early 2000s. A degree finished.",
    timeline: "Chennai",
    statChanges: { ambition: 1 },
    music: "sounds/india.mp3",
    choices: [{ text: "Continue", next: "appa_undergrad_pressure" }]
  },

  appa_undergrad_pressure: {
    text: "The future demanded something certain.",
    choices: [
      { text: "Stay safe", next: "appa_decision_to_leave", statChanges: { fear: 1 } },
      { text: "Take the risk", next: "appa_decision_to_leave", statChanges: { risk: 2 } }
    ]
  },

  appa_decision_to_leave: {
    text: "You chose to apply abroad.",
    statChanges: { ambition: 1 },
    choices: [{ text: "Continue", next: "appa_arrival" }]
  },

  appa_arrival: {
    text: "The U.S. was opportunity and uncertainty combined.",
    timeline: "United States",
    statChanges: { assimilation: 1 },
    music: "sounds/arrival.mp3",
    choices: [{ text: "Continue", next: "appa_world_event" }]
  },

  appa_world_event: {
    text: "Global events reshaped the atmosphere overnight.",
    timeline: "Post-9/11 Era",
    statChanges: { fear: 1 },
    choices: [{ text: "Continue", next: "appa_risk_choice" }]
  },

  appa_risk_choice: {
    text: "You could push forward or retreat.",
    choices: [
      { text: "Push forward", next: "appa_pre_meeting", statChanges: { ambition: 2 } },
      { text: "Play it safe", next: "appa_pre_meeting", statChanges: { fear: 1 } }
    ]
  },

  appa_pre_meeting: {
    text: "You had built something from uncertainty.",
    choices: [{ text: "Continue", next: "meeting_scene" }]
  },

  //meet

  meeting_scene: {
    dynamic: true,
    timeline: "The Meeting",
    music: "sounds/meeting.mp3",
    choices: [{ text: "Restart", next: "start" }]
  }

};

//scene

function loadScene(sceneName) {

  const game = document.getElementById("game");
  game.classList.add("fade-out");

  setTimeout(() => {

    let scene = scenes[sceneName];
    if (scene.requirement && !scene.requirement()) {
      loadScene(scene.fallback || "start");
      return;
}

    currentScene = sceneName;

    if (scene.music) playMusic(scene.music);

    document.getElementById("timeline").innerText = scene.timeline || "";
    
    if (scene.background) {
      document.getElementById("scene-background").style.backgroundImage =
        `url(${scene.background})`;
}

document.getElementById("left-image").src = scene.leftImage || "";
document.getElementById("right-image").src = scene.rightImage || "";


    let text = typeof scene.text === "function"
      ? scene.text()
      : scene.text || "";

    if (scene.dynamic && sceneName === "meeting_scene") {
      text = generateMeetingText();
    }

    if (!scene.dynamic) {
      text = getDynamicText(text, currentPlayer);
    }

    document.getElementById("story-text").innerText = text;

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

        if (choice.statChanges) {
          let stats = currentPlayer === "amma" ? ammaStats : appaStats;
          for (let key in choice.statChanges) {
            stats[key] += choice.statChanges[key];
          }
          updateIdentityBar();
        }

        loadScene(choice.next);
      };

      choicesDiv.appendChild(button);
    });

    game.classList.remove("fade-out");

  }, 800);
}

//end
function generateMeetingText() {

  let combined = {
    ambition: ammaStats.ambition + appaStats.ambition,
    culture: ammaStats.culture + appaStats.culture,
    assimilation: ammaStats.assimilation + appaStats.assimilation,
    fear: ammaStats.fear + appaStats.fear,
    risk: ammaStats.risk + appaStats.risk
  };

  let text = "All the choices. All the uncertainty.";

  if (combined.ambition > combined.fear) {
    text += "...";
  }

  if (combined.culture > combined.assimilation) {
    text += "...";
  }

  if (combined.risk > 3) {
    text += "...";
  }

  text += "...";

  return text;
}

loadScene(currentScene);
