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

wordcount:
	docker build -t hadoop-wordcount ./submit
	docker run --network ${DOCKER_NETWORK} --env-file ${ENV_FILE} hadoop-base hdfs dfs -mkdir -p /input/
	docker run --network ${DOCKER_NETWORK} --env-file ${ENV_FILE} hadoop-base hdfs dfs -copyFromLocal -f /opt/hadoop/README.txt /input/
	docker run --network ${DOCKER_NETWORK} --env-file ${ENV_FILE} hadoop-wordcount
	docker run --network ${DOCKER_NETWORK} --env-file ${ENV_FILE} hadoop-base hdfs dfs -cat /output/*
	docker run --network ${DOCKER_NETWORK} --env-file ${ENV_FILE} hadoop-base hdfs dfs -rm -r /output
	docker run --network ${DOCKER_NETWORK} --env-file ${ENV_FILE} hadoop-base hdfs dfs -rm -r /input
