// db.js: everything that talks to IndexedDB lives in this file.
// game.js calls these functions. YOU write them.
// Each one throws "not built yet" until you replace that line with your code.
// Your packet's DATA SPEC says WHAT every record holds. Spell every name EXACTLY
// like the spec, so your teacher can open DevTools and find everything.

const DB_NAME = "questDB";
const DB_VERSION = 2;

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

    if (!db.objectStoreNames.contains("journal")) {
      db.createObjectStore("journal",{
        keyPath: "id",
        autoIncrement: true
      });
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
  const hero = {
    name: name,
    heroClass: heroClass,
    level: 1,
    xp: 0,
    hp: 100,
    maxHp: 100,
    gold: 0,
    attributes: attributes,
    createdAt: new Date().toISOString()
  };

  const db = await openDB();
  const store = db.transaction("heroes", "readwrite").objectStore("heroes");

  await promisify(store.add(hero));

  return hero;
}

// name: a hero's name. Gives back that hero's record (or undefined).
async function getHero(name) {
  const db = await openDB();
  const store = db.transaction("heroes").objectStore("heroes");

  return promisify(store.get(name));
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
  const db = await openDB();
  const store = db.transaction("heroes", "readwrite").objectStore("heroes");

  return promisify(store.put(hero));
}

// ---------- Level 2: Inventory ----------
// heroName: whose bag. item: one object from ITEMS in data.js, like
//   { itemId: "healing-potion", name: "Healing Potion", type: "potion", icon: "🧪" }
// Not in that hero's bag yet? Save it with qty 1. Already there? Add 1 to qty.
async function addItem(heroName, item) {
  const db = await openDB();
const store = db.transaction("inventory", "readwrite").objectStore("inventory");

const id = heroName + "-" + item.itemId;
const existingItem = await promisify(store.get(id));

if(existingItem) {
    existingItem.qty = existingItem.qty + 1;
    await promisify(store.put(existingItem));
  } else {
    await promisify(store.add({
      id: id,
      hero: heroName,
      itemId: item.itemId,
      name: item.name,
      type: item.type,
      icon: item.icon,
      qty: 1,
    }));
  }
}

// heroName: whose bag. Gives back ONLY that hero's items.
async function getInventory(heroName) {
  const db = await openDB();
  const store = db.transaction("inventory").objectStore("inventory");

  const items = await promisify(store.getAll());

  return items.filter(item => item.hero === heroName);
}

// heroName: whose bag. itemId: which item, like "healing-potion".
// Takes 1 away from qty. At 0, the item leaves the bag.
async function removeItem(heroName, itemId) {
  const db = await openDB();
  const store = db.transaction("inventory", "readwrite").objectStore("inventory");

  const id = heroName + "-" + itemId;
  const item = await promisify(store.get(id));

  if(!item) return;

  item.qty = item.qty - 1;

  if (item.qty <  1){
    await promisify(store.delete(id));
  } else {
    await promisify(store.put(item));
  }
    
}

// ---------- Level 2: Powers ----------
// heroName: who learns it. power: one object from a class's powers in data.js, like
//   { powerId: "magic-missile", name: "Magic Missile", description: "...", learnAt: 1 }
// Saves that the hero knows this power.
async function learnPower(heroName, power) {
  const db = await openDB();
  const store = db.transaction("powers", "readwrite").objectStore("powers");

  const id = heroName + "-" + power.powerId;

  const powerRecord = {
    id: id,
    hero: heroName,
    powerId: power.powerId,
    name: power.name,
    description: power.description,
    learnAt: power.learnAt
  };

  await promisify(store.put(powerRecord));
}

// heroName: whose powers. Gives back ONLY that hero's powers.
async function getPowers(heroName) {
  const db = await openDB();
  const store = db.transaction("powers").objectStore("powers");

  const items = await promisify(store.getAll());

  return items.filter(item => item.hero === heroName);
}

// ---------- Level 2: Delete ----------
// name: a hero's name. Removes the hero AND everything that belongs to them
// (their items and powers, and at Level 3, their journal too).
async function deleteHero(name) {
  const db = await openDB();

  const transaction = db.transaction(
    ["heroes", "inventory", "powers"],
    "readwrite"
  );

  const heroStore = transaction.objectStore("heroes");
  const inventoryStore = transaction.objectStore("inventory");
  const powerStore = transaction.objectStore("powers");

  const inventoryRequest = inventoryStore.getAll();

  inventoryRequest.onsuccess = () => {
    const items = inventoryRequest.result;

    items.forEach((item) => {
      if (item.hero === name) {
        inventoryStore.delete(item.id);
      }
    });
  };

  const powersRequest = powerStore.getAll();

  powersRequest.onsuccess = () => {
    const powers = powersRequest.result;

    powers.forEach((power) => {
      if (power.hero === name) {
        powerStore.delete(power.id);
      }
    });
  };

  heroStore.delete(name);
}

// ---------- Level 3: Adventure journal (version 2) ----------
// heroName: whose journal. text: what happened, like "Beat a Goblin. +30 XP".
// Saves a new journal entry.
async function addJournal(heroName, text) {
  const db = await openDB();
  const store = db.transaction("journal", "readwrite").objectStore("journal");

  const entry = {
    hero: heroName,
    text: text,
    createdAt: new Date().toISOString()
  };

  await promisify(store.add(entry));
}

// heroName: whose journal. Gives back ONLY that hero's entries, newest first.
async function getJournal(heroName) {
  const db = await openDB();
  const store = db.transaction("journal").objectStore("journal");

  const entries = await promisify(store.getAll());

  return entries
    .filter(entry => entry.hero === heroName)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}