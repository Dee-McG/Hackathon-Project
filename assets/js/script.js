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
  replaceCharWithCharacterName(res);
  loadDialogue(selectedStory, "scene_one");
};


/**
 * Extracts the dialogue of the current scene from the provided story object.
 * @param {Object} story - The story object loaded from the JSON.
 */
const loadDialogue = (story, scene) => {
  currentSceneKey = scene;
  const dialogue = story[scene]?.dialogue;
  const storyboard = document.querySelector("#storyboard"); // update this once story board is created
  // Replace {char} with the playername
  storyboard.textContent = dialogue;
  if (dialogue) {
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
};


/**
 * Extracts the scene options from the current scene and loads into html
 * @param {object} scene - Current scene from the story
 */
const loadQuestion = (scene) => {
  const question = document.getElementById("question");
  question.style.display = "block";
  question.innerText = scene.question;
  loadChoices(scene);
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

    // Remove any previously added click and mouseover event listeners
    const newChoice = choice.cloneNode(true);
    choice.parentNode.replaceChild(newChoice, choice);
    choice = newChoice;

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

  // Loads end if final scene
  let endScenes = ["scene_three_0", "scene_three_1", "scene_three_2"];
  if (endScenes.includes(currentSceneKey)) {
    endScene(selectedStory[currentSceneKey].choices[choiceIndex].next, action);
  }
  else {
    let result = selectedStory[currentSceneKey].choices[choiceIndex].result;
    document.getElementById("storyboard").innerText = `${action}. ${result}`;

    loadEpilogue(selectedStory[currentSceneKey]);

    const currentScene = selectedStory[currentSceneKey];
    currentSceneKey = currentScene.choices[choiceIndex].next;
    loadDialogue(selectedStory, currentSceneKey);
  }

}

/**
 * Loads the end scene
 * @param {ending} Final scene text 
 */
const endScene = (ending, action) => {
  let storyBoard = document.getElementById("storyboard");
  storyBoard.innerText = action;
  storyBoard.innerHTML += `<p>${selectedStory[ending]}</p>`;
  storyBoard.innerHTML += `
  <button id="complete-btn" class="choice">Complete The Story</button>
`;

  // Add event listener to the Complete button
  document.getElementById("complete-btn").addEventListener("click", () => {
    loadEndScreen();
  });
}

const loadEndScreen = () => {
  const storyboard = document.getElementById("storyboard");
  globalAudio.pause();
  globalAudio.currentTime = 0;
  storyboard.innerHTML = `
    <h2>End of the story</h2>
    <p>Thank you for taking the time to try out our creation, we hope you have enjoyed the experience and pass the link onto your friends and family. We hope you will come back and try out another of our stories. Have a spooktacular day.</p>
    <button id="select-story-btn" class="choice" disabled aria-disabled="true">Choose Another Story</button>
  `;

  const selectStoryBtn = document.getElementById("select-story-btn");

  // Enable the button (slightly longer than the jump scare)
  setTimeout(() => {
    selectStoryBtn.removeAttribute("disabled");
    selectStoryBtn.setAttribute('aria-disabled', 'false');
  }, 4000);

  // Go back to story selection
  selectStoryBtn.addEventListener("click", () => {
    loadStorySelection();
    storyboard.innerHTML = "";
  });

  setTimeout(jumpScare, 3000);
}

const jumpScare = () => {
  // Play the jumpscare sound
  let jumpscareAudio = new Audio('assets/sounds/jump-scare.mp3');
  jumpscareAudio.play();

  // Create and display the jumpscare image
  let img = document.createElement("img");
  img.src = 'assets/images/jumpscare-face.png';
  img.id = "jumpscare-img";
  img.alt = "A scary face";
  document.body.appendChild(img);
  img.style.position = "fixed";
  img.style.top = "50%";
  img.style.left = "50%";
  img.style.width = "0";
  img.style.height = "0";
  img.style.transform = "translate(-50%, -50%)";
  img.style.transition = "width 2s, height 2s";
  img.style.zIndex = "9999";

  setTimeout(() => {
    img.style.width = "100vw";
    img.style.height = "100vh";
  }, 100);

  // Remove image after animation
  setTimeout(() => {
    img.remove();
  }, 2100);
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

    const nameAddedMessage = document.querySelector(".name-added-message");
    nameAddedMessage ? nameAddedMessage.style.display = "block" : "none";
  } else {
    alert("Please enter a character name.");
  }
});


/**
 * Replaces {char} in a given text with the character name from session storage.
 * @param {string} text - The text where replacements should be made.
 * @returns {string} - Text with {char} replaced by character name.
 */
function replaceCharWithCharacterName(story) {
  const charName = sessionStorage.getItem("characterName") || "DefaultName";
  let storyStr = JSON.stringify(story);
  let reg = /{char}/g;
  let formattedStory = storyStr.replace(reg, charName);
  selectedStory = JSON.parse(formattedStory); //convert back to array
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

//modal box
// Get the modal
let modal = document.getElementById("myModal");

// Get the button that opens the modal
let btn = document.getElementById("rules-btn");

// Get the <span> element that closes the modal
let span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
btn.onclick = function () {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}