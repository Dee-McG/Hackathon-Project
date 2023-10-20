const storyFiles = [
  "desert-island",
  "haunted-hotel",
  "desert-island",
  "desert-island",
  "desert-island",
  "desert-island",
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

  const cardTitle = document.createElement("h2");
  cardTitle.textContent = details.name;
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
    // Extract the story name from the clicked card's title
    const cardTitle = clickedElement.querySelector("h2");
    const selectedStory = cardTitle.textContent;
    console.log(selectedStory);
  }
});
