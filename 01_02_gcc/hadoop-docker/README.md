# hadoop-docker

This is the candidate release for a docker-compose arch based of nodes of types:
 - namenode
 - node - runs the datanode service and nodemanager service
 - resourcemanager 
 - historyserver

There is a base container like in the https://github.com/big-data-europe/docker-hadoop project that inspired this development. The base container should be build in the base folder with a command of the type:<br>
<b>docker build [-t repo:tag] . </b>


Once the base container is built the rest of them are built and brought up by issuing:<br>
<b>docker-composer up </b> <br>
in the main folder congtaining the yml files.

docker-composer scale node=x 

should allow basic scalling of the node of the system. Decomissioning of containers should still be done manually.

<h2>Issues</h2>
 - at this time only one volume (with same content) is used by all nodes and hence the same content is present on all datanodes making the scalling unuseful and meaningless. Should be fixed by some some sort of template service declaration that serparates  datanode storage for all node replicas. 


  
