import cv2
import sys
import os
import random
import numpy as np
import pandas as pd
from ultralytics import YOLO

FRAME_BEFORE_DETECT = 60 # 55
CENTER_DIF = 100 # 50

MIN_CONTOUR_AREA = 20000 # 2500

FRAME_FROM_START = 1300
FRAME_TO_END = 1900

def get_video_name(video_path : str):
    return video_path.split("\\")[-1].split(".")[0]


def predict_and_send(video_path : str, neural_path):
    model = YOLO(model=neural_path)

    cap = cv2.VideoCapture(video_path)
    frames_from_start = 0

    while (frames_from_start < FRAME_FROM_START):
        cap.read()
        frames_from_start += 1

    ret, frame = cap.read()
    if not ret:
        return (-1, "no detect", "0:00")

    (height, width) = frame.shape[:-1]

    while cap.isOpened():
        pred = model.predict(frame)
        if len(pred[0].boxes) > 0:
            for box in pred[0].boxes:
                data = box.data
                coff = round(float(data[0][4]), 2)
                name = pred[0].names[int(data[0][5])]
                full_name = name + f" {coff}"
                x1,y1,x2,y2 = np.array(box.xyxy[0], np.uint32)
                if (abs((width / 2) - ((x2 + x1) / 2)) < CENTER_DIF) and (abs((height / 2) - ((y2 + y1) / 2)) < CENTER_DIF) and ((abs(x2 - x1) * abs(y2 - y1)) > MIN_CONTOUR_AREA):
                    cv2.rectangle(frame, (x1,y1-35), (x1+len(full_name)*20, y1-5), (255,255,255), -1)
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (random.randint(0,255), random.randint(0,255), random.randint(0,255)), 2)
                    frame = cv2.putText(frame, full_name, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 3, cv2.LINE_AA)
                    print(get_video_name(video_path))
                    cv2.imwrite(f"{get_video_name(video_path)}.png", frame)
                    return (1, name, convert_sec_to_min(int(frames_from_start / 12)))

        cap.read()
        cap.read()
        cap.read()
        cap.read()
        ret, frame = cap.read()
        if not ret:
            return (-1, "no detect", "0:00")
        frames_from_start += 5
        if (frames_from_start > FRAME_TO_END):
            return (-2, "cargo error", "0:00")
        

def create_excel_with_detect(folder_path : str, neural_path):
    output_mass = []
    for path_name in os.listdir(folder_path):
        (err, name, time) = predict_and_send(f"{folder_path}\\{path_name}", neural_path)
        if (err != -1):
            output_mass.append([path_name, name])
        else:
            output_mass.append([path_name, "no detect"])
    output_dataframe = pd.DataFrame(output_mass)
    output_dataframe.to_excel("output.xlsx")

def convert_sec_to_min(seconds : int):
    min_string = f"{seconds // 60}:"
    if (seconds % 60) < 10:
        min_string += f"0{seconds % 60}"
    else:
        min_string += f"{seconds % 60}"

    return min_string

