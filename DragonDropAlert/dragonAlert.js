const RARE_DROPS = [
    "Sharpened Claws", "Hardened Scale", "Rapid Cannon", "Fierce Feather",
    "Aspect of the Dragons", "Dragon Claw", "Dragon Scale", "Necromancer's Brooch",
    "Tiger Pet", "Black Cat", "Mythic Carrot", "Suspicious Vial", "Textbook",
    "Dragon Horn", "Crown Of Greed", "Sheep Pet", "Lucky Clover", "Golden Gun",
    "Necron’s Aegis", "Storm's Wand", "[Lvl 10] Ender Dragon"
];

let debugMode = true;
let lastAlerted = {};
const COOLDOWN_MS = 2000;

let displayDropName = null;
let displayDropColor = "§d"; // default pink
let displayUntil = 0;

// Debug Toggle Command
register("command", () => {
    debugMode = !debugMode;
    ChatLib.chat(`§9[§dDragonAlert§9] §fDebug mode is now ${debugMode ? "§aON" : "§cOFF"}`);
}).setName("dragdebug").setAliases(["dragdebug"]);

// Dragon Down Detection
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

                RARE_DROPS.forEach(dropName => {
                    if (name === `1x ${dropName}`) {
                        const now = Date.now();
                        if (!lastAlerted[dropName] || now - lastAlerted[dropName] > COOLDOWN_MS) {
                            ChatLib.chat(`§5[§6DROP ALERT§5] §d${dropName}`);
                            World.playSound("random.orb", 1, 1);

                            displayDropName = dropName;
                            displayDropColor = "§d"; // Pink
                            displayUntil = now + 3000;

                            lastAlerted[dropName] = now;
                            foundDrop = true;
                        }
                    }
                });
            });

            if (debugMode && !foundDrop) {
                ChatLib.chat(`§8[DEBUG] No rare drops found.`);
            }

        }, 1000);
    }

    // Frozen Fragment Detection
    if (message.includes("You got a frozen fragment!")) {
        ChatLib.chat(`§5[§6DROP ALERT§5] §9Frozen Fragment`);
        World.playSound("random.orb", 1, 1);

        displayDropName = "Frozen Fragment";
        displayDropColor = "§9"; // Blue
        displayUntil = Date.now() + 3000;
    }
});

// Centered Drop Name Overlay
register("renderOverlay", () => {
    if (displayDropName && Date.now() < displayUntil) {
        const screenWidth = Renderer.screen.getWidth();
        const screenHeight = Renderer.screen.getHeight();
        const scale = 3;

        const dropText = `${displayDropColor}${displayDropName}`;
        const textWidth = Renderer.getStringWidth(dropText) * scale;

        Renderer.scale(scale);
        Renderer.drawStringWithShadow(dropText, (screenWidth / scale - textWidth / 2), (screenHeight / scale) / 2 - 4);
        Renderer.scale(1);
    }
});
