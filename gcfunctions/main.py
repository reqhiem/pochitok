import functions_framework

from google.cloud import storage
from google.cloud import firestore

import os
import subprocess

import cv2

YOLO_BUCKET_NAME = 'bucket-yolo-407107'
YOLO_FILES = [
    'cfg/coco.data',
    'cfg/yolov3.cfg',
    'darknet',
    'data/coco.names',
    'data/labels/', # folder
    'yolov3.weights',
]

def acquire_yolo_model(client, dest):
    bucket = client.get_bucket(YOLO_BUCKET_NAME)
    for yolo_file in YOLO_FILES:
        if yolo_file.endswith('/'):
            blobs = client.list_blobs(YOLO_BUCKET_NAME, prefix=yolo_file)
            os.makedirs(yolo_file, exist_ok=True)
            for blob in blobs:
                blob.download_to_filename(f'{dest}/{blob.name}')
        else:
            blob = bucket.blob(yolo_file)
            folder = os.path.dirname(blob.name)
            if folder:
                os.makedirs(folder, exist_ok=True)
            blob.download_to_filename(f'{dest}/{blob.name}')
    subprocess.run('chmod +x darknet', shell=True)

def acquire_video(client, data):
    bucket = client.get_bucket(data['bucket'])
    blob = bucket.blob(data['name'])
    blob.download_to_filename(blob.name)
    return blob.name

def get_frame_labels(image):
    cv2.imwrite('sample_frame.jpg', image)

    yolo_command = f'./darknet detect cfg/yolov3.cfg yolov3.weights sample_frame.jpg -dont_show -thresh 0.6 2>/dev/null'
    output = subprocess.check_output(yolo_command, shell=True, text=True)

    prediction_results = {}
    for line in output.strip().split('\n'):
        if line.strip().endswith('%'):
            parts = line.split(':')
            label = parts[0].strip()
            confidence = int(parts[1].replace('%', '').strip())
    
            if label not in prediction_results:
                prediction_results[label] = { 'confidence': confidence, 'occurrence': 1 }
            else:
                prediction_results[label]['occurrence'] += 1
                prediction_results[label]['confidence'] = max(prediction_results[label]['confidence'], confidence)

    return prediction_results

# Triggered by a change in a storage bucket
@functions_framework.cloud_event
def main(cloud_event):
    storage_client = storage.Client()
    acquire_yolo_model(storage_client, '.')

    data = cloud_event.data
    video = acquire_video(storage_client, data)

    cap = cv2.VideoCapture(video)
    if not cap.isOpened():
        print("Error al abrir el video")

    fps = cap.get(5)
    frame_count = cap.get(7)

    SAMPLE_RATE = 10

    print(f"Frames per second: {fps} FPS")
    print(f"Frame count: {frame_count}")

    count = 0
    video_labels = {}
    while cap.isOpened():
        ret, frame = cap.read()

        if not ret:
            break

        count += 1
        if count % int(SAMPLE_RATE * fps) == 0:
            print(count)
            # Get labels
            frame_labels = get_frame_labels(frame)
            # Index labels
            for label in frame_labels.keys():
                if label in video_labels:
                    if video_labels[label]["confidence"] < frame_labels[label]["confidence"]:
                        video_labels[label]["confidence"] = frame_labels[label]["confidence"]
                        video_labels[label]["image"] = frame
                    video_labels[label]["occurrence"] += frame_labels[label]["occurrence"]
                else:
                    video_labels[label] = {
                        "confidence": frame_labels[label]["confidence"],
                        "image": frame,
                        "occurrence": 1
                    }
    cap.release()

    db = firestore.Client(project="podchy-407107", database="pochitok-firebase")
    bucket = storage_client.bucket('bucket-thumbnail-407107')
    for label in video_labels.keys():
        filename, _ = data['name'].split('.')
        thumbnail_name = f'{filename}_{label}_thumbnail.jpg'

        # Creating thumbnail
        blob = bucket.blob(thumbnail_name)
        cv2.imwrite(thumbnail_name, video_labels[label]['image'])
        blob.upload_from_filename(thumbnail_name)

        # Indexing to firestore
        db.collection('pochitok-videos').add({
            'vid': filename,
            'label': label,
            'occurrence': video_labels[label]['occurrence']
        })
