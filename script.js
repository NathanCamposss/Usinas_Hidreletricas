import data1 from "./usinas1.json" assert {type: "json"};

function organizaVetor(dat){
    var aux;
    for(var i=0;i<dat.length;i++){
        for(var j =i;j<dat.length;j++){
            if(dat[i]["Potência"]<dat[j]["Potência"]){
                aux = dat[i];
                dat[i] = dat[j];
                dat[j]=aux;
                if(i>0){
                    i--;
                }
                else{
                    i=0;
                }
            }
        }
    }
    return dat;
}

var data = organizaVetor(data1);


var map = L.map('map').setView([-12, -53], 4);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
//usina são josé sem coordenadas
//usinas cachoeira do cai e cachoeira dos patos sem coordenadas
//usina cachoeirinha sem coordenada, jatoba

var prevZoom = map.getZoom();
var circle = new Array();
var circle1 = new Array();
var raios = new Array(), raios1 = new Array();
var auxiliar;
var aux;
const pi = 3.14159265359;
var nomeA, nomea, nomeP, nomep;
var menorP = 100000000000;
var maiorP = -1;
var menorA = 10000000000000;
var maiorA =-1;

for(var i=0;i<data.length;i++){
    if(menorP > data[i]["Potência"]){
        menorP = data[i]["Potência"];
        nomep = data[i]["Usina hidrelétrica"];
    }
    if(menorA > data[i]["Área do reservatório (hectares)"])
    {
        menorA = data[i]["Área do reservatório (hectares)"];
        nomea = data[i]["Usina hidrelétrica"];
    }
    if(maiorP < data[i]["Potência"]){
        maiorP = data[i]["Potência"];
        nomeP = data[i]["Usina hidrelétrica"];
    }
    if(maiorA < data[i]["Área do reservatório (hectares)"])
    {
        maiorA = data[i]["Área do reservatório (hectares)"];
        nomeA = data[i]["Usina hidrelétrica"];
    }
}
 for(var i=0;i<data.length;i++){
    auxiliar = Math.log10(menorP)+((Math.log10(maiorP)+Math.log10(menorP))/4)*data[i]["Potência"];
    if(auxiliar*15<2500){
        raios.push(auxiliar*210);
    }
    else if(auxiliar*15>2500 && auxiliar*15<5000){
        raios.push(auxiliar*190);
    }
    else if(auxiliar*15 >5000 && auxiliar*15<10000){
        raios.push(auxiliar*140);
    }
    else if(auxiliar*15 >10000 && auxiliar*15<15000){
        raios.push(auxiliar*90);
    }
    else if(auxiliar*15 >15000 && auxiliar*15<20000){
        raios.push(auxiliar*65);
    }
    else if(auxiliar*15 >20000 && auxiliar*15<30000){
        raios.push(auxiliar*55);
    }
    else if(auxiliar*15 >30000 && auxiliar*15<40000){
        raios.push(auxiliar*45);
    }
    else if(auxiliar*15 >40000 && auxiliar*15<60000){
        raios.push(auxiliar*35);
    }
    else if(auxiliar*15 >60000 && auxiliar*15<100000){
        raios.push(auxiliar*30);
    }
    else if(auxiliar*15 >100000 && auxiliar*15<150000){
        raios.push(auxiliar*25);
    }
    else{
    raios.push(auxiliar*20);
    }
    auxiliar = Math.log10(menorA)+((Math.log10(maiorA)+Math.log10(menorA))/6)*data[i]["Área do reservatório (hectares)"];
    raios1.push(auxiliar);
    
    
    
} 


for(var i =0; i<data.length;i++){
    aux = 1*100/data[i]["Índice"];
    if(raios1[i]>raios[i]){
        circle1.push(L.circle([data[i]['Coordenadas'][0], data[i]['Coordenadas'][1]], {
            color: 'blue',
            fillColor: '#0000ff',
            fillOpacity: 0.7,
            radius: raios1[i]
        })
        .bindPopup("Usina hidrelétrica "+data[i]['Usina hidrelétrica']+": "+ (data[i]["Área do reservatório (hectares)"]*10000).toFixed(0)+" m^2")
        .addTo(map));
    
    
        circle.push(L.circle([data[i]['Coordenadas'][0], data[i]['Coordenadas'][1]], {
            color: 'orange',
            fillColor: '#ffa500',
            fillOpacity: 0.7,
            radius:  raios[i]
            
        })
        .bindPopup("Potência gerada de "+data[i]['Usina hidrelétrica']+": "+data[i]['Potência']+"MW")
        .addTo(map));
    }

    if(raios1[i]<raios[i]){
        circle.push(L.circle([data[i]['Coordenadas'][0], data[i]['Coordenadas'][1]], {
            color: 'orange',
            fillColor: '#ffa500',
            fillOpacity: 0.7,
            radius:  raios[i]
            
        })
        .bindPopup("Potência gerada de "+data[i]['Usina hidrelétrica']+": "+data[i]['Potência']+"MW")
        .addTo(map));

        circle1.push(L.circle([data[i]['Coordenadas'][0], data[i]['Coordenadas'][1]], {
            color: 'blue',
            fillColor: '#0000ff',
            fillOpacity: 0.7,
            radius: raios1[i]
        })
        .bindPopup("Usina hidrelétrica "+data[i]['Usina hidrelétrica']+": "+ (data[i]["Área do reservatório (hectares)"]*10000).toFixed(0)+" m^2")
        .addTo(map));
    }
    
   
} 

map.on("zoomend", function(){
    
    if(prevZoom>map.getZoom()){
        prevZoom = map.getZoom();
        for(var i=0;i<data.length;i++){
            raios[i] = raios[i]*1.25;
            raios1[i] = raios1[i]*1.25;
            aux = data[i]["Potência"]*100/data[i]["Área do reservatório (hectares)"];
            circle[i].setRadius(raios[i]);
            circle1[i].setRadius(raios1[i]);
        }
    }
    if(prevZoom<map.getZoom()){
        prevZoom = map.getZoom();
        for(var i=0;i<data.length;i++){
            raios[i] = raios[i]*0.8
            raios1[i] = raios1[i]*0.8;
            aux = data[i]["Potência"]*100/data[i]["Área do reservatório (hectares)"];
            circle[i].setRadius(raios[i]);
            circle1[i].setRadius(raios1[i]);
        }

    }
    } 
)



 


