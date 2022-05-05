FROM python:3.9-bullseye

ENV PYTHONUNBUFFERED 1

WORKDIR /src

ADD requirements.txt /src

RUN pip install --upgrade pip && pip install -r requirements.txt

ADD . /src/
