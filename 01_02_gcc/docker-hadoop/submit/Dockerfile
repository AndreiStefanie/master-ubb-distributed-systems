FROM hadoop-base

COPY index.jar /opt/hadoop/applications/app.jar

COPY book.txt /opt/hadoop/book.txt

ENV JAR_FILEPATH="/opt/hadoop/applications/app.jar"
ENV CLASS_TO_RUN="InvertedIndex"
ENV PARAMS="/books /output"

ADD run.sh /run.sh
RUN chmod a+x /run.sh

CMD ["/run.sh"]
