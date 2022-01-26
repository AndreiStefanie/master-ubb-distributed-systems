# Tema Servlet

Andrei Petru Ștefănie, SDI, 244

## Cerinte

Tema are ca scop familiarizarea cu tehnologiile EJB, JPA, Wildfly, Glassfish si JNDI.

Realizarea unei aplicaţii care să folosească EJB, JPA, Servleturi, eventual JSP. Aplicatia va trebui să contină un server ce să gestioneze minimum două tabele în DB care să aibă relaţii între ele. Mai trebuie să conţină doi clienţi, unul care să apeleze serverul prin JNDI, celălalt să folosească injectarea EJB.

## Solutia Propusa

Aplicatia ajuta un utilizator sa isi gestioneze notilele. Printre functionalitati se numara:

- adaugarea de notite noi
- afisarea tuturor notitelor pentru un utilizator
- adaugarea notitelor folosind un client bazat pe JNDI
- afisarea notitelor clientilor
- compatibiliate cu Glassfish si Wildfly

## Arhitectura

### Baza de date

![](./ejb_diagram.jpg)

### Server

Aplicatia server detine persistenta entitatilor `User` si `Note` care sunt in relatie de **one-to-many** (`User` detine o lista de `Note`). Logica aplicatiei este pastrata in clasa `UserNotesBean` fiind de tip stateless. Aceasta implementeaza interfetele `LogicLocal` si `LogicRemote`.

Pentru functiile implementate din `LogicLocal` se folosesc clasele de entitati `User` si `Note` iar pentru functiile implementate din `LogicRemote` care va fi folosita la invocarea remote prin `JNDI` se folosesc clasele de tip Data Tansfer Object `NoteDTO` si `UserDTO`.

### Clients

Aplicatia client care este de tip servlet foloseste doua fisiere statice pentru randare: `note.jsp` pentru afisarea aplicatiei propriu-zise si `error.jsp` pentru afisarea erorilor.

Aplicatiile client care foloseste comunicarea prin `JNDI` este facuta pentru a fi rulata pe ASs Glassfish si Wildfly. Acestea contin interfata folosita in aplicatia server `LogicRemote` si obiectele de tip DTO, `NoteDTO` si `UserDTO`. Aceasta este o aplicatie simpla de consola care initializeaza parametrii necesari pentru `JNDI` si apoi invoca printr-un obiect proxy, obiectul de tip stateless bean din aplicatia server, iar apoi executa cateva operatii cu acesta.

## Build si Deployment

### Glassfish

- Create a new JDBC connection pool `create-jdbc-connection-pool --restype javax.sql.DataSource --datasourceclassname com.mysql.cj.jdbc.MysqlConnectionPoolDataSource --property "user=root:url=jdbc\\:mysql\\://localhost\\:3306/tpjad?useTimeZone\\=true&serverTimezone\\=UTC&autoReconnect\\=true&useSSL\\=false" MySqlPool`
- Create a new data source `create-jdbc-resource --connectionpoolid MySqlPool jdbc/mysql`
- Adjust `persistence.xml` if needed to use the previously created data source
- Build and deploy the server+servlet app `clean build deployGlassfish`

### Wildfly

- Create a new connection pool `module add --name=com.mysql --resources=mysql-connector-java.jar --dependencies=javax.api,javax.transaction.api /subsystem=datasources/jdbc-driver=mysql: add(driver-name=mysql,driver-module-name=com.mysql,driver-xa-datasource-class-name=com.mysql.cj.jdbc.MysqlXADataSource)`
- Create a new data source `data-source add --name=MySqlDS --driver-name=mysql --jndi-name=java:jboss/datasources/MySqlDS --connection-url=jdbc:mysql://localhost:3306/tpjad --user-name=root --password=password --enabled=true`
- Adjust `persistence.xml` if needed to use the previously created data source
- Build and deploy the server+servlet app `clean build deployWildfly`

Proiectul are la baza mai multe task-uri de gradle pentru o modularizare mai buna.

## Referinte

- Exemplele de la curs http://www.cs.ubbcluj.ro/~florin/TPJAD/ExempleSurseDocumentatii/ (6JPA2)
- Documentatia Gradle https://docs.gradle.org/current/userguide/tutorial_using_tasks.html
