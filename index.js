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
  getAndDisplayCard(form.cardName.toLowerCase(), form.search);
}

async function getAndDisplayCard(name, search) {
  notifyUser('Buscando...', 'toast-info');
  clearResults();
  clearNotifications();

  let card;
  switch (search) {
    case 'oneCard':
      card = await fetchFromAPI('name', name);
      break;
    case 'similarCard':
      card = await fetchFromAPI('fname', name);
      break;
    case 'archetype':
      card = await fetchFromAPI('archetype', name);
      break;
    default:
      card = await fetchFromAPI('', '');
      break;
  }

  if (card) {
    clearNotifications();
    displayCard(card);
  }
}

function displayCard(card) {
  card.data.forEach(element => {
    const divCardData = document.createElement('div');
    divCardData.classList.add('card_info');

    const pCardData = document.createElement('p');
    pCardData.textContent = element.name;

    const imgCardData = document.createElement('img');
    imgCardData.setAttribute('src',
    element.card_images[0].image_url);
    imgCardData.setAttribute('alt', element.name);
    imgCardData.setAttribute('title', element.name);

    divCardData.appendChild(pCardData);
    divCardData.appendChild(imgCardData);

    dataCardElement.appendChild(divCardData);
    
    dataCardElement.classList.remove('hidden');
  });
}

function clearResults() {
  dataCardElement.classList.add('hidden');
  while(dataCardElement.firstChild) {
    dataCardElement.removeChild(dataCardElement.firstChild);
  }
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
  requestURL.searchParams.delete('name');
  requestURL.searchParams.delete('fname');
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