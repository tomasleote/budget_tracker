import {
  faUtensils,
  faCar,
  faShoppingBag,
  faHome,
  faFilm,
  faHospital,
  faGraduationCap,
  faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';

const ICON_MAP = {
  'food & dining': faUtensils,
  'food': faUtensils,
  'dining': faUtensils,
  'restaurants': faUtensils,
  'transportation': faCar,
  'car': faCar,
  'gas': faCar,
  'shopping': faShoppingBag,
  'store': faShoppingBag,
  'clothes': faShoppingBag,
  'home': faHome,
  'house': faHome,
  'entertainment': faFilm,
  'movies': faFilm,
  'games': faFilm,
  'healthcare': faHospital,
  'medical': faHospital,
  'doctor': faHospital,
  'education': faGraduationCap,
  'school': faGraduationCap,
  'books': faGraduationCap
};

export function getCategoryIcon(categoryName) {
  const category = (categoryName || '').toLowerCase();
  const match = Object.keys(ICON_MAP).find(key => category.includes(key));
  return match ? ICON_MAP[match] : faQuestionCircle;
}
