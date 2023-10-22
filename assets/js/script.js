let startBtn = document.getElementById("start-btn");
let startSection = document.getElementById("start-section");
let storySelection = document.getElementById("story-selection-section");
let hoverSoundTimeout;
let globalAudio = new Audio();
// Add all stories here
const storyFiles = [
  "desert-island",
  "haunted-forest",
  "haunted-hotel",
  "haunted-mansion",
  "pirate-ship",
];
const cardWrapper = document.getElementById("card-wrapper");
let selectedStory = null; // Global variable for the selected story
let currentSceneKey;

/**
 * Hide start screen and display story selection screen
 */
const loadStorySelection = () => {
  startSection.style.display = "none";
  storySelection.style.display = "block";
}

startBtn.addEventListener("click", loadStorySelection);

/**
 * Loads the selected story json file
 * The param will need to be be the same as the file name
 * @param {string} story 
 */
const loadStoryFromJson = async (story) => {
  const response = await fetch(`assets/js/stories/${story}.json`);
  const res = await response.json();
  loadDialogue(res, "scene_one");
};

/**
 * Extracts the dialogue of the current scene from the provided story object.
 * @param {Object} story - The story object loaded from the JSON.
 */
const loadDialogue = (story, scene) => {
  currentSceneKey = scene;
  selectedStory = story;
  const dialogue = story[scene]?.dialogue;
  const storyboard = document.querySelector("#storyboard"); // update this once story board is created
  if (dialogue) {
    storyboard.textContent = dialogue;
    loadQuestion(story[scene]);
    if (story[scene]?.soundOnLoad) {
      playSound(story[scene].soundOnLoad, story[scene].soundOnLoadTimeOut);
    }
  } else {
    // Handle end of game screen
    console.error("Dialogue for the current scene not found.");
  }
  // Load random image for the story
  const sceneImageElement = document.getElementById("scene-image");
  sceneImageElement.src = getRandomSceneImage(story.details.name);
  // Replace {char} with the playername
  const replacedDialogue = replaceCharWithCharacterName(dialogue);
  storyboard.textContent = replacedDialogue;
};

/**
 * Extracts the scene options from the current scene and loads into html
 * @param {object} scene - Current scene from the story
 */
const loadQuestion = (scene) => {
  const question = document.getElementById("question");
  question.style.display = "flex";
  question.innerText = scene.question;
  loadChoices(scene);
  const replacedQuestionText = replaceCharWithCharacterName(question.innerText);
  question.innerText = replacedQuestionText;
}

/**
 * Extracts the scene options from the current scene and loads into the choice buttons
 * @param {object} scene - Current scene from the story
 */
const loadChoices = (scene) => {
  const choices = document.querySelectorAll(".choice");
  document.getElementById("choices").style.display = "flex";
  choices.forEach((choice, index) => {
    choice.innerText = scene.choices[index].action;

    // Click sound
    choice.onclick = () => {
      if (scene.choices[index].sound) {
        playSound(scene.choices[index].sound, scene.choices[index].ClickSoundTimeOut);
      }
      handleChoice(index);
    };

    // Hover sound
    if (scene.choices[index].hoverSound) {
      choice.addEventListener('mouseover', () => {
        playSound(scene.choices[index].hoverSound, scene.choices[index].hoverSoundTimeOut);
      });
    }
  });
}


/**
 * Extracts the scene options from the current scene and loads the epilogue into html
 * @param {object} scene - Current scene from the story
 */
const loadEpilogue = (scene) => {
  const storyBoard = document.getElementById("storyboard");

  storyBoard.innerHTML += `<p>${scene.epilogue}</p>`;
}

/**
 * Handles the user's choice and loads the next scene accordingly.
 * @param {number} choiceIndex - Index of the choice clicked by the user.
 */
const handleChoice = async (choiceIndex) => {
  document.getElementById("choices").style.display = "none";
  document.getElementById("question").style.display = "none";
  let action = selectedStory[currentSceneKey].choices[choiceIndex].action;
  let result = selectedStory[currentSceneKey].choices[choiceIndex].result;
  document.getElementById("storyboard").innerText = `${action}. ${result}`;

  await new Promise(resolve => setTimeout(resolve, 6000));
  loadEpilogue(selectedStory[currentSceneKey]);

  await new Promise(resolve => setTimeout(resolve, 10000));

  const currentScene = selectedStory[currentSceneKey];
  currentSceneKey = currentScene.choices[choiceIndex].next;
  loadDialogue(selectedStory, currentSceneKey);
}

/**
 * Fetch JSON data for the specified story.
 * @param {string} story - The name of the story.
 */
