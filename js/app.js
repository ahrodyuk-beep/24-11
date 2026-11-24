'use strict';

const DEMO_MENU = [
  { name: 'Борщ український', category: 'Перша страва', description: '250 мл', price: 38, vegetarian: false, emoji: '🥣' },
  { name: 'Суп овочевий', category: 'Перша страва', description: '250 мл', price: 34, vegetarian: true, emoji: '🍲' },
  { name: 'Суп курячий', category: 'Перша страва', description: '250 мл', price: 46, vegetarian: false, emoji: '🥣' },
  { name: 'Котлета куряча', category: 'Основна страва', description: '120 г', price: 65, vegetarian: false, emoji: '🍗' },
  { name: 'Омлет', category: 'Основна страва', description: '150 г', price: 44, vegetarian: true, emoji: '🍳' },
  { name: 'Рис з овочами', category: 'Основна страва', description: '180 г', price: 52, vegetarian: true, emoji: '🍚' },
  { name: 'Картопляне пюре', category: 'Гарнір', description: '180 г', price: 32, vegetarian: true, emoji: '🥔' },
  { name: 'Гречка', category: 'Гарнір', description: '180 г', price: 28, vegetarian: true, emoji: '🌾' },
  { name: 'Салат овочевий', category: 'Салат', description: '120 г', price: 29, vegetarian: true, emoji: '🥗' },
  { name: 'Салат з куркою', category: 'Салат', description: '140 г', price: 58, vegetarian: false, emoji: '🥗' },
  { name: 'Компот ягідний', category: 'Напій', description: '200 мл', price: 18, vegetarian: true, emoji: '🫐' },
  { name: 'Чай', category: 'Напій', description: '200 мл', price: 12, vegetarian: true, emoji: '🍵' }
];

const loadButton = document.getElementById('loadMenuBtn');
const errorButton = document.getElementById('errorBtn');
const statusElement = document.getElementById('menuStatus');
const resultsElement = document.getElementById('menuResults');
const errorElement = document.getElementById('menuError');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const priceFilter = document.getElementById('priceFilter');
const vegetarianFilter = document.getElementById('vegetarianFilter');
const resetButton = document.getElementById('resetFiltersBtn');
const resultCount = document.getElementById('resultCount');

const controls = [searchInput, categoryFilter, priceFilter, vegetarianFilter, resetButton];

let isLoading = false;
let loadedMenu = [];

function fetchMenuDemo(shouldFail = false) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('Демонстраційна помилка отримання меню.'));
      } else {
        resolve(DEMO_MENU);
      }
    }, 1500);
  });
}

// 1. Функція малювання карток (з картинками-емодзі)
function renderMenu(items) {
  resultsElement.innerHTML = '';

  if (items.length === 0) {
    resultsElement.innerHTML = '<p class="muted">За вашим запитом страв не знайдено.</p>';
    return;
  }

  items.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'menu-card';
    card.innerHTML = `
      <div class="menu-emoji" aria-hidden="true">${item.emoji}</div>
      <h3>${item.name}</h3>
      <p class="muted">${item.description}</p>
      <p class="menu-price"><strong>${item.price} грн</strong></p>
    `;
    resultsElement.appendChild(card);
  });
}

// 2. Функція фільтрації (назва + категорія + ціна + вегетаріанське)
function applyFilters() {
  const query = searchInput.value.trim().toLowerCase();
  const selectedCategory = categoryFilter.value;
  const maxPrice = priceFilter.value;
  const onlyVegetarian = vegetarianFilter.checked;

  const filtered = loadedMenu.filter((item) => {
    const matchesName = item.name.toLowerCase().includes(query);
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesPrice = maxPrice === 'all' || item.price <= Number(maxPrice);
    const matchesVeg = !onlyVegetarian || item.vegetarian === true;

    return matchesName && matchesCategory && matchesPrice && matchesVeg;
  });

  renderMenu(filtered);
  resultCount.textContent = `Знайдено ${filtered.length} із ${loadedMenu.length} страв.`;
}

// 3. Асинхронне завантаження меню
async function handleLoadMenu(shouldFail = false) {
  if (isLoading) return;
  isLoading = true;

  loadButton.disabled = true;
  errorButton.disabled = true;
  controls.forEach((el) => (el.disabled = true));
  resultsElement.setAttribute('aria-busy', 'true');
  errorElement.hidden = true;
  resultsElement.innerHTML = '';
  statusElement.textContent = 'Завантаження меню...';

  try {
    const data = await fetchMenuDemo(shouldFail);
    loadedMenu = data;

    // Розблоковуємо пошук та фільтри
    controls.forEach((el) => (el.disabled = false));
    statusElement.textContent = `Готово! Завантажено ${loadedMenu.length} страв.`;
    applyFilters();
  } catch (err) {
    loadedMenu = [];
    errorElement.hidden = false;
    statusElement.textContent = 'Помилка завантаження меню.';
    resultCount.textContent = 'Завантажте меню, щоб почати пошук.';
  } finally {
    isLoading = false;
    loadButton.disabled = false;
    errorButton.disabled = false;
    resultsElement.setAttribute('aria-busy', 'false');
  }
}

// 4. Прив'язка всіх кнопок та фільтрів
loadButton.addEventListener('click', () => handleLoadMenu(false));
errorButton.addEventListener('click', () => handleLoadMenu(true));

searchInput.addEventListener('input', applyFilters);
categoryFilter.addEventListener('change', applyFilters);
priceFilter.addEventListener('change', applyFilters);
vegetarianFilter.addEventListener('change', applyFilters);

resetButton.addEventListener('click', () => {
  searchInput.value = '';
  categoryFilter.value = 'all';
  priceFilter.value = 'all';
  vegetarianFilter.checked = false;
  applyFilters();
});
