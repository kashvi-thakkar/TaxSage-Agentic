import { useEffect, useRef } from "react";
import googleDriveLogo from "../assets/google-drive.png";

export default function GoogleDrivePicker({ onPicked }) {
  const pickerInited = useRef(false);
  const gisInited = useRef(false);

  const tokenClient = useRef(null);
  const accessToken = useRef(null);

  useEffect(() => {
    loadPicker();
  }, []);

  const loadPicker = () => {
    window.gapi.load("picker", () => {
      pickerInited.current = true;
    });

    tokenClient.current =
      window.google.accounts.oauth2.initTokenClient({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,

        scope:
          "https://www.googleapis.com/auth/drive.readonly",

        callback: (response) => {
          accessToken.current = response.access_token;
          createPicker();
        },
      });

    gisInited.current = true;
  };

  const createPicker = () => {
    const view = new window.google.picker.DocsView(
      window.google.picker.ViewId.DOCS
    );

    view.setMimeTypes("application/pdf");

    const picker =
      new window.google.picker.PickerBuilder()
        .setDeveloperKey(
          process.env.REACT_APP_GOOGLE_API_KEY
        )
        .setAppId(
          process.env.REACT_APP_GOOGLE_APP_ID
        )
        .setOAuthToken(accessToken.current)
        .addView(view)
        .setCallback(pickerCallback)
        .build();

    picker.setVisible(true);
  };

  const pickerCallback = (data) => {
        if (
            data.action ===
            window.google.picker.Action.PICKED
        ) {
            const file = data.docs[0];
            onPicked({

                ...file,

                accessToken:
                    accessToken.current

            });
        }
    };

  const openPicker = () => {
    tokenClient.current.requestAccessToken();
  };

  return (
    <button className="bg-white border border-gray-300 rounded-lg px-6 py-3 w-full hover:bg-gray-50 flex items-center justify-center gap-2">
      <img
        src={googleDriveLogo}
        alt="Google Drive"
        className="w-5 h-5"
      />
      <span>Import from Google Drive</span>
    </button>
  );
}