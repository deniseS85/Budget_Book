const fs = require('fs');
const path = require('path');

class DataService {
    
    constructor() {
        this.dataPath = path.join(__dirname, '../../data.json');
    }

    loadData () {
        try {
            if (!fs.existsSync(this.dataPath)) {
                fs.writeFileSync(this.dataPath, JSON.stringify({ income: [], expenses: [] }));
            }
            const rawData = fs.readFileSync(this.dataPath);
            return JSON.parse(rawData);
        } catch (err) {
            console.error("Fehler beim Laden der Daten:", err);
            return { income: [], expenses: [] };
        }
    }

    saveData(data) {
        try {
            fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2));
        } catch (err) {
            console.error("Fehler beim Speichern der Daten:", err);
        }
    }
}

module.exports = new DataService();
