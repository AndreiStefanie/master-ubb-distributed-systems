DOCKER_NETWORK = docker-hadoop_default
ENV_FILE = hadoop.env

build:
	docker build -t hadoop-base ./base
	docker build -t hadoop-namenode ./namenode
	docker build -t hadoop-datanode ./datanode
	docker build -t hadoop-resourcemanager ./resourcemanager
	docker build -t hadoop-nodemanager ./nodemanager
	docker build -t hadoop-historyserver ./historyserver
	docker build -t hadoop-submit ./submit

run:
	docker build -t hadoop-invertedindex ./submit
	docker run --network ${DOCKER_NETWORK} --env-file ${ENV_FILE} hadoop-base hdfs dfs -rm -r /output
	docker run --network ${DOCKER_NETWORK} --env-file ${ENV_FILE} hadoop-base hdfs dfs -mkdir -p /books/
	docker run --network ${DOCKER_NETWORK} --env-file ${ENV_FILE} hadoop-invertedindex hdfs dfs -copyFromLocal -f /opt/hadoop/book.txt /books/
	docker run --network ${DOCKER_NETWORK} --env-file ${ENV_FILE} hadoop-invertedindex
	docker run --network ${DOCKER_NETWORK} --env-file ${ENV_FILE} hadoop-base hdfs dfs -cat /output/*
	docker run --network ${DOCKER_NETWORK} --env-file ${ENV_FILE} hadoop-base hdfs dfs -rm -r /output
	docker run --network ${DOCKER_NETWORK} --env-file ${ENV_FILE} hadoop-base hdfs dfs -rm -r /books

run_cpy:
	docker build -t hadoop-invertedindex ./submit
	docker run --network ${DOCKER_NETWORK} --env-file ${ENV_FILE} hadoop-base hdfs dfs -mkdir -p /books/
	docker run --network ${DOCKER_NETWORK} --env-file ${ENV_FILE} hadoop-invertedindex hdfs dfs -copyFromLocal -f /opt/hadoop/book.txt /books/
	docker run --network ${DOCKER_NETWORK} --env-file ${ENV_FILE} hadoop-invertedindex hdfs dfs -stat %o /books/book.txt
	docker run --network ${DOCKER_NETWORK} --env-file ${ENV_FILE} hadoop-invertedindex
	docker run --network ${DOCKER_NETWORK} --env-file ${ENV_FILE} hadoop-base hdfs dfs -cat /output/* > result.txt
	docker run --network ${DOCKER_NETWORK} --env-file ${ENV_FILE} hadoop-base hdfs dfs -rm -r /output
	docker run --network ${DOCKER_NETWORK} --env-file ${ENV_FILE} hadoop-base hdfs dfs -rm -r /books
