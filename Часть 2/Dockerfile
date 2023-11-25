FROM node:14 AS frontend
WORKDIR /usr/src/app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend .
RUN npm run build

FROM python:3.9 AS backend
WORKDIR /usr/src/app/backend
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend .

FROM node:14
WORKDIR /usr/src/app
COPY --from=frontend /usr/src/app/frontend/build /usr/src/app/frontend/build
COPY --from=backend /usr/src/app/backend /usr/src/app/backend

CMD ["python", "main.py"]
CMD ["npm", "start"]