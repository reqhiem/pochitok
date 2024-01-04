# import os
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import uuid
from google.cloud import firestore
from google.cloud import storage

firestone_client = firestore.Client(
    project="podchy-407107",
    database="pochitok-firebase",
)

storage_client = storage.Client(
    project="podchy-407107",
)

origins = [
    "http://localhost:5173",
]


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

VIDEO_BUCKET_URL = "https://storage.googleapis.com/bucket-video-407107/"
THUMBNAIL_BUCKET_URL = "https://storage.googleapis.com/bucket-thumbnail-407107/"


@app.get("/")
async def root():
    query = (
        firestone_client.collection("uploaded-videos")
        .where("status", "==", "ready")
        .stream()
    )

    data = []

    for doc in query:
        doct_dict = doc.to_dict()
        vid = doct_dict["file_name"].split(".")[0]
        doct_dict["source"] = f"{VIDEO_BUCKET_URL}{doct_dict['file_name']}"
        doct_dict["vid"] = vid
        doct_dict["labels"] = []

        # Get the labels from the pochitok-videos collection
        pochitok_video = (
            firestone_client.collection(
                "pochitok-videos",
            )
            .where(
                "vid",
                "==",
                f"{vid}.mp4",
            )
            .stream()
        )

        for doc in pochitok_video:
            pochitok_video_doc = doc.to_dict()
            label = pochitok_video_doc["label"]
            doct_dict["labels"].append(label)

        if len(doct_dict["labels"]) > 0:
            first_label = doct_dict["labels"][0]
            doct_dict[
                "thumbnail"
            ] = f"{THUMBNAIL_BUCKET_URL}{vid}_{first_label}_thumbnail.jpg"

        data.append(doct_dict)

    return {
        "status": 200,
        "data": data,
    }


@app.get("/search/")
async def search(query: str):
    fs_query = (
        firestone_client.collection(
            "pochitok-videos",
        )
        .where(
            "label",
            ">=",
            query,
        )
        .where(
            "label",
            "<=",
            query + "\uf8ff",
        )
    ).stream()

    data = []

    for doc in fs_query:
        label_doc = doc.to_dict()

        vid = label_doc["vid"].split(".")[0]
        label = label_doc["label"]
        thumbnail = f"{THUMBNAIL_BUCKET_URL}{vid}_{label}_thumbnail.jpg"

        label_doc["vid"] = vid
        label_doc["source"] = f"{VIDEO_BUCKET_URL}{label_doc['vid']}.mp4"
        label_doc["thumbnail"] = thumbnail

        # Get the title from the uploaded-videos collection
        uploaded_video = firestone_client.collection(
            "uploaded-videos",
        ).document(
            vid,
        )
        uploaded_video = uploaded_video.get()
        uploaded_video = uploaded_video.to_dict()

        label_doc["title"] = uploaded_video["title"]

        # additonal labels associated with the video
        label_doc["labels"] = []

        # Get the labels from the pochitok-videos collection
        pochitok_video = (
            firestone_client.collection(
                "pochitok-videos",
            )
            .where(
                "vid",
                "==",
                f"{vid}.mp4",
            )
            .stream()
        )

        for doc in pochitok_video:
            pochitok_video_doc = doc.to_dict()
            label = pochitok_video_doc["label"]
            label_doc["labels"].append(label)

        data.append(label_doc)

    sorted_data = sorted(data, key=lambda k: k["occurrence"], reverse=True)

    return {
        "status": 200,
        "data": sorted_data,
    }


@app.post("/upload")
async def upload(file: UploadFile = File(...), title: str = Form(...)):
    contents = await file.read()
    vid = str(uuid.uuid1())

    # Handle the uploaded file (save with the UUID and extension)
    # in a GCS bucket
    file_name = f"{vid}.mp4"

    # Save the file name and title to the database
    firestone_client.collection("uploaded-videos").document(vid).set(
        {
            "title": title,
            "file_name": file_name,
            "status": "processing",
        }
    )

    blob = storage_client.bucket("bucket-video-407107").blob(file_name)
    blob.upload_from_string(contents, content_type="video/mp4")

    # Return the filename and title
    return {
        "status": 200,
        "data": {
            "file_name": file_name,
            "title": title,
        },
    }
