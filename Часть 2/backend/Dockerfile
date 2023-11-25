FROM python:3.9

WORKDIR /app

RUN apt-get update \
    && apt-get install -y libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

COPY ./requirements.txt /app/requirements.txt

ENV PIP_ONLY_BINARY=cmake

RUN pip install --upgrade pip


RUN pip install --no-cache-dir -r requirements.txt

COPY . /app

ENTRYPOINT ["python"]

CMD ["main.py"]