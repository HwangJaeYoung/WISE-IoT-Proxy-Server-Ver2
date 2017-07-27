# Context-Aware auxiliary component

## Description

The Context-Aware Auxiliary Gateway (CAG) eliminates technical barriers between FIWARE and oneM2M. There exist IoT devices using the OMA NGSI context data model. If oneM2M service layer platform is collecting IoT data from such devices, there should be a gateway converting NGSI context data into oneM2M resource structure. The CAG component takes NGSI context data model as an input and appropriately convert the context data into a corresponding oneM2M resources using the Mca interface [1].

----
## CAG Architecture and Resource Mapping model


----
## Installation

For running CAG on your machine, first Mobius Server (oneM2M standard) and FIWARE ContextBroker (NGSI standard) have to be installed but describing the Mobius and FIWARE is out of scope in this document.
 Thus, we have attached install url for your information.


1. FIWARE Context Broker
```
FIWARE Readdocs: https://fiware-orion.readthedocs.io/en/master/admin/install/index.html
Youtube :https://www.youtube.com/watch?v=fJiIEv9kzuc
```

2. Mobius Server (oneM2M)
```
IoT Ocean Lab: http://www.iotocean.org/main/
```
* You can use other server based on oneM2M standard such as OM2M.

3. CAG Component

```
move to localpath/Context-Aware auxiliary component/
npm install
```

----
## Usage
1. Write markdown text in this textarea.
2. Click 'HTML Preview' button.


----
## References

[1] D2.1 - Morphing Mediation Gateway with Management and Configuration Functions R1