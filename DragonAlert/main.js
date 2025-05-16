import settings from './settings';

const RARITY_CATEGORIES = {
    common: ["Sharpened Claws", "Hardened Scale", "Aspect of the Dragons", "Dragon Claw", "Dragon Scale", "Necromancer's Brooch"],
    rare: ["[Lvl 100] Sheep", "[Lvl 100] Tiger", "Crown of Greed", "Pure Seeds", "Opticsl Lens", "Spirit Stone"],
    epic: ["[Lvl 100] Black Cat", "Mythic Carrot", "Suspicious Vial", "Textbook", "Dragon Horn", "Golden Hot Potato Book", "Midas Jewel", "Mysterious Handle"],
    legendary: ["Lucky Clover", "Golden Gun", "Necron’s Aegis", "Storm's Wand", "[Lvl 100] Ender Dragon", "Recombobulator 3000", "Golden Droplet", "Golden Egg"]
};

let lastAlerted = {};
const COOLDOWN_MS = 2000;

let displayDropName = null;
let displayDropColor = null;
let displayUntil = 0;

register('chat', (event) => {
    const message = ChatLib.getChatMessage(event).removeFormatting();
    if (message.includes("DRAGON DOWN!")) {
        const type = message.split(' ')[0];
        if (settings.debugMode) ChatLib.chat(`§8[DEBUG] Detected §6${type} §rDRAGON DOWN! Scanning for drops...`);
        setTimeout(() => {
            let foundDrop = false;
            World.getAllEntities().forEach(entity => {
                if (!entity || !entity.getName()) return;
                const name = entity.getName().removeFormatting();
                Object.entries(RARITY_CATEGORIES).forEach(([category, drops]) => {
                    if (!settings[category]) return;
                    drops.forEach(dropName => {
                        if (name.includes(dropName)) {
                            const now = Date.now();
                            if (!lastAlerted[dropName] || now - lastAlerted[dropName] > COOLDOWN_MS) {
                                ChatLib.chat(`§5[§6DROP ALERT§5] §d${dropName}`);
                                World.playSound("random.orb", 1, 1);
                                displayDropName = dropName;
                                displayDropColor = "§d";
                                displayUntil = Date.now() + 3000;
                                lastAlerted[dropName] = now;
                                foundDrop = true;
                            }
                        }
                    });
                });
            });
            if (settings.debugMode && !foundDrop) ChatLib.chat("§8[DEBUG] No rare drops found.");
        }, 1000);
    }
});

register("chat", (message) => {
    if (!settings.FrozenFragment) return;
    if (message.removeFormatting().startsWith("You got a frozen fragment!")) {
        World.playSound("random.orb", 1, 1);
        displayDropName = "Frozen Fragment";
        displayDropColor = "§9";
        displayUntil = Date.now() + 3000;
        ChatLib.chat("§5[§6DROP ALERT§5] §9Frozen Fragment");
    }
}).setCriteria("${message}");

register("renderOverlay", () => {
    if (!settings.displayAlertsOnScreen || !displayDropName || Date.now() >= displayUntil) return;
    const text = displayDropColor + displayDropName;
    const textWidth = Renderer.getStringWidth(displayDropName) * 3;
    const screenWidth = Renderer.screen.getWidth();
    const screenHeight = Renderer.screen.getHeight();
    Renderer.scale(3);
    Renderer.drawStringWithShadow(text, (screenWidth / 6) - (textWidth / 2 / 3), (screenHeight / 6) - 5);
});

let lastSettingsState = {
    debugMode: settings.debugMode,
    common: settings.common,
    rare: settings.rare,
    epic: settings.epic,
    legendary: settings.legendary,
    FrozenFragment: settings.FrozenFragment,
    displayAlertsOnScreen: settings.displayAlertsOnScreen
};

register("tick", () => {
    Object.keys(lastSettingsState).forEach(key => {
        if (lastSettingsState[key] !== settings[key]) {
            lastSettingsState[key] = settings[key];
            const status = settings[key] ? "§aENABLED" : "§cDISABLED";
            const prettyName = key === "debugMode" ? "Debug Mode" :
                               key === "FrozenFragment" ? "Frozen Fragment Alerts" :
                               key === "displayAlertsOnScreen" ? "Screen Alerts" :
                               key.charAt(0).toUpperCase() + key.slice(1) + " Alerts";
            ChatLib.chat(`§9[§dDragonAlert§9] §f${prettyName} is now ${status}`);
        }
    });
});

register("command", () => {
    settings.openGUI();
}).setName("rda");

register('chat', (event) => {
    const message = ChatLib.getChatMessage(event).removeFormatting();
    if (message.includes("You are not required to pass the captcha.")) {
        ChatLib.chat("§9[§dDragonAlert§9] §fTo open settings GUI, type §a/rda");
    }
});
