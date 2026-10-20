// db.js: everything that talks to IndexedDB lives in this file.
// game.js calls these functions. YOU write them.
// Each one throws "not built yet" until you replace that line with your code.
// Your packet's DATA SPEC says WHAT every record holds. Spell every name EXACTLY
// like the spec, so your teacher can open DevTools and find everything.

const DB_NAME = "questDB";
const DB_VERSION = 1;

// ALREADY DONE: wraps an IndexedDB request in a promise so you can use await.
function promisify(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ---------- Level 1: Open the database ----------
// Opens questDB. Version 1 has three stores: "heroes", "inventory", and "powers".
// Gives back (a promise for) the open database.
function openDB(){
  const request = indexedDB.open(DB_NAME, DB_VERSION);

  request.onupgradeneeded = () => {
    const db = request.result;

    if (!db.objectStoreNames.contains("heroes")) {
      db.createObjectStore("heroes", {keyPath: "name"});
    }

    if (!db.objectStoreNames.contains("inventory")) {
      db.createObjectStore("inventory", {keyPath: "id"});
    }

    if (!db.objectStoreNames.contains("powers")) {
      db.createObjectStore("powers", {keyPath: "id"});
    }
  };

  return promisify(request);
}

// ---------- Level 1: Heroes ----------
// name: like "Ana". heroClass: "fighter", "rogue", "wizard", or "cleric".
// attributes: { strength: 15, dexterity: 12, constitution: 14, intelligence: 8, wisdom: 10, charisma: 13 }
// Build a NEW hero record (see the DATA SPEC) and save it. Give back the record.
// A name that is already taken should fail, not replace the old hero.
async function createHero(name, heroClass, attributes) {
  throw new Error("createHero() is not built yet (Level 1)");
}

// name: a hero's name. Gives back that hero's record (or undefined).
async function getHero(name) {
  const db = await openDB();
  const store = db.transaction("cart", "readwrite").objectStore("cart");

  const item = await promisify(store.get(name.id));

  if(item) {
    item.qty = item.qty + 1;
    await promisify(store.put(item));
  } else {
    await promisify(store.add({
      id: name.id,
      name: name.name,
      price: name.price,
      emoji: name.emoji,
      qty: 1,
    }));
  }
}

// Gives back an array of every hero record.
async function getAllHeroes() {
  const db = await openDB();
  const store = db.transaction("heroes").objectStore("heroes");
  // no mode = "readonly"
  return promisify(store.getAll());
}

// hero: a hero record that game.js changed (new hp, xp, level, or gold).
// Save it over the old one.
async function updateHero(hero) {
  throw new Error("updateHero() is not built yet (Level 1)");
}

// ---------- Level 2: Inventory ----------
// heroName: whose bag. item: one object from ITEMS in data.js, like
//   { itemId: "healing-potion", name: "Healing Potion", type: "potion", icon: "🧪" }
// Not in that hero's bag yet? Save it with qty 1. Already there? Add 1 to qty.
async function addItem(heroName, item) {
  throw new Error("addItem() is not built yet (Level 2)");
}

// heroName: whose bag. Gives back ONLY that hero's items.
async function getInventory(heroName) {
  throw new Error("getInventory() is not built yet (Level 2)");
}

// heroName: whose bag. itemId: which item, like "healing-potion".
// Takes 1 away from qty. At 0, the item leaves the bag.
async function removeItem(heroName, itemId) {
  throw new Error("removeItem() is not built yet (Level 2)");
}

// ---------- Level 2: Powers ----------
// heroName: who learns it. power: one object from a class's powers in data.js, like
//   { powerId: "magic-missile", name: "Magic Missile", description: "...", learnAt: 1 }
// Saves that the hero knows this power.
async function learnPower(heroName, power) {
  throw new Error("learnPower() is not built yet (Level 2)");
}

// heroName: whose powers. Gives back ONLY that hero's powers.
async function getPowers(heroName) {
  throw new Error("getPowers() is not built yet (Level 2)");
}

// ---------- Level 2: Delete ----------
// name: a hero's name. Removes the hero AND everything that belongs to them
// (their items and powers, and at Level 3, their journal too).
async function deleteHero(name) {
  throw new Error("deleteHero() is not built yet (Level 2)");
}

// ---------- Level 3: Adventure journal (version 2) ----------
// heroName: whose journal. text: what happened, like "Beat a Goblin. +30 XP".
// Saves a new journal entry.
async function addJournal(heroName, text) {
  throw new Error("addJournal() is not built yet (Level 3)");
}

// heroName: whose journal. Gives back ONLY that hero's entries, newest first.
async function getJournal(heroName) {
  throw new Error("getJournal() is not built yet (Level 3)");
}
