

import data1 from "./usinas1.json" assert {type: "json"};

// extensão de classe
L.Control.Select = L.Control.extend({
  options: {
    position: "topright",
    iconMain: "≡",
    iconChecked: " ◉",
    // "☑"
    iconUnchecked: " ⵔ",
    //"❒",
    iconGroupChecked: " ▶",
    iconGroupUnchecked: " ⊳",
    multi: false,
    items: [],
    // {value: 'String', 'label': 'String', items?: [items]}
    id: "",
    selectedDefault: false,
    additionalClass: "",
    onOpen: function onOpen() {},
    onClose: function onClose() {},
    onGroupOpen: function onGroupOpen(itemGroup) {},
    onSelect: function onSelect(item) {}
  },
  initialize: function initialize(options) {
    var _this = this;

    this.menus = [];
    L.Util.setOptions(this, options);
    var opts = this.options;
    this.options.items.forEach(function (item) {
      if (!item.label) {
        item.label = item.value;
      }
    });

    if (opts.multi) {
      opts.selectedDefault = opts.selectedDefault instanceof Array ? opts.selectedDefault : [];
    } else {
      opts.selectedDefault = opts.selectedDefault || (opts.items instanceof Array && opts.items.length > 0 ? opts.items[0].value : false);
    }

    //console.log(opts.selectedDefault);
    this.state = {
      selected: opts.selectedDefault,
      // false || multi ? {value} : [{value}]
      open: false // false || 'top' || {value}

    }; // assigning parents to items

    var assignParent = function assignParent(item) {
      if (_this._isGroup(item)) {
        item.items.map(function (item2) {
          item2.parent = item.value;
          assignParent(item2);
        });
      }
    };

    this.options.items.map(function (item) {
      item.parent = "top";
      assignParent(item);
    }); // assigning children to items

    var getChildren = function getChildren(item) {
      var children = [];

      if (_this._isGroup(item)) {
        item.items.map(function (item2) {
          children.push(item2.value);
          children = children.concat(getChildren(item2));
        });
      }

      return children;
    };

    var assignChildrens = function assignChildrens(item) {
      item.children = getChildren(item);

      if (_this._isGroup(item)) {
        item.items.map(function (item2) {
          assignChildrens(item2);
        });
      }
    };

    this.options.items.map(function (item) {
      assignChildrens(item);
    });
  },
  onAdd: function onAdd(map) {
    this.map = map;
    var opts = this.options;
    this.container = L.DomUtil.create("div", "leaflet-control leaflet-bar leaflet-control-select");
    this.container.setAttribute("id", opts.id);
    var icon = L.DomUtil.create("a", "leaflet-control-button ", this.container);
    icon.innerHTML = opts.iconMain;
    map.on("click", this._hideMenu, this);
    L.DomEvent.on(icon, "click", L.DomEvent.stop);
    L.DomEvent.on(icon, "click", this._iconClicked, this);
    L.DomEvent.disableClickPropagation(this.container);
    L.DomEvent.disableScrollPropagation(this.container);
    this.render();
    return this.container;
  },
  _emit: function _emit(action, data) {
    var newState = {};

    switch (action) {
      case "ITEM_SELECT":
        if (this.options.multi) {
          newState.selected = this.state.selected.slice();

          if (this.state.selected.includes(data.item.value)) {
            newState.selected = newState.selected.filter(function (s) {
              return s !== data.item.value;
            });
          } else {
            newState.selected.push(data.item.value);
          }
        } else {
          newState.selected = data.item.value;
        }

        newState.open = data.item.parent;
        break;

      case "GROUP_OPEN":
        newState.open = data.item.value;
        break;

      case "GROUP_CLOSE":
        newState.open = data.item.parent;
        break;

      case "MENU_OPEN":
        newState.open = "top";
        break;

      case "MENU_CLOSE":
        newState.open = false;
        break;
    }

    this._setState(newState);

    this.render();
  },
  _setState: function _setState(newState) {
    // events
    if (this.options.onSelect && newState.selected && (this.options.multi && newState.selected.length !== this.state.selected.length || !this.options.multi && newState.selected !== this.state.selected)) {
      this.options.onSelect(newState.selected);
    }

    if (this.options.onGroupOpen && newState.open && newState.open !== this.state.open) {
      /* console.log("group open"); */
      this.options.onGroupOpen(newState.open);
    }

    if (this.options.onOpen && newState.open === "top") {
      this.options.onOpen();
    }

    if (this.options.onClose && !newState.open) {
      this.options.onClose();
    }

    this.state = Object.assign(this.state, newState);
  },
  _isGroup: function _isGroup(item) {
    return "items" in item;
  },
  _isSelected: function _isSelected(item) {
    var sel = this.state.selected;

    if (sel) {
      if (this._isGroup(item)) {
        if ("children" in item) {
          return this.options.multi ? sel.find(function (s) {
            return item.children.includes(s);
          }) : item.children.includes(sel);
        } else {
          return false;
        }
      }

      return this.options.multi ? sel.indexOf(item.value) > -1 : sel === item.value;
    } else {
      return false;
    }
  },
  _isOpen: function _isOpen(item) {
    var open = this.state.open;
    return open && (open === item.value || item.children.includes(open));
  },
  _hideMenu: function _hideMenu() {
    this._emit("MENU_CLOSE", {});
  },
  _iconClicked: function _iconClicked() {
    this._emit("MENU_OPEN", {});
  },
  _itemClicked: function _itemClicked(item) {
    if (this._isGroup(item)) {
      this.state.open === item.value ? this._emit("GROUP_CLOSE", {
        item: item
      }) : this._emit("GROUP_OPEN", {
        item: item
      });
    } else {
      this._emit("ITEM_SELECT", {
        item: item
      });
    }
  },
  _renderRadioIcon: function _renderRadioIcon(selected, contentDiv) {
    var radio = L.DomUtil.create("span", "radio icon", contentDiv);
    radio.innerHTML = selected ? this.options.iconChecked : this.options.iconUnchecked;
  },
  _renderGroupIcon: function _renderGroupIcon(selected, contentDiv) {
    var group = L.DomUtil.create("span", "group icon", contentDiv);
    group.innerHTML = selected ? this.options.iconGroupChecked : this.options.iconGroupUnchecked;
  },
  _renderItem: function _renderItem(item, menu) {
    var _this2 = this;

    var selected = this._isSelected(item);

    var p = L.DomUtil.create("div", "leaflet-control-select-menu-line", menu);
    var pContent = L.DomUtil.create("div", "leaflet-control-select-menu-line-content", p);
    var textSpan = L.DomUtil.create("span", "text", pContent);
    textSpan.innerHTML = item.label;

    if (this._isGroup(item)) {
      this._renderGroupIcon(selected, pContent); // adding classes to groups and opened group


      L.DomUtil.addClass(p, "group");
      this._isOpen(item) && L.DomUtil.addClass(p, "group-opened");
      this._isOpen(item) && this._renderMenu(p, item.items);
    } else {
      this._renderRadioIcon(selected, pContent);
    }

    L.DomEvent.addListener(pContent, "click", function (e) {
      _this2._itemClicked(item);
    });
    return p;
  },
  _renderMenu: function _renderMenu(parent, items) {
    var _this3 = this;

    var menu = L.DomUtil.create("div", "leaflet-control-select-menu leaflet-bar ", parent);
    this.menus.push(menu);
    items.map(function (item) {
      _this3._renderItem(item, menu);
    });
  },
  _clearMenus: function _clearMenus() {
    this.menus.map(function (menu) {
      return menu.remove();
    });
    this.meus = [];
  },
  render: function render() {
    this._clearMenus();

    if (this.state.open) {
      this._renderMenu(this.container, this.options.items);
    }
  },

  /* public methods */
  close: function close() {
    this._hideMenu();
  }
});

L.control.select = function (options) {
  return new L.Control.Select(options);
};


//função que organiza o vetor por ordem alfabética de nome de usina
function organizaAlfabeto(valor){
  var auxi;
  for(var i =0;i<valor.length;i++){
    for(var j=0;j<valor.length;j++){
      if(valor[i]['Usina hidrelétrica']<valor[j]['Usina hidrelétrica']){
        auxi = valor[j];
        valor[j] = valor[i];
        valor[i] = auxi;
      }
    }
  }
  auxi = valor[139]

  for(var i=valor.length-1;i>=2;i--){
    valor[i] = valor[i-1]
  }
  valor[1] = auxi;
  return valor;
}

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

var data = data1, vtr = data1;
data = organizaVetor(data);


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

vtr = organizaAlfabeto(vtr);

//função que ajusta o tamanho dos círculos de acordo com o nivel de zoom
map.on("zoomend", function(){
  var zoomAtual = map.getZoom();
  var porcentagem  = prevZoom/zoomAtual
      prevZoom = map.getZoom();
      for(var i=0;i<data.length;i++){
          raios[i] = raios[i]*porcentagem; 
          raios1[i] = raios1[i]*porcentagem; 
          circle[i].setRadius(raios[i]);
          circle1[i].setRadius(raios1[i]);
          
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

var items = [];
for(var i =0;i<data.length;i++){
  items.push({label: vtr[i]['Usina hidrelétrica'], value: vtr[i]['Coordenadas']}); 
}
// funçaõ utilizada para criar o 'menu' de pesquisa ao lado esquerdo
L.control.select({
  position: "topleft",
  selectedDefault: false,
  items: items,
  onSelect: function (newItemValue) {
    map.flyTo(newItemValue, 7);
  },
  })
  .addTo(map);
