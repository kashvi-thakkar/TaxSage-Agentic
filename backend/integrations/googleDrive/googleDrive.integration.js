const { google } = require("googleapis");

class GoogleDriveIntegration {

    constructor() {

        this.oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

    }

    getAuthUrl() {

        return this.oauth2Client.generateAuthUrl({

            access_type: "offline",

            scope: [
                "https://www.googleapis.com/auth/drive.readonly"
            ]

        });

    }

    async getToken(code) {

        const { tokens } =
            await this.oauth2Client.getToken(code);

        this.oauth2Client.setCredentials(tokens);

        return tokens;

    }

    getClient() {

        return this.oauth2Client;

    }

    async listPdfFiles() {

        const drive = google.drive({

            version: "v3",

            auth: this.oauth2Client

        });

        const response =
            await drive.files.list({

                q: "mimeType='application/pdf'",

                fields:
                    "files(id,name,createdTime,size)"

            });

        return response.data.files;

    }

    async downloadFile(fileId, accessToken) {

    const oauth2Client = new google.auth.OAuth2();

    oauth2Client.setCredentials({

        access_token: accessToken

    });

    const drive = google.drive({

            version: "v3",

            auth: oauth2Client

        });

        const response = await drive.files.get(

            {
                fileId,
                alt: "media"
            },

            {
                responseType: "arraybuffer"
            }

        );

        return response.data;

    }

}

module.exports = new GoogleDriveIntegration();