.PHONY: setup train seed test up sim clean

setup:
	python -m pip install -r requirements.txt
	cd frontend && npm install

train:
	python -m ml.train
	python -m ml.evaluate

seed:
	python -m backend.seed_demo

test:
	python -m pytest tests/ -v

sim:
	python -m ml.pulse_simulation

up:
	docker-compose up --build

clean:
	rm -f healthpulse.db
