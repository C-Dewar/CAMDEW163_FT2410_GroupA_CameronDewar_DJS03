import { books, authors, genres, BOOKS_PER_PAGE } from './data.js';

let page = 1;
let matches = books;

//Utility function to create an element with optional class name
function createElement(tag, className = '') {
  const element = document.createElement(tag);
  if (className) element.classList.add(className);
  return element;
}

//Render a single book preview - Refactored to avoid duplication of code.
function renderBookPreview(book) {
  const element = createElement('button', 'preview');
  element.setAttribute('data-preview', book.id);
  element.innerHTML = `
    <img class = "preview__image" src="${book.image}"/>
    <div class = "preview__info">
    <h3 class = "preview__title">${book.title}</h3>
    <div class = "preview__author">${authors[book.author]}</div>
    </div>  
    `;
  return element;
}

/**  Create a state variable to ensure that the inner HTML is only cleared upon a search submission, not when the showMore button is clicked, as they make use of the same function.*/
let isSearch = false;

//Render the book list, to show initial/landing page or search results
function renderBookList(booksToRender) {
  const fragment = document.createDocumentFragment();
  booksToRender.forEach((book) =>
    fragment.appendChild(renderBookPreview(book))
  );
  if (isSearch) {
    document.querySelector('[data-list-items]').innerHTML = '';
    isSearch = false; //Reset the search state variable/search flag
  }
  //Append the books to the list
  document.querySelector('[data-list-items]').appendChild(fragment);
}

//Render genres in search filter dropdown
function renderGenres() {
  const genreFragment = document.createDocumentFragment();
  const firstGenreOption = createElement('option');
  firstGenreOption.value = 'any';
  firstGenreOption.innerText = 'All Genres';
  genreFragment.appendChild(firstGenreOption);

  Object.entries(genres).forEach(([id, name]) => {
    const option = createElement('option');
    option.value = id;
    option.innerText = name;
    genreFragment.appendChild(option);
  });

  document.querySelector('[data-search-genres]').appendChild(genreFragment);
}

//Render authors in search filter drop-down
function renderAuthors() {
  const authorsFragment = document.createDocumentFragment();
  const firstAuthorOption = createElement('option');
  firstAuthorOption.value = 'any';
  firstAuthorOption.innerText = 'All authors';
  authorsFragment.appendChild(firstAuthorOption);

  Object.entries(authors).forEach(([id, name]) => {
    const option = createElement('option');
    option.value = id;
    option.innerText = name;
    authorsFragment.appendChild(option);
  });

  document.querySelector('[data-search-authors]').appendChild(authorsFragment);
}

//Initialise theme based on the user preference
function initialiseTheme() {
  if (
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    document.querySelector('[data-settings-theme]').value = 'night';
    document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
    document.documentElement.style.setProperty('--color-light', '10, 10, 20');
  } else {
    document.querySelector('[data-settings-theme]').value = 'day';
    document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
    document.documentElement.style.setProperty('--color-light', '255, 255,255');
  }
}

//Update the showMore button text and disable it if there are no more books to display
function updateShowMoreButton() {
  const remainingBooks = matches.length - page * BOOKS_PER_PAGE;
  const showMoreButton = document.querySelector('[data-list-button]');

  showMoreButton.innerHTML = `
    <span> Show more </span>
    <span class="list__remaining">(${
      remainingBooks > 0 ? remainingBooks : 0
    })</span>
    `;
  showMoreButton.disabled = remainingBooks <= 0;
}

//Handle search form submission using filtering logic
function handleSearch(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const filters = Object.fromEntries(formData);
  //Set the search flag/search state variable to true, as a search is being performed
  isSearch = true;
  //filter books based on search criteria
  const filteredBooks = filterBooks(filters);
  //Reset to the first page when a search is made
  page = 1;
  matches = filteredBooks;
  //   console.log('Filtered books:', filteredBooks);
  renderBookList(filteredBooks.slice(0, BOOKS_PER_PAGE));
  updateShowMoreButton();

  //show message if there are no book matches
  const message = document.querySelector('[data-list-message]');
  message.classList.toggle('list__message_show', filteredBooks.length === 0);
  //Close the search overlay
  document.querySelector('[data-search-overlay]').open = false;
  //Reset the form inputs after submission to ensure the form is blank each time
  event.target.reset();
}

//Filter books based on search criteria
function filterBooks(filters) {
  return books.filter((book) => {
    const genreMatch =
      filters.genre === 'any' || book.genres.includes(filters.genre);
    const titleMatch =
      !filters.title.trim() ||
      book.title.toLowerCase().includes(filters.title.toLowerCase());
    const authorMatch =
      filters.author === 'any' || book.author === filters.author;
    return genreMatch && titleMatch && authorMatch;
  });
}

//Handle showMore button click - i.e. load more books
function handleShowMore() {
  page += 1;
  const booksToRender = matches.slice(
    page * BOOKS_PER_PAGE,
    (page + 1) * BOOKS_PER_PAGE
  );
  renderBookList(booksToRender);
  updateShowMoreButton();
}

//Handle book preview click
function handleBookPreviewClick(event) {
  const target = event.target.closest('[data-preview]');
  if (!target) return;

  const activeBook = books.find((book) => book.id === target.dataset.preview);
  if (activeBook) {
    document.querySelector('[data-list-active]').open = true;
    document.querySelector('[data-list-blur]').src = activeBook.image;
    document.querySelector('[data-list-image]').src = activeBook.image;
    document.querySelector('[data-list-title]').innerText = activeBook.title;
    document.querySelector('[data-list-subtitle]').innerText = `${
      authors[activeBook.author]
    } (${new Date(activeBook.published).getFullYear()})`;
    document.querySelector('[data-list-description]').innerText =
      activeBook.description;
  }
}

//Event listeners
document
  .querySelector('[data-search-form]')
  .addEventListener('submit', handleSearch);
document
  .querySelector('[data-list-button]')
  .addEventListener('click', handleShowMore);
document
  .querySelector('[data-list-items]')
  .addEventListener('click', handleBookPreviewClick);

document.querySelector('[data-search-cancel]').addEventListener('click', () => {
  document.querySelector('[data-search-overlay]').open = false;
});

document
  .querySelector('[data-settings-cancel]')
  .addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = false;
  });

document.querySelector('[data-header-search]').addEventListener('click', () => {
  document.querySelector('[data-search-overlay]').open = true;
  document.querySelector('[data-search-title]').focus();
});

document
  .querySelector('[data-header-settings]')
  .addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = true;
  });

document.querySelector('[data-list-close]').addEventListener('click', () => {
  document.querySelector('[data-list-active]').open = false;
});

document
  .querySelector('[data-settings-form]')
  .addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { theme } = Object.fromEntries(formData);
    applyTheme(theme);
    document.querySelector('[data-settings-overlay]').open = false;
  });

//Apply themne (dark or light mode)
function applyTheme(theme) {
  if (theme === 'night') {
    document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
    document.documentElement.style.setProperty('--color-light', '10, 10, 20');
  } else {
    document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
    document.documentElement.style.setProperty(
      '--color-light',
      '255, 255, 255'
    );
  }
}

//Initialisation of functions
initialiseTheme();
renderBookList(books.slice(0, BOOKS_PER_PAGE));
renderGenres();
renderAuthors();
updateShowMoreButton();
