let startBtn = document.getElementById("start-btn");
let startSection = document.getElementById("start-section");
let storySelection = document.getElementById("story-selection-section");
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
    selectedStory = story;
    const dialogue = story[scene]?.dialogue;
    const storyboard = document.querySelector("#storyboard"); // update this once story board is created
    if (dialogue) {
        storyboard.textContent = dialogue;
    } else {
        console.error("Dialogue for the current scene not found.");
    }
    loadQuestion(story[scene]);
};

/**
 * Extracts the scene options from the current scene and loads into html
 * @param {object} scene - Current scene from the story
 */
const loadQuestion = (scene) => {
    const question = document.getElementById("question");
    question.innerText = scene.question;
    loadChoices(scene);
}

/**
 * Extracts the scene options from the current scene and loads into the choice buttons
 * @param {object} scene - Current scene from the story
 */
const loadChoices = (scene) => {
    const choices = document.querySelectorAll(".choice");

    choices.forEach((choice, index) => {
        choice.innerText = scene.choices[index].action;
    });

    loadEpilogue(scene);
}

/**
 * Extracts the scene options from the current scene and loads the epilogue into html
 * @param {object} scene - Current scene from the story
 */
const loadEpilogue = (scene) => {
    const epilogue = document.getElementById("epilogue");

    epilogue.innerText = scene.epilogue;
    // TODO - Call next scene function
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

