import data from "./usinas1.json" assert {type: "json"};

var map = L.map('map').setView([-12, -53], 4);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
var raio = 10;
var raioR = 28.2;
//usina são josé sem coordenadas
//usinas cachoeira do cai e cachoeira dos patos sem coordenadas
//usina cachoeirinha sem coordenada, jatoba

var prevZoom = map.getZoom();
var circle = new Array();
var circle1 = new Array();
var aux;
var raios = new Array();
var auxiliar;
const pi = 3.14159265359;
 for(var i=0;i<data.length;i++){
    auxiliar = Math.sqrt(data[i]["Potência"]/pi);
    raios.push(auxiliar*5000);
    
} 



for(var i =0; i<data.length;i++){
    aux = data[i]["Potência"]*100/data[i]["Área do reservatório (hectares)"];
    if(aux> raio*data[i]['Potência']){
        
        circle1.push(L.circle([data[i]['Coordenadas'][0], data[i]['Coordenadas'][1]], {
            color: 'blue',
            fillColor: '#0000ff',
            fillOpacity: 0.5,
            radius: raioR*aux
        })
        .bindPopup("Usina hidrelétrica "+data[i]['Usina hidrelétrica']+": "+ aux+" W/m^2")
        .addTo(map));
    
    
        circle.push(L.circle([data[i]['Coordenadas'][0], data[i]['Coordenadas'][1]], {
            color: 'pink',
            fillColor: '#ff6f9c',
            fillOpacity: 0.7,
            radius:  raios[i]
            
        })
        .bindPopup("Potência gerada de "+data[i]['Usina hidrelétrica']+": "+data[i]['Potência']+"MW")
        .addTo(map));
    }
    else{
        circle.push(L.circle([data[i]['Coordenadas'][0], data[i]['Coordenadas'][1]], {
            color: 'pink',
            fillColor: '#ff6f9c',
            fillOpacity: 0.7,
            radius:  raios[i]
            
        })
        .bindPopup("Potência gerada de "+data[i]['Usina hidrelétrica']+": "+data[i]['Potência']+"MW")
        .addTo(map));

        circle1.push(L.circle([data[i]['Coordenadas'][0], data[i]['Coordenadas'][1]], {
            color: '',
            fillColor: '#0000ff',
            fillOpacity: 0.5,
            radius: raioR*aux
        })
        .bindPopup("Usina hidrelétrica "+data[i]['Usina hidrelétrica']+": "+ aux+" W/m^2")
        .addTo(map));

    }
} 

map.on("zoomend", function(){
    
    if(prevZoom>map.getZoom()){
        prevZoom = map.getZoom();
        raio = raio*1.25;
        raioR=raioR*1.25
        for(var i=0;i<data.length;i++){
            raios[i] = raios[i]*1.25;
            aux = data[i]["Potência"]*100/data[i]["Área do reservatório (hectares)"];
            circle[i].setRadius(raios[i]);
            circle1[i].setRadius(raioR*aux);
        }
    }
    if(prevZoom<map.getZoom()){
        prevZoom = map.getZoom();
        raio = raio*0.8
        raioR=raioR*0.8;
        for(var i=0;i<data.length;i++){
            raios[i] = raios[i]*0.8
            aux = data[i]["Potência"]*100/data[i]["Área do reservatório (hectares)"];
            circle[i].setRadius(raios[i]);
            circle1[i].setRadius(raioR*aux);
        }

    }
    } 
)



 


