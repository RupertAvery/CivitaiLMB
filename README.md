# CivitAi Local Model Browser

This is a tool for locally searching and browsing a copy of the CivitAi Checkpoint and LORA JSON data downloaded through the CivitAi API as of May 5, 2025.

The scripts used to download, convert to SQLite, and the raw JSON and 7zipped SQLite database are available [here](https://drive.google.com/drive/folders/1jMbwb3HUcDNB2H6n1GXt2WKK-COpbdrQ)

The main use for this is to have an offline metadata viewer and alternate search tool since CivitAi is now hiding some models from search, although the model pages and downloads are still available.

An alternative to this is https://github.com/RemmyLee/civitr, also uses the same `models.db`.

## Screenshots

![image](https://github.com/user-attachments/assets/584e5071-59f9-455f-b612-18a113efb531)

![image](https://github.com/user-attachments/assets/fadb005d-242b-4477-a7f8-d9b64c067065)


## Instructions

1. Install Python 3.10 or later
2. Run `start.bat`

This will automatically install the necessary python packages (see `requirements.txt`) for running a standalone webserver.

It will then start the server at `localhost:8000`

The app will download `models.7z` from my Google Drive: https://drive.google.com/uc?id=1CBDBmaRa_85ohZ4Ok0tfAnQ8lbrQWph8 and decompress it (this will take up 2GB)

To change the port, edit `start.bat` and change the following line:

```
SET UVICORN_PORT=8000
```

## Development

* Install nodejs and npm, then run `npm install` in the frontend folder.  
* Run `npm run start` to start the development server with hot reload on `http://localhost:3000`
* Run `npm run build` to compile and pack to the `build/static` folder

## Local Deployment

After running `npm run build`, you will need to copy the following files and folders:

* `backend`
* `frontend/build/static`
* `requirements.txt`
* `start.bat`

You should preserve the path for `frontend/build/static`. Your directory structure should  be like this:

```
/backend
  main.py
  requirements.txt
/frontend
  /build
     /static
     ...
start.bat
```

