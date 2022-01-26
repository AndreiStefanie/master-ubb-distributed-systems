## Glassfish server does not start. NullPointeException
Glassfish 5.0.1 requires JDK 8.
Solution: Install it and append `set AS_JAVA=C:\Program Files\AdoptOpenJDK\jdk-8.0.292.10-hotspot` (update the JDK 8 folder according to your installation) to $GF_HOME/glassfish/config/asenv.bat (asenv.conf for Linux/MacOS)

## Cannot build the Wildfly client
The wildfly-ejb-client-bom library has a different packaging approach in the latest versions.
Solution: Use an older version `implementation 'org.wildfly:wildfly-ejb-client-bom:25.0.1.Final'`

## Cannot build the Glassfish client
`implementation 'org.glassfish.main.common:glassfish-naming:5.0.1'`

## Listing JNDI entries
- Glassfish: asadmin > `list-jndi-entries`
- Wildfly: they are printed when starting the server
