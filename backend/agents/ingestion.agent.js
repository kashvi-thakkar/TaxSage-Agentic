const { parseForm16 } = require("../services/form16.service");

class IngestionAgent {

    async ingest(options) {

        switch (options.source) {

            case "local":

                return await this.fromLocal(
                    options.filePath
                );

            case "google_drive":

                return await this.fromGoogleDrive(
                    options.fileId
                );

            case "sharepoint":

                return await this.fromSharePoint(
                    options.fileId
                );

            default:

                throw new Error(
                    "Unsupported document source."
                );

        }

    }

    async fromLocal(filePath) {

        console.log("📄 Local Upload");

        return await parseForm16(filePath);

    }

    async fromGoogleDrive(fileId) {

        throw new Error(
            "Google Drive not implemented yet."
        );

    }

    async fromSharePoint(fileId) {

        throw new Error(
            "SharePoint not implemented yet."
        );

    }

}

module.exports = new IngestionAgent();