const RARITY_CATEGORIES = {
    common: [
        "Sharpened Claws", "Hardened Scale", "Rapid Cannon", "Fierce Feather",
        "Aspect of the Dragons", "Dragon Claw", "Dragon Scale", "Necromancer's Brooch"
    ],
    rare: [
        "Tiger Pet", "Black Cat", "Mythic Carrot", "Suspicious Vial", "Textbook",
        "Dragon Horn", "Crown Of Greed", "Sheep Pet"
    ],
    legendary: [
        "Lucky Clover", "Golden Gun",
        "Necron’s Aegis", "Storm's Wand", "[Lvl 100] Ender Dragon"
    ]
};

const guiKey = new KeyBind("Open Dragon GUI", Keyboard.KEY_G, "Dragon Alert");

let enabledCategories = {
    common: true,
    rare: true,
    legendary: true
};

let debugMode = true;
let lastAlerted = {};
const COOLDOWN_MS = 2000;

let displayDropName = null;
let displayDropColor = null;
let displayUntil = 0;

register("command", () => {
    debugMode = !debugMode;
    ChatLib.chat(`§9[§dDragonAlert§9] §fDebug mode is now ${debugMode ? "§aON" : "§cOFF"}`);
}).setName("dragdebug");

register('chat', (event) => {
    const message = ChatLib.getChatMessage(event).removeFormatting();

    if (message.includes("You are not required to pass the captcha.")) {
        ChatLib.chat("§9[§dRareDropAlerts§9] §fTo open/close the GUI, type §a/rda");
    }
}); // <-- Added closing brace here

register('chat', (event) => {
    const message = ChatLib.getChatMessage(event).removeFormatting();

    if (message.includes("DRAGON DOWN!")) {
        const type = message.split(' ')[0];

        if (debugMode) ChatLib.chat(`§8[DEBUG] Detected §6${type} §rDRAGON DOWN! Scanning for drops...`);

        setTimeout(() => {
            let foundDrop = false;

            World.getAllEntities().forEach(entity => {
                if (!entity || !entity.getName()) return;

                const name = entity.getName().removeFormatting();

                Object.entries(RARITY_CATEGORIES).forEach(([category, drops]) => {
                    if (!enabledCategories[category]) return;

                    drops.forEach(dropName => {
                        if (name === `1x ${dropName}`) {
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

            if (debugMode && !foundDrop) {
                ChatLib.chat(`§8[DEBUG] No rare drops found.`);
            }

        }, 1000);
    }
});

register('chat', (message) => {
    if (message.removeFormatting().startsWith("You got a frozen fragment!")) {
        World.playSound("random.orb", 1, 1);

        displayDropName = "Frozen Fragment";
        displayDropColor = "§9";
        displayUntil = Date.now() + 3000;

        ChatLib.chat(`§5[§6DROP ALERT§5] §9Frozen Fragment`);
    }
}).setCriteria("${message}");

register("renderOverlay", () => {
    if (displayDropName && Date.now() < displayUntil) {
        const text = `${displayDropColor}${displayDropName}`;
        const textWidth = Renderer.getStringWidth(displayDropName) * 3;
        const screenWidth = Renderer.screen.getWidth();
        const screenHeight = Renderer.screen.getHeight();

        Renderer.scale(3);
        Renderer.drawStringWithShadow(text, (screenWidth / 6) - (textWidth / 2 / 3), (screenHeight / 6) - 5);
    }
});

let guiOpen = false;

register("command", () => {
    guiOpen = !guiOpen;
    if (guiOpen) Client.hideCrosshair();
    else Client.showCrosshair();
}).setName("rda");

register("guiClosed", () => {
    if (guiOpen) {
        guiOpen = false;
        Client.showCrosshair();
    }
});

register("guiKey", (char, keyCode) => {
    if (!guiOpen) return;
    if (keyCode === 1 || keyCode === 18) {
        guiOpen = false;
        Client.showCrosshair();
        cancel();
    }
});

register("renderOverlay", () => {
    if (!guiOpen) return;

    const sw = Renderer.screen.getWidth();
    const sh = Renderer.screen.getHeight();

    const boxW = 250;
    const boxH = 220;
    const x = sw / 2 - boxW / 2;
    const y = sh / 2 - boxH / 2;

    const buttonW = 200;
    const buttonH = 25;
    const buttonX = sw / 2 - buttonW / 2;

    Renderer.drawRect(Renderer.color(0, 0, 0, 180), x, y, boxW, boxH);

    const title = "§d✧ Dragon Alert Menu ✧";
    Renderer.drawStringWithShadow(title, sw / 2 - Renderer.getStringWidth(title) / 2, y + 10);

    const options = [
        { label: `Debug Mode: ${debugMode ? "§aON" : "§cOFF"}` },
        { label: `Common: ${enabledCategories.common ? "§aENABLED" : "§cDISABLED"}` },
        { label: `Rare: ${enabledCategories.rare ? "§aENABLED" : "§cDISABLED"}` },
        { label: `Legendary: ${enabledCategories.legendary ? "§aENABLED" : "§cDISABLED"}` }
    ];

    options.forEach((opt, i) => {
        Renderer.drawRect(Renderer.color(60, 60, 60, 160), buttonX, y + 40 + i * (buttonH + 10), buttonW, buttonH);
        Renderer.drawStringWithShadow(opt.label, sw / 2 - Renderer.getStringWidth(opt.label) / 2, y + 48 + i * (buttonH + 10));
    });
});

register("clicked", (mx, my, button, isDown) => {
    if (!guiOpen || !isDown) return;

    const sw = Renderer.screen.getWidth();
    const sh = Renderer.screen.getHeight();
    const boxW = 250;
    const boxH = 220;
    const x = sw / 2 - boxW / 2;
    const y = sh / 2 - boxH / 2;
    const buttonW = 200;
    const buttonH = 25;
    const buttonX = sw / 2 - buttonW / 2;

    const inBounds = (bx, by, bw, bh) => mx >= bx && mx <= bx + bw && my >= by && my <= by + bh;

    if (inBounds(buttonX, y + 40, buttonW, buttonH)) {
        debugMode = !debugMode;
        World.playSound("random.click", 1, 1);
        ChatLib.chat(`§9[§dDragonAlert§9] §fDebug mode is now ${debugMode ? "§aON" : "§cOFF"}`);
    }

    const cats = ["common", "rare", "legendary"];
    cats.forEach((cat, i) => {
        if (inBounds(buttonX, y + 40 + (i + 1) * (buttonH + 10), buttonW, buttonH)) {
            enabledCategories[cat] = !enabledCategories[cat];
            World.playSound("random.click", 1, 1);
            ChatLib.chat(`§9[§dDragonAlert§9] §f${cat} alerts are now ${enabledCategories[cat] ? "§aENABLED" : "§cDISABLED"}`);
        }
    });
});

