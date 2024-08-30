import * as fs from "node:fs/promises";
import { stringify } from "csv-stringify";

export interface DownloadFile {
    link: string;
    type: string;
    size: number;
    startTime: string;
}

export interface LoadTracker {
    duration: number;
    size: number;
    files: Array<DownloadFile>;
}

export class DownloadReport {
    firstLoad: LoadTracker;
    totalLoad: LoadTracker;

    constructor() {
        this.firstLoad = { duration: 0, size: 0, files: [] };
        this.totalLoad = { duration: 0, size: 0, files: [] };
    }

    addFirstLoad(load: LoadTracker) {
        this.firstLoad = { duration: load.duration, size: load.size, files: [...load.files] };
    }

    addTotalLoad(load: LoadTracker) {
        this.totalLoad = { duration: load.duration, size: load.size, files: [...load.files] };
    }

    async saveCSV() {
        console.log("Preparing CSV files....");
        await this.writeCSV("firstload", this.firstLoad.files);
        await this.writeCSV("total", this.totalLoad.files);
    }

    async writeCSV(fileName: string, files: Array<DownloadFile>) {
        let columns = {
            link: "link",
            type: "type",
            size: "size",
            startTime: "startTime",
        };

        stringify(files, { header: true, columns: columns }, async (err, output) => {
            if (err) throw err;

            await fs.writeFile(`./test-results/${fileName}.csv`, output);
        });
    }

    async summarize() {
        const summary = {
            firstLoad: { duration: this.firstLoad.duration, packageSize: this.convertToMb(this.firstLoad.size) },
            totalLoad: { duration: this.totalLoad.duration, packageSize: this.convertToMb(this.totalLoad.size) },
        };

        await fs.writeFile(`./test-results/summary.json`, JSON.stringify(summary));
    }

    convertToMb(size: number) {
        return size / 1000 / 1000;
    }
}
