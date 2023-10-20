/**
 * Loads the selected story json file
 * The param will need to be be the same as the file name
 * @param {string} story 
 */
const loadStoryFromJson = async (story) => {
    const response = await fetch(`assets/js/stories/${story}.json`);
    const res = await response.json();
    loadDialogue(res);
};

/**
 * Extracts the dialogue of the current scene from the provided story object.
 * Assumes a default starting scene if no other scene is specified.
 *
 * @param {Object} story - The story object loaded from the JSON.
 */
const loadDialogue = (story, scene) => {
    const dialogue = story[scene]?.dialogue;
    const storyboard = document.querySelector('#storyboard'); // update this once story board is created
    if (dialogue) {
        storyboard.textContent = dialogue;
    } else {
        console.error("Dialogue for the current scene not found.");
    }
};
// Test it works
loadStoryFromJson("desert-island");
