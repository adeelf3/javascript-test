import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'public', 'api');
const categories = ['keyboards', 'ducks', 'coffee', 'stickers'];
const names = {
  keyboards: ['Mechanical Keyboard', 'Compact Keyboard', 'Silent Keyboard', 'RGB Keyboard'],
  ducks: ['Debug Duck', 'Captain Duck', 'Rubber Duck', 'Senior Duck'],
  coffee: ['Dark Roast Beans', 'Cold Brew Kit', 'Developer Blend', 'Espresso Beans'],
  stickers: ['Ship It Pack', 'Git Commit Stickers', 'Code Review Set', 'Pixel Sticker Pack'],
};
const imageRoot = 'https://adeelf3.github.io/javascript-test/api/images';
const imageFiles = { keyboards: 'keyboard.webp', ducks: 'duck.svg', coffee: 'coffee.webp', stickers: 'stickers.webp' };

const items = Array.from({ length: 5000 }, (_, index) => {
  const category = categories[index % categories.length];
  return {
    id: `gear-${index + 1}`,
    name: `${names[category][Math.floor(index / 4) % 4]} ${index + 1}`,
    price: 799 + ((index * 137) % 15000),
    category,
    stock: index % 19 === 0 ? 0 : 1 + (index % 28),
    rating: Math.round((3.5 + (index % 16) / 10) * 10) / 10,
    imageUrl: `${imageRoot}/${imageFiles[category]}`,
  };
});

await mkdir(path.join(output, 'images'), { recursive: true });
await Promise.all(['keyboard.webp', 'duck.svg', 'coffee.webp', 'stickers.webp'].map(file =>
  copyFile(path.join(root, 'src', 'assets', file), path.join(output, 'images', file))));
await writeFile(path.join(output, 'products.json'), JSON.stringify({ total: items.length, items }));
await writeFile(path.join(output, 'categories.json'), JSON.stringify({ categories: categories.map(id => ({ id, count: items.filter(item => item.category === id).length })) }));
await writeFile(path.join(output, 'index.json'), JSON.stringify({
  name: 'The Bug Bazaar public mock data',
  mode: 'read-only static JSON',
  products: './products.json',
  categories: './categories.json',
}));