const fetchStoryData = async (story) => {
  try {
    const response = await fetch(`assets/js/stories/${story}.json`);
    if (response.ok) {
      return await response.json();
    } else {
      console.error(
        "Failed to fetch JSON file:",
        response.status,
        response.statusText
      );
      return null;
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return null;
  }
};

/**
 * Create a card element with provided details.
 * @param {Object} story details
 */
const createCardElement = (details) => {
  const card = document.createElement("article");
  card.className = "card";
  cardWrapper.setAttribute("value", details.name);

  const cardImage = document.createElement("img");
  cardImage.className = "card-image";
  cardImage.src = details.image;
  cardImage.alt = details.alt;

  const originalName = details.name;
  const formattedName = originalName.replace(/-/g, " "); // Format name without hyphens

  const cardTitle = document.createElement("h2");
  cardTitle.textContent = formattedName;
  cardTitle.setAttribute("data-original-name", originalName); // Used to store original name so we know what story to run
  cardTitle.tabIndex = 0;

  const cardDescription = document.createElement("p");
  cardDescription.textContent = details.about;
  cardDescription.tabIndex = 0;

  card.appendChild(cardImage);
  card.appendChild(cardTitle);
  card.appendChild(cardDescription);

  return card;
};

/**
 * Append a card element to the card wrapper.
 * @param {HTMLElement} card
 */
const appendCardToWrapper = (card) => {
  cardWrapper.appendChild(card);
};

/**
 * Process story data and create cards for each story.
 * @param {string[]} storyFiles An array of story filenames.
 */
const processStoryData = async (storyFiles) => {
  for (const story of storyFiles) {
    const storyData = await fetchStoryData(story);
    if (storyData) {
      const card = createCardElement(storyData.details);
      appendCardToWrapper(card);
    }
  }
};

// Call the function to start fetching and creating cards
processStoryData(storyFiles);

cardWrapper.addEventListener("click", (event) => {
  const clickedElement = event.target.closest(".card");
  if (clickedElement) {
    const originalName = clickedElement
      .querySelector("h2")
      .getAttribute("data-original-name");
    loadStoryFromJson(originalName);
    document.getElementById("storyboard-section").style.display = "block";
    storySelection.style.display = "none";
  }
});


const storiesAndImages = {
  "desert-island": {
    images: [
      "assets/images/island1.jpg",
      "assets/images/island2.jpg",
      "assets/images/island-beach.jpg",
      "assets/images/island-building.jpg",
      "assets/images/island-lights.jpg",
      "assets/images/island-doorway.jpg",
      "assets/images/island-scene1.jpg",
      "assets/images/island-shadow.jpg",
      "assets/images/island-towards-beach.jpg",
      // ... other desert-island images
    ]
  },
  "haunted-forest": {
    images: [
      "assets/images/forest1.jpg",
      "assets/images/forest2.jpg",
      // ... other haunted-forest images
    ]
  },
  "haunted-hotel": {
    images: [
      "assets/images/hotel1.jpg",
      "assets/images/hotel1.jpg",
      // ... other haunted-forest images
    ]
  },
  "haunted-mansion": {
    images: [
      "assets/images/house1.jpg",
      "assets/images/haunted-forest2.jpg",
      // ... other haunted-forest images
    ]
  },
  "pirate-ship": {
    images: [
      "assets/images/pirate-ship.jpg",
      // ... other haunted-forest images
    ]
  },

};

//Function to generate image
function getRandomSceneImage(storyName) {
  if (!storiesAndImages[storyName]) {
    console.error(`No images found for story: ${storyName}`);
    return ""; // return a default image or an empty string
  }

  const images = storiesAndImages[storyName].images;
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
}

//Store player name in session storage
document.getElementById("set-character-name-btn").addEventListener("click", function () {
  const charName = document.getElementById("character-name-input").value;

  if (charName) {
    sessionStorage.setItem("characterName", charName);
  } else {
    alert("Please enter a character name.");
  }
});


/**
 * Replaces {char} in a given text with the character name from session storage.
 * @param {string} text - The text where replacements should be made.
 * @returns {string} - Text with {char} replaced by character name.
 */
function replaceCharWithCharacterName(text) {
  const charName = sessionStorage.getItem("characterName") || "DefaultName";
  return text.replace(/{char}/g, charName);
}

const playSound = (soundURL, time) => {
  if (!soundURL) return;

  // If a sound is currently waiting to be played or is playing, clear/stop it
  if (hoverSoundTimeout) {
    clearTimeout(hoverSoundTimeout);
  }
  if (globalAudio) {
    globalAudio.pause();
    globalAudio.currentTime = 0;  // reset audio playback
  }

  hoverSoundTimeout = setTimeout(() => {
    globalAudio.src = soundURL;
    globalAudio.play();
  }, time);
}