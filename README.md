## Summary
This system is a restful spring api using a MySQL back-end, to store and retrieve data, which is then used by ReactJS to generate a dynamic web page. It uses maven for its dependencies, npm for modules and then webpack to merge it all together into one accessible file. 

This was made using IntelliJ IDEA 2016.3.6. 
## Using MySQL
In order to link your MySQL database to the spring api you'll need to edit the "src/main/resources/application.properties" file with your datatsource url, username and password. 

You will then need to run the database script "src/main/resources/db_script.sql" which will generate and populate the relevant tables.
## Using KeyCloak
In order to link your keycloak, you'll need to update the "src/main/resources/application.properties" and "src/main/resources/static/keycloak.json" files with your keycloaks details (e.g. realm, realmkey, authorization roles, etc). 

If any errors occur after creating a new user, make sure that they have been assigned one of the roles added in the "application.properties" file as this will not be done automatically.
## Requirements
You will require a JDK in order to run this system.
## Reference
This project began by following the React.js and Spring Data REST tutorial: https://spring.io/guides/tutorials/react-and-spring-data-rest/ and the git repository it's linked to: https://github.com/spring-guides/tut-react-and-spring-data-rest/tree/master/basic