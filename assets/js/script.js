let currentStory;

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
    currentStory = story;
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

// Test it works
loadStoryFromJson("desert-island");
