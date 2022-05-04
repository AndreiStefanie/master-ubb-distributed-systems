FROM asergiu/ubb:hadoop-base

MAINTAINER Adrian DARABANT <dadi@cs.ubbcluj.ro>

HEALTHCHECK CMD curl -f http://localhost:8042/ || exit 1

ADD run.sh /run.sh
RUN chmod a+x /run.sh

EXPOSE 8042

CMD ["/run.sh"]
