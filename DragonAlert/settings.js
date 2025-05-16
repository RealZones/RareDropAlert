import { @Vigilant, @SwitchProperty } from 'Vigilance';

@Vigilant("raredropalerts", "RareDropAlerts", {
    getCategoryComparator: () => (a, b) => {
        const order = ["Alerts"];
        return order.indexOf(a.name) - order.indexOf(b.name);
    }
})
class Settings {
    @SwitchProperty({
        name: "Enable Debug Mode",
        description: "Toggle debug chat output",
        category: "Alerts"
    })
    debugMode = false;

    @SwitchProperty({
        name: "Common Alerts",
        description: "Notify on common drops",
        category: "Alerts"
    })
    common = true;

    @SwitchProperty({
        name: "Rare Alerts",
        description: "Notify on rare drops",
        category: "Alerts"
    })
    rare = true;

    @SwitchProperty({
        name: "Epic Alerts",
        description: "Notify on epic drops",
        category: "Alerts"
    })
    epic = true;

    @SwitchProperty({
        name: "Legendary Alerts",
        description: "Notify on legendary drops",
        category: "Alerts"
    })
    legendary = true;

    @SwitchProperty({
        name: "Frozen Fragment Alerts",
        description: "Notify on frozen fragments",
        category: "Alerts"
    })
    FrozenFragment = true;

    @SwitchProperty({
        name: "Show Alerts On Screen",
        description: "Toggles overlay text when a drop is found",
        category: "Alerts"
    })
    displayAlertsOnScreen = true;

    constructor() {
        this.initialize(this);
    }
}

export default new Settings();
