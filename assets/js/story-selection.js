// Add all stories here
const storyFiles = [
  "desert-island",
  "haunted-forest",
  "haunted-hotel",
  "haunted-mansion",
  "pirate-ship",
];
const cardWrapper = document.getElementById("card-wrapper");
selectedStory = null; // Global variable for the selected story

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
    console.log(originalName);
  }
});
