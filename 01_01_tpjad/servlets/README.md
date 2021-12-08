# Tema Servlet

Andrei Petru Ștefănie, SDI, 244

## Cerinte

Tema are ca scop familiarizarea cu diferitele tehnologii te tip servlet. Acestea includ:

- Containerul **Tomcat**, atat bazat pe **WAR** si **context extern**, cat si in mod **embedded**.
- Containerul **Jetty**, atat bazat pe **WAR** si **context extern**, cat si in mod **embedded**.
- Serverul **WildFly**
- Serverul **GlassFish**

Aplicatia de la baza trebuie sa fie o aplicatie simpla, cu cel putin 2 servlet-uri.

## Solutia Propusa

Aplicatia este gandita pentru a gestiona fisiere json. Aceasta suporta atat upload-ul, cat si download-ul fisierelor. In plus, fisierele json furnizate sunt formatate.

In Java, una dintre cele mai des intalnite biblioteci pentru manipularea datelor in format json este [GSON](https://github.com/google/gson). In cazul de fata, GSON va gestiona formatarea fisierelor.

## Endpoint-uri

Aplicatia pune la dispozitie urmatoarele endpoint-uri:

- **GET /** - acesta pune la dispozitie un input pentru uploadul fisierelor, cat si lista cu fisiere deja furnizate si formatate.
- **GET /upload** - acesta pune la dispozitie input-ul pentru a furniza fisierele
- **POST /upload** - acesta este endpoint-ul pentru upload-ul propriu-zis. Fisierele sunt transmise in format multipart.
- **GET /download** - acesta afiseaza lista cu fisierele disponibile pe server
- **POST /download** - acesta este endpoint-ul pentru download-ul propriu-zis. Servletul va descarca fisierul indicat prin parametrul **filename**.

## Build si Deployment

Aplicatia foloseste **gradle** pentru build. Din directorul root, se ruleaza comanda `gradle clean build`. Aceasta va build-ui atat aplicatia in format war, cat si jar-urile continand aplicatia si containerele Tomcat si Jetty in mod embedded.

Proiectul are la baza mai multe task-uri de gradle pentru o modularizare mai buna.

### WAR

#### Tomcat

Pentru deployment bazat pe war si Tomcat se copiaza `app.war` in `$CATALINA_HOME\webapps` (e.g. C:\Tools\XAMPP\tomcat\webapps).

#### Jetty

Pentru deployment cu Jetty, se copiaza `app.war` in `$JETTY_BASE\webapps`. In prealabil, este nevoie de pornirea modulelor Jetty necesare folosind comanda `java -jar $JETTY_HOME\start.jar --add-module=server,deploy,http`

#### Wildfly

Pentru deployment bazat pe war si Wildfly se copiaza `app.war` in `$JBOSS_HOME/standalone/deployments` si se ruleaza `$JBOSS_HOME/bin/standalone.bat`.

#### Glassfish

Pentru deployment bazat pe war si Glassfish se copiaza `app.war` in `$GF_HOME/glassfish/domains/domain1/autodeploy` si se ruleaza din `$GF_HOME/bin/asadmin.bat` comanda `start-domain` (si `stop-domain` pentru a opri).

### Context Extern

#### Tomcat

Se dezarhiveaza `app.war` in `C:\Users\<User>\Desktop\app` mai apoi se copiaza `tomcat-alias.xml` in `$CATALINA_HOME\conf\Catalina\localhost`.

Aplicatia va fi disponibila la `http://localhost:8080/tomcat-alias/`.

#### Jetty

Se dezarhiveaza `app.war` in `C:\Users\<User>\Desktop\app` mai apoi se copiaza `jetty-alias.xml` in `$JETTY_BASE\webapps`.

Aplicatia va fi disponibila la `http://localhost:8080/extern/`.

### Tomcat Embedded si Jetty Embedded

Se ruleaza jar-urile `jetty/build/libs/jetty.jar` respectiv `tomcat/build/libs/tomcat.jar`.
