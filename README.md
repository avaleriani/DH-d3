![N|Solid](https://static.acaula.com.ar/center/AR/180-digital-house-43cb5b1f-b336-4f72-a772-a99ed3e54037-logo-200x200.jpg)

#Clase 5 - Arboles de la ciudad.



### Pre-requisitios

_Node: < 8.9.3_

_Npm: < 5.5.1_

### Instalación

`npm run pre`

Con este comando vamos a instalar de forma global:
- Yarn: Manejo de paquetes.
- PM2: Lo vamos a usar para reiniciar el servidor automagicamente mientras desarrollamos en node.
- Webpack: Para crear el servidor de desarrollo frontend y luego el bundle de produccion.

`yarn install`

### Desarrollo frontend

`yarn run dev`

Este comando va a crear un servidor de desarrollo frontend en la direccion http://localhost:8080/ que se va a refrescar
automaticamente con cada cambio de html, js o scss.


###Desarrollo del lado del servidor

`yarn run dev-server`

Este comando va a correr un servidor de node en la direccion http://localhost:3000/
en este proyecto, vamos a exponer el endpoint /data, que nos va a devolver el json del archivo con los datos
que vamos a procesar del lado del cliente.

###Build de produccion y correr un servidor

`yarn start`

Este comando arma un build listo para produccion y corre el servidor de node para hacer funcionar todo el proyecto.