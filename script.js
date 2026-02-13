//stats

let currentPlayer = null;

let momStats = { ambition: 0, fear: 0, culture: 0, assimilation: 0, risk: 0 };
let dadStats = { ambition: 0, fear: 0, culture: 0, assimilation: 0, risk: 0 };

//music

let currentMusic = null;

function playMusic(src) {
  if (currentMusic) currentMusic.pause();
  currentMusic = new Audio(src);
  currentMusic.loop = true;
  currentMusic.volume = 0.3;
  currentMusic.play();
}

//thing

function updateIdentityBar() {
  let stats = currentPlayer === "mom" ? momStats : dadStats;
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
  let stats = player === "mom" ? momStats : dadStats;

  if (stats.fear > 3) {
    return baseText + "\n\nYou almost turned back more than once.";
  }

  if (stats.ambition > 3) {
    return baseText + "\n\nYou weren’t just leaving. You were building.";
  }

  return baseText;
}

//scenes

let currentScene = "start";

const scenes = {

  start: {
    text: "Two journeys. One future.",
    timeline: "",
    music: "sounds/opening.mp3",
    choices: [
      { text: "Play as Saradha", next: "mom_intro", setPlayer: "mom" },
      { text: "Play as Satish", next: "dad_intro", setPlayer: "dad" }
    ]
  },

  //amma

  mom_intro: {
    text: "Tamil Nadu, late 1990s. Childhood felt contained.",
    timeline: "Chennai",
    statChanges: { culture: 1 },
    music: "sounds/india.mp3",
    choices: [{ text: "Continue", next: "mom_expectations" }]
  },

  mom_expectations: {
    text: "There were expectations. Quiet ones. Firm ones.",
    statChanges: { fear: 1 },
    choices: [
      { text: "Accept them", next: "mom_departure", statChanges: { culture: 1 } },
      { text: "Question them silently", next: "mom_departure", statChanges: { ambition: 1 } }
    ]
  },

  mom_departure: {
    text: "The move was decided. Not by you.",
    timeline: "Departure",
    statChanges: { fear: 1 },
    choices: [{ text: "Continue", next: "mom_arrival" }]
  },

  mom_arrival: {
    text: "America felt loud. Fast. Different.",
    timeline: "United States",
    statChanges: { assimilation: 1 },
    music: "sounds/arrival.mp3",
    choices: [{ text: "Continue", next: "mom_identity_split" }]
  },

  mom_identity_split: {
    text: "At school, your name sounded unfamiliar.",
    choices: [
      { text: "Blend in", next: "mom_choice_branch", statChanges: { assimilation: 2 } },
      { text: "Hold onto home", next: "mom_choice_branch", statChanges: { culture: 2 } }
    ]
  },

  mom_choice_branch: {
    text: "Identity became something you negotiated daily.",
    choices: [{ text: "Continue", next: "mom_pre_meeting" }]
  },

  mom_pre_meeting: {
    text: "Years later, you were steadier. Different, but whole.",
    choices: [{ text: "Continue", next: "meeting_scene" }]
  },

  //appa

  dad_intro: {
    text: "Tamil Nadu, early 2000s. A degree finished.",
    timeline: "Chennai",
    statChanges: { ambition: 1 },
    music: "sounds/india.mp3",
    choices: [{ text: "Continue", next: "dad_undergrad_pressure" }]
  },

  dad_undergrad_pressure: {
    text: "The future demanded something certain.",
    choices: [
      { text: "Stay safe", next: "dad_decision_to_leave", statChanges: { fear: 1 } },
      { text: "Take the risk", next: "dad_decision_to_leave", statChanges: { risk: 2 } }
    ]
  },

  dad_decision_to_leave: {
    text: "You chose to apply abroad.",
    statChanges: { ambition: 1 },
    choices: [{ text: "Continue", next: "dad_arrival" }]
  },

  dad_arrival: {
    text: "The U.S. was opportunity and uncertainty combined.",
    timeline: "United States",
    statChanges: { assimilation: 1 },
    music: "sounds/arrival.mp3",
    choices: [{ text: "Continue", next: "dad_world_event" }]
  },

  dad_world_event: {
    text: "Global events reshaped the atmosphere overnight.",
    timeline: "Post-9/11 Era",
    statChanges: { fear: 1 },
    choices: [{ text: "Continue", next: "dad_risk_choice" }]
  },

  dad_risk_choice: {
    text: "You could push forward or retreat.",
    choices: [
      { text: "Push forward", next: "dad_pre_meeting", statChanges: { ambition: 2 } },
      { text: "Play it safe", next: "dad_pre_meeting", statChanges: { fear: 1 } }
    ]
  },

  dad_pre_meeting: {
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
    currentScene = sceneName;

    if (scene.music) playMusic(scene.music);

    document.getElementById("timeline").innerText = scene.timeline || "";

    let text = scene.text || "";

    if (scene.dynamic && sceneName === "meeting_scene") {
      text = generateMeetingText();
    }

    if (!scene.dynamic) {
      text = getDynamicText(text, currentPlayer);
    }

    document.getElementById("story-text").innerText = text;

    if (scene.statChanges) {
      let stats = currentPlayer === "mom" ? momStats : dadStats;
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
          let stats = currentPlayer === "mom" ? momStats : dadStats;
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
    ambition: momStats.ambition + dadStats.ambition,
    culture: momStats.culture + dadStats.culture,
    assimilation: momStats.assimilation + dadStats.assimilation,
    fear: momStats.fear + dadStats.fear,
    risk: momStats.risk + dadStats.risk
  };

  let text = "All the choices. All the uncertainty.";

  if (combined.ambition > combined.fear) {
    text += "\n\nYou were builders.";
  }

  if (combined.culture > combined.assimilation) {
    text += "\n\nYou carried home with you.";
  }

  if (combined.risk > 3) {
    text += "\n\nIt began with a leap.";
  }

  text += "\n\nAnd somehow, your paths crossed.";

  return text;
}

loadScene(currentScene);
