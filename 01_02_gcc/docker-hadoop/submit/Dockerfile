FROM hadoop-base

COPY WordCount.jar /opt/hadoop/applications/app.jar

ENV JAR_FILEPATH="/opt/hadoop/applications/app.jar"
ENV CLASS_TO_RUN="WordCount"
ENV PARAMS="/input /output"

ADD run.sh /run.sh
RUN chmod a+x /run.sh

CMD ["/run.sh"]
