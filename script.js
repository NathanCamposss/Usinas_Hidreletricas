import data1 from "./usinas1.json" assert {type: "json"};

// função que organiza o vetor de objetos começando com aquele que tem maior potência até o de menor potência
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

// Cria o mapa
var map = L.map('map').setView([-12, -53], 4);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var prevZoom = map.getZoom();
var circle = new Array();
var circle1 = new Array();
var raios = new Array(), raios1 = new Array();
var auxiliar, auxiliarA, menorAux = 10000000000000000, maiorAux = -1, cod = new Array();
var aux;
var menorP = 100000000000;
var maiorP = -1;
var menorA = 10000000000000;
var maiorA =-1;

for(var i=0;i<data.length;i++){
    if(menorP > data[i]["Potência"]){
        menorP = data[i]["Potência"];
        
    }
    if(menorA > data[i]["Área do reservatório (hectares)"])
    {
        menorA = data[i]["Área do reservatório (hectares)"];
        
    }
    if(maiorP < data[i]["Potência"]){
        maiorP = data[i]["Potência"];
       
    }
    if(maiorA < data[i]["Área do reservatório (hectares)"])
    {
        maiorA = data[i]["Área do reservatório (hectares)"];
        
    }
}

map.doubleClickZoom.disable(); 

//Criação dos raios dos círculos de área e de potência
for(var i=0;i<data.length;i++){
    auxiliar = Math.log10(menorP)+((Math.log10(maiorP)+Math.log10(menorP))/4)*data[i]["Potência"];
    auxiliarA = Math.log10(menorA)+((Math.log10(maiorA)+Math.log10(menorA))/6)*data[i]["Área do reservatório (hectares)"];
    if(maiorAux<auxiliarA){
        maiorAux = auxiliarA;
    }
    if(menorAux> auxiliarA){
        menorAux= auxiliarA;
    }

    if(auxiliar*15<1000){
        raios.push(auxiliar*270);
        
    }
    else if(auxiliar*15 >1000 && auxiliar*15<2500){
        raios.push(auxiliar*250);
        
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

    if(auxiliarA<10000){
        raios1.push(auxiliarA*270/100);
        
    }
    else if(auxiliarA >10000 && auxiliarA<25000){
        raios1.push(auxiliarA*250/100);
        
    }
    else if(auxiliarA>25000 && auxiliarA<50000){
        raios1.push(auxiliarA*190/100);
        
    }
    else if(auxiliarA >50000 && auxiliarA<75000){
        raios1.push(auxiliarA*140/100);
        
    }
    else if(auxiliarA >75000 && auxiliar<100000){
        raios1.push(auxiliarA*90/100);
        
    }
    else if(auxiliarA >100000 && auxiliarA<125000){
        raios1.push(auxiliarA*65/100);
        
    }
    else if(auxiliarA*15 >125000 && auxiliarA<150000){
        raios1.push(auxiliarA*55/100);
        
    }
    else if(auxiliarA >150000 && auxiliarA<175000){
        raios1.push(auxiliarA*45/100);
        
    }
    else if(auxiliarA >175000 && auxiliarA<200000){
        raios1.push(auxiliarA*35/100);
       
    }
    else if(auxiliarA >200000 && auxiliarA<250000){
        raios1.push(auxiliarA*30/100);
        
    }
    else if(auxiliarA >250000 && auxiliarA<300000){
        raios1.push(auxiliarA*25/100);
       
    }
    else{
    raios1.push(auxiliarA*20/100);
    
    }
} 

// Criação dos círculos presentes no mapa
for(var i =0; i<data.length;i++){
    aux = 1*100/data[i]["Índice"];
    if(raios1[i]>raios[i]){
        cod.push(1);

        circle1.push(L.circle([data[i]['Coordenadas'][0], data[i]['Coordenadas'][1]], {
            color: 'blue',
            fillColor: '#0000ff',
            fillOpacity: 0.7,
            radius: raios1[i]
        })
        .bindPopup(data[i]['Usina hidrelétrica']+": "+ (data[i]["Área do reservatório (hectares)"]).toFixed(0)+" hectares")
        .addTo(map).on("dblclick", function(){
            for(var i=0;i<data.length;i++){
                if(this._popup._content == data[i]['Usina hidrelétrica']+": "+ (data[i]["Área do reservatório (hectares)"]).toFixed(0)+" hectares"){
                    trocarSobreposicao(i);
                    break;
                }
                
            }
        }));
    
    
        circle.push(L.circle([data[i]['Coordenadas'][0], data[i]['Coordenadas'][1]], {
            color: 'orange',
            fillColor: '#ffa500',
            fillOpacity: 0.7,
            radius:  raios[i]
            
        })
        .bindPopup(data[i]['Usina hidrelétrica']+": "+data[i]['Potência']+"MW")
        .addTo(map).on("dblclick", function(){
            for(var i=0;i<data.length;i++){
                if(this._popup._content == data[i]['Usina hidrelétrica']+": "+data[i]['Potência']+"MW"){
                    trocarSobreposicao(i);
                    break;
                }
                
            }
        }));
    }

    if(raios1[i]<raios[i]){
        cod.push(0);
        

        circle.push(L.circle([data[i]['Coordenadas'][0], data[i]['Coordenadas'][1]], {
            color: 'orange',
            fillColor: '#ffa500',
            fillOpacity: 0.7,
            radius:  raios[i]
            
        })
        .bindPopup(data[i]['Usina hidrelétrica']+": "+data[i]['Potência']+"MW")
        .addTo(map).on("dblclick", function(){
            for(var i=0;i<data.length;i++){
                if(this._popup._content == data[i]['Usina hidrelétrica']+": "+data[i]['Potência']+"MW"){
                    trocarSobreposicao(i);
                    break;
                }
                
            }
        }));

        circle1.push(L.circle([data[i]['Coordenadas'][0], data[i]['Coordenadas'][1]], {
            color: 'blue',
            fillColor: '#0000ff',
            fillOpacity: 0.7,
            radius: raios1[i]
        })
        .bindPopup(data[i]['Usina hidrelétrica']+": "+ (data[i]["Área do reservatório (hectares)"]).toFixed(0)+" hectares")
        .addTo(map).on("dblclick", function(i){
            for(var i=0;i<data.length;i++){
                if(this._popup._content == data[i]['Usina hidrelétrica']+": "+ (data[i]["Área do reservatório (hectares)"]).toFixed(0)+" hectares"){
                    trocarSobreposicao(i);
                    break;
                }
                
            }
        }));
    }
    
   
} 

//função que ajusta o tamanho dos círculos de acordo com o nivel de zoom
map.on("zoomend", function(){
    if(prevZoom>map.getZoom()){
        prevZoom = map.getZoom();
        for(var i=0;i<data.length;i++){
            raios[i] = raios[i]*1.5625; 
            raios1[i] = raios1[i]*1.5625; 
            circle[i].setRadius(raios[i]);
            circle1[i].setRadius(raios1[i]);
            
        }
    }
    if(prevZoom<map.getZoom()){
        prevZoom = map.getZoom();
        for(var i=0;i<data.length;i++){
            raios[i] = raios[i]*0.64; 
            raios1[i] = raios1[i]*0.64; 
            circle[i].setRadius(raios[i]);
            circle1[i].setRadius(raios1[i]);
        }
    }
    } 
)

//função responsável por trocar a sobreposição da camada laranja com a camada azul de uma determinada coordenada
function trocarSobreposicao(indice){
    circle[indice].remove();
    circle1[indice].remove();
    if(cod[indice]==1){
        circle[indice] = (L.circle([data[indice]['Coordenadas'][0], data[indice]['Coordenadas'][1]], {
            color: 'orange',
            fillColor: '#ffa500',
            fillOpacity: 0.7,
            radius:  raios[indice]
            
        })
        .bindPopup(data[indice]['Usina hidrelétrica']+": "+data[indice]['Potência']+"MW")
        .addTo(map).on("dblclick", function(){
            for(var i=0;i<data.length;i++){
                if(this._popup._content == data[i]['Usina hidrelétrica']+": "+data[i]['Potência']+"MW"){
                    trocarSobreposicao(i);
                    break;
                }
                
            }
        }));

        circle1[indice] = (L.circle([data[indice]['Coordenadas'][0], data[indice]['Coordenadas'][1]], {
            color: 'blue',
            fillColor: '#0000ff',
            fillOpacity: 0.7,
            radius: raios1[indice]
        })
        .bindPopup(data[indice]['Usina hidrelétrica']+": "+ (data[indice]["Área do reservatório (hectares)"]).toFixed(0)+" hectares")
        .addTo(map).on("dblclick", function(){
            for(var i=0;i<data.length;i++){
                if(this._popup._content == data[i]['Usina hidrelétrica']+": "+ (data[i]["Área do reservatório (hectares)"]).toFixed(0)+" hectares"){
                    trocarSobreposicao(i);
                    break;
                }
                
            }
        }));
    }
    if(cod[indice]==0){
        circle1[indice] = (L.circle([data[indice]["Coordenadas"][0], data[indice]["Coordenadas"][1]], {
            color: 'blue',
            fillColor: '#0000ff',
            fillOpacity: 0.7,
            radius: raios1[indice]
        })
        .bindPopup(data[indice]['Usina hidrelétrica']+": "+ (data[indice]["Área do reservatório (hectares)"]).toFixed(0)+" hectares")
        .addTo(map).on("dblclick", function(){
            for(var i=0;i<data.length;i++){
                if(this._popup._content == data[i]['Usina hidrelétrica']+": "+ (data[i]["Área do reservatório (hectares)"]).toFixed(0)+" hectares"){
                    trocarSobreposicao(i);
                    break;
                }
                
            }
        }));
    
    
        circle[indice] = (L.circle([data[indice]['Coordenadas'][0], data[indice]['Coordenadas'][1]], {
            color: 'orange',
            fillColor: '#ffa500',
            fillOpacity: 0.7,
            radius:  raios[indice]
            
        })
        .bindPopup(data[indice]['Usina hidrelétrica']+": "+data[indice]['Potência']+"MW")
        .addTo(map).on("dblclick", function(){
            for(var i=0;i<data.length;i++){
                if(this._popup._content == data[i]['Usina hidrelétrica']+": "+data[i]['Potência']+"MW"){
                    trocarSobreposicao(i);
                    break;
                }
                
            }
        }));
    }
    cod[indice]==1?cod[indice]=0:cod[indice]=1;
}