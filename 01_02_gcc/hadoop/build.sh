${JAVA_HOME}/bin/javac -classpath $(${HADOOP_HOME}/bin/hadoop classpath) InvertedIndex.java
${JAVA_HOME}/bin/jar cf index.jar InvertedIndex*.class stopwords.txt
