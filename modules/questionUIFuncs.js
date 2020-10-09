/* eslint-disable import/no-cycle */
// /* eslint-disable no-undef */
import {
    insertHtml,
    setProp,
    select,
    selectAll,
    event,
    classAction,
    setStyle,
} from './DOMFuncs.js';
import {
    questionStatementHtml,
    codeBlockHtml,
    actionHtml,
    optionHtml,
    socialHandlesHtml,
} from './htmlBoilerplates.js';
import {
    saveAnswerSelected,
    getAnswerSelected,
    getCurrentQuestion,
    getAnswersSize,
    deleteAnswerItem,
    getTotalQuestion,
} from './sessionStrorage.js';
import {
    formatCodeForHtml,
    formatTextForHtml,
    grabLinkAddress,
    grabLinkName,
} from './appEngineFuncs.js';
import {
    getLangObject,
} from './langsObjectManager.js';
import SwipeJS from './swipeJS.min.js';

const setCurrentQuestionNumber = (currentQuestionNumber, totalQuestion) => {
    const progress = 100 - ((currentQuestionNumber / totalQuestion) * 100);
    setProp(select('#qn'), 'textContent', currentQuestionNumber);
    select('.progress').style.setProperty('--progress', `${progress}%`);
};

const setQuestionStatement = (qId, questionStatement) => {
    const htmlText = formatTextForHtml(questionStatement);
    insertHtml(select('#question-section'), 'beforeend', questionStatementHtml(qId, htmlText));
};

const setQuestionCodeBlock = (language, code) => {
    const codeText = formatCodeForHtml(code);
    insertHtml(select('#question-section'), 'beforeend', codeBlockHtml(language, codeText));
    hljs.highlightBlock(select('#code-block code'));
};

const setQuestionAction = (questionType) => {
    if (questionType === 'single-answer') {
        insertHtml(select('#question-section'), 'beforeend', actionHtml('Choose the correct answer'));
        return;
    }

    if (questionType === 'multiple-answers') {
        insertHtml(select('#question-section'), 'beforeend', actionHtml('Choose all correct answers'));
        return;
    }
};

const implementOptions = (questionType, options, questionNumber) => {
    options.forEach((v, i) => {
        insertHtml(select('.options'), 'beforeend', optionHtml(i + 1, v));
    });
    for (const option of selectAll('.option')) {
        const firstChild = option.firstElementChild;
        const lastChild = option.lastElementChild;
        event(option, 'click', () => {
            if (questionType === 'single-answer') {
                for (const check of selectAll('.option div')) {
                    classAction(check, 'remove', 'selected');
                }
                classAction(lastChild, 'add', 'selected');
                saveAnswerSelected(questionNumber, firstChild.textContent);
            } else if (questionType === 'multiple-answers') {
                classAction(lastChild, 'toggle', 'selected');
                const answersSelected = [...selectAll('.selected')].map((v) => v.previousElementSibling.textContent);
                if (answersSelected.length) {
                    saveAnswerSelected(questionNumber, answersSelected);
                } else {
                    deleteAnswerItem(questionNumber);
                }
            }
            setProp(select('#ans-count'), 'textContent', getAnswersSize());
            setProp(select('#rem-count'), 'textContent', getTotalQuestion() - getAnswersSize());
        });
        const optionBoxWidth = option.getBoundingClientRect().width;
        const optionTextWidth = firstChild.getBoundingClientRect().width;

        if (optionTextWidth > (optionBoxWidth * (77 / 100))) {
            setStyle(firstChild, 'fontSize', `${16 / 1.1}px`);
        }
    }
};

const setSocialHandles = (github, twitter) => {
    const linkAddress = [github, twitter].map((str) => (str ? grabLinkAddress(str) : ''));
    const linkName = [github, twitter].map((str) => (str ? grabLinkName(str) : ''));
    if (github) {
        insertHtml(select('.bottom'), 'afterbegin', socialHandlesHtml('github', linkAddress[0], linkName[0]));
    } else {
        insertHtml(select('.bottom'), 'afterbegin', '<p></p>');
    }

    if (twitter) {
        insertHtml(select('.bottom'), 'beforeend', socialHandlesHtml('twitter', linkAddress[1], linkName[1]));
    } else {
        insertHtml(select('.bottom'), 'beforeend', '<p></p>');
    }
};

const retrieveAnswer = (questionType, questionNumber) => {
    const answer = getAnswerSelected(questionNumber);
    if (!answer) return;

    if (questionType === 'single-answer') {
        const answerOwner = [...selectAll('.option')].find((elem) => elem.firstElementChild.textContent === answer).lastElementChild;
        classAction(answerOwner, 'add', 'selected');
        return;
    }

    if (questionType === 'multiple-answers') {
        for (const oneAnswer of answer) {
            const answerOwner = [...selectAll('.option')].find((elem) => elem.firstElementChild.textContent === oneAnswer).lastElementChild;
            classAction(answerOwner, 'add', 'selected');
        }
        return;
    }
};

const eraseQuestionBoard = () => {
    setProp(select('#question-section'), 'innerHTML', '');

    const bottomSection = select('.bottom');
    if ([...bottomSection.children].length > 1) {
        setProp(bottomSection.firstElementChild, 'outerHTML', '');
        setProp(bottomSection.lastElementChild, 'outerHTML', '');
    }
};

const navigateQuestion = (language) => {
    SwipeJS(select('.quiz-question-page')).addSwipeListener('swipeleft', () => {
        getLangObject(language).setQuestion(getCurrentQuestion() + 1);
    });
    SwipeJS(select('.quiz-question-page')).addSwipeListener('swiperight', () => {
        getLangObject(language).setQuestion(getCurrentQuestion() - 1);
    });
};

export {
    setCurrentQuestionNumber,
    setQuestionStatement,
    setQuestionCodeBlock,
    setQuestionAction,
    implementOptions,
    setSocialHandles,
    retrieveAnswer,
    navigateQuestion,
    eraseQuestionBoard,
};
