FROM asergiu/ubb:hadoop-base

MAINTAINER Adrian DARABANT <dadi@cs.ubbcluj.ro>

HEALTHCHECK CMD curl -f http://localhost:9870/ || exit 1

ENV HDFS_CONF_dfs_namenode_name_dir=file:///hadoop-data/dfs/name
RUN mkdir -p /hadoop-data/dfs/name
VOLUME /hadoop-data/dfs/name

ADD run.sh /run.sh
RUN chmod a+x /run.sh

EXPOSE 9870

CMD ["/run.sh"]
