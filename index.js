// Custom error handling
class ResponseError extends Error {
  constructor(message, response) {
    super(message);
    this.response = response;
  }
}

function handlerError(error, queryParams) {
  switch(error.response.status) {
    case 404:
      notifyUser(`${queryParams} no fue encontrado.`, 'toast-error');
      break;
    case 598: case 599: case 500: case 429:
      notifyUser(`Error de red. Intente más tarde.`, 'toast-error');
      break;
    default: notifyUser(`🔥 Error inesperado. Everything is fine... 🔥`, 'toast-error');
  }
}

// DOM Elements
const dataCardElement = document.querySelector('[data-card]');
const searchForm = document.querySelector('[search-form]');
const cardNameElement = document.querySelector('[card-name]');
const cardImgElement = document.querySelector('[card-img]');
const notificationsElement = document.querySelector('[data-notifications]');
const toastElement = document.querySelector('[data-toast]');

// Data API
const requestURL = new URL('https://db.ygoprodeck.com/');
const prefixURL = 'api/v7/cardinfo.php';

// event listeners
searchForm.addEventListener('submit', handleFormSubmit);

async function handleFormSubmit(event) {
  event.preventDefault();
  const form = Object.fromEntries(new FormData(event.target));
  getAndDisplayCard(form.cardName.toLowerCase());
}

async function getAndDisplayCard(name) {
  notifyUser('Buscando...', 'toast-info');
  clearResults();
  clearNotifications();

    const card = await fetchFromAPI('name', name);

  console.log(card);

  if (card) {
    clearNotifications();
    displayCard(card);
  }
}

function displayCard(card) {
  cardNameElement.textContent = card.data[0].name;
  cardImgElement.setAttribute('src',
    card.data[0].card_images[0].image_url);
  cardImgElement.setAttribute('alt', card.data[0].name);
  cardImgElement.setAttribute('title', card.data[0].name);

  dataCardElement.classList.remove('hidden');
}

function clearResults() {
  dataCardElement.classList.add('hidden');
}

// Action FETCH

async function myFetch(...options) {
  const response = await fetch(...options);
  if (!response.ok) {
    throw new ResponseError('Ocurrió un error', response);
  }
  return response;
}

async function fetchFromAPI(resource, queryParams) {
  requestURL.pathname = `${prefixURL}`;
  requestURL.searchParams.set(`${resource}`, `${queryParams}`);
  let data = '';
  try {
    const response = await myFetch(requestURL);
    data = await response.json();
    return data;
  } catch (error) {
    handleError(error, queryParams);
  }
}

// Show notification

function notifyUser(message, typeClass) {
  notificationsElement.classList.add(typeClass);
  toastElement.textContent = message;
  notificationsElement.classList.remove('hidden');
}

function clearNotifications() {
  toastElement.textContent = '';
  notificationsElement.classList.remove('toast-info');
  notificationsElement.classList.remove('toast-error');
  notificationsElement.classList.add('hidden');
}