const NUM_CATEGORIES = 6;
const NUM_CLUES = 5;
const BASE_API_URL = "https://rithm-jeopardy.herokuapp.com/api/";
const CATEGORIES_URL = `${BASE_API_URL}categories?count=100`;



/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
    const response = await axios.get(CATEGORIES_URL);
    const categoryIds = _.sampleSize(_.map(response.data, 'id'), NUM_CATEGORIES);
    return categoryIds;
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    const response = await axios.get(`${BASE_API_URL}category?id=${catId}`);
    const category = response.data;
    const clues = _.sampleSize(category.clues, NUM_CLUES).map(clue => ({
      question: clue.question,
      answer: clue.answer,
      showing: null
    }));
    return { title: category.title, clues };
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
    const categoryIds = await getCategoryIds();
    categories = await Promise.all(categoryIds.map(getCategory));

    // Fill the table header
    $('#jeopardy thead').empty();
    const $tr = $('<tr>');
    for (let catIdx = 0; catIdx < NUM_CATEGORIES; catIdx++) {
      $tr.append($('<th>').text(categories[catIdx].title));
    }
    $('#jeopardy thead').append($tr);

    // Fill the table body
    $('#jeopardy tbody').empty();
    for (let clueIdx = 0; clueIdx < NUM_CLUES; clueIdx++) {
      const $tr = $('<tr>');
      for (let catIdx = 0; catIdx < NUM_CATEGORIES; catIdx++) {
        $tr.append($('<td>').attr('id', `${catIdx}-${clueIdx}`).text('?'));
      }
      $('#jeopardy tbody').append($tr);
    }
}
/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
    const id = evt.target.id;
    const [catIdx, clueIdx] = id.split('-');
    const clue = categories[catIdx].clues[clueIdx];

    let msg;

    if (!clue.showing) {
      msg = clue.question;
      clue.showing = 'question';
    } else if (clue.showing === 'question') {
      msg = clue.answer;
      clue.showing = 'answer';
    } else {
      // already showing answer; ignore  
      return;
    }

    // Update text of cell
    $(`#${catIdx}-${clueIdx}`).text(msg);
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    $('#spinner').show();
    $('#start-btn').hide();

}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
    $('#spinner').hide();
    $('#start-btn').show();
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    showLoadingView();
    await fillTable();
    hideLoadingView();
}

/** On click of start / restart button, set up game. */

// TODO

/** On page load, add event handler for clicking clues */

// TODO
$(async function() {
    $('#start-btn').on('click', setupAndStart);
    $('#jeopardy').on('click', 'td', handleClick);
  });