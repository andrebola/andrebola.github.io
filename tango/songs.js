/*

Canciones:

Filtros por año, genero y artista (puede haber otros como epoca).
Solo se muestran resultados con menos de 30 elementos.

Una vez filtrados se muestra el grafo con las relaciones correspondiendtes a artistas en comun.
Cuando se hace click en un nodo, se muestra la letra y toda la informacion que se tenga. Además se muestra una recomendacion de 5 elementos.

*/

// Load songs data

// Loads songs relations

// add events to filters

// Show results given a set of filters

// add select node event

var genres= ['Tango', 'Vals', 'Milonga', 'Canción', 'Jota', 'Foxtrot', 'Candombe', 'Ranchera', 'Rumba', 'Zamba', 'Polca/Tango', 'Rezo gaucho', 'Poema lunfardo', 'Marcha', 'Bolero', 'Tonada campera', 'Estilo', 'Polca', 'Poema evocativo', 'Gato', 'Chacarera', 'Poema', 'Guajira', 'Canción criolla', 'Corrido', 'Pericón', 'Milonga candombe', 'Tonada', 'Tonada salteña', 'Arr. en tango', 'Cueca', 'Pasodoble', 'Triunfo', 'Triste campero', 'Balada', 'Fox Bolero', 'Canción del litoral', 'Huella', 'Clásico', 'Aire de bailecito', 'Habanera', 'Chamamé', 'Recitado cómico', 'Shimmy', 'Canción ciudadana', 'Fado', 'Mazurca', 'Milongón', 'Murga', 'Bambuco', 'Cifra', 'Aire de malambo', 'Vals peruano', 'Camel-step', 'Canción-vals', 'Vidalita', 'Media cifra', 'Arr. en vals', 'Murga candombe', 'Tango-chamamé', 'Vals jota', 'Canción serrana', 'Fox charleston', 'Canción-tango', 'Bailecito', 'Tango balada', 'Litoraleña', 'Aire de zamba', 'Lazo', 'Sobrepaso', 'Tarantella', 'Tango-estilo', 'Samba', 'Java canción', 'Chamarrita']

var song_ids_map = {};
var songs = null;
var relations = null;
var filtered_songs = null;
var artists = null;
var lyrics = null;
var artist_song_map = null;
var from_year_filter = 1900;
var to_year_filter = 2018;
var genre_filter = null;
var artist_filter = null;
var selectedNode = null;
var artistsNetwork = null;
var artistsNetworkRels = null;

function update_filters(initializefiltered=true, intersectSongIds=null){
    from_year_filter = $( "#slider-range" ).slider( "values", 0 );
    to_year_filter = $( "#slider-range" ).slider( "values", 1 );
    artist_filter = null;
    if ($( "#artists" ).val() != 'all') {
        artist_filter = parseInt($( "#artists" ).val());
    }
    genre_filter = null;
    if ($( "#genres" ).val() != 'all') {
        genre_filter = $( "#genres" ).val();
    }
    if ($( "#epochs" ).val() != 'all') {
        if ($( "#epochs" ).val() == 0) {
            from_year_filter = Math.max(from_year_filter, 1900);
            to_year_filter = Math.min(to_year_filter, 1930);
        }else if ($( "#epochs" ).val() == 1) {
            from_year_filter = Math.max(from_year_filter, 1930);
            to_year_filter = Math.min(to_year_filter, 1945);
        }else if ($( "#epochs" ).val() == 2) {
            from_year_filter = Math.max(from_year_filter, 1945);
            to_year_filter = Math.min(to_year_filter, 1970);
        }else {
            from_year_filter = Math.max(from_year_filter, 1970);
            to_year_filter = Math.min(to_year_filter, 2018);
        }
    }
    
    if (initializefiltered){
        filtered_songs = [];
    }
    for (x in songs) {
      if (filtered_songs.indexOf(songs[x]) == -1 && songs[x].year >= from_year_filter && songs[x].year <= to_year_filter) {
          if (genre_filter == null || songs[x].genre == genre_filter) {
            if (artist_filter == null || songs[x].composers.indexOf(artist_filter) >= 0 || songs[x].lyricists.indexOf(artist_filter) >= 0 ) {
                if (intersectSongIds == null || intersectSongIds.indexOf(String(songs[x].id)) >= 0){
                  filtered_songs.push(songs[x]);
                }
            }
        }
      }
    }
    loadGraph();
}

function centerFilters(){
    var f_artist = null;
    for (a in selectedNode.lyricists){
        f_artist = artists[selectedNode.lyricists[a]].id
    }
    if (f_artist == null){
        for (a in selectedNode.composers){
        f_artist = artists[selectedNode.composers[a]].id
        }
    }
    if (f_artist != null){
        artist_filter = f_artist;
        $( "#artists" ).val(f_artist);
    }
    yearsRange = Math.floor((to_year_filter - from_year_filter) / 2);
    from_year_filter = selectedNode.year - yearsRange;
    to_year_filter = selectedNode.year + yearsRange;
    $("#slider-range" ).slider( "values", 0, from_year_filter);
    $("#slider-range" ).slider( "values", 1, to_year_filter);
    $( "#years" ).val( from_year_filter + " - " + to_year_filter );
    genre_filter = selectedNode.genre; 
    $( "#genres" ).val(genre_filter);
}
$(document).ready(function(){
    $.getJSON("network-songs.json", function(json) {
      songs = []; 
      var DIR = '/img/';
      for (x in json) {
        node = json[x];
        if (node.hasOwnProperty('image') && node.image != null) {
          node.image = DIR+node.image;
        }else{
          node.image = DIR+"noimage.png"
        }
        songs.push(node);
      }
      loadGraph();
      
      for (x in songs) {
          song_ids_map[songs[x].id] = x;
        }
    });
    $.getJSON("network-songs-relations.json", function(json2) {
      relations = json2;
      loadGraph();
    });
    $.getJSON("artists.json", function(json) {
      artists = json;
      artists[1794].name = "Carlos Gardel"; // Hard-code Gardel because doesn't have name
      $.getJSON("artist_song_map.json", function(json2) {
        artist_song_map = json2;
        var all_items = [];
        var artists_keys = Object.keys(artist_song_map);
        for (x in artists_keys) {
            all_items.push({val:artists_keys[x], name:artists[artists_keys[x]].name});
        };
        all_items.sort(function(a, b) { 
            if(a.name < b.name) return -1;
            if(a.name > b.name) return 1;
            return 0;
        })
        for (x in all_items) {
            $('#artists').append($('<option></option>').val(all_items[x].val).html(all_items[x].name));
        };
      });
    });
    
    for (x in genres) {
        $('#genres').append($('<option></option>').val(genres[x]).html(genres[x]));
    };
    
    $( "#slider-range" ).slider({
      range: true,
      min: 1900,
      max: 2018,
      values: [ 1915, 1920 ],
      slide: function( event, ui ) {
        $( "#years" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );
      }
    });
    $( "#years" ).val( $( "#slider-range" ).slider( "values", 0 ) +
      " - " + $( "#slider-range" ).slider( "values", 1 ) );
    
    $( "#filter" ).click(function(){
      update_filters();
    });
    $.getJSON("lyrics.json", function(json) {
      lyrics = json; 
    });
    $.getJSON("similar_songs.json", function(json) {
      similar_songs = json; 
    });    
    
    $("#set-filters-atrs").click(function(){
        centerFilters();
        update_filters();
    });
    $("#set-filters-simil").click(function(){
       filtered_songs = [];
       //filtered_songs.push(selectedNode);
       for (x in similar_songs[selectedNode.id]) {
           var s_id = similar_songs[selectedNode.id][x];
           var song = songs[song_ids_map[s_id]];
           filtered_songs.push(song);
       }
       loadGraph();
    });
    $("#set-filters-inter").click(function(){
       similar = similar_songs[selectedNode.id];
       //similar.push(selectedNode.id);
       update_filters(true, similar);
    });
    $("#set-filters-union").click(function(){
       filtered_songs = [];
       for (x in similar_songs[selectedNode.id]) {
           var s_id = similar_songs[selectedNode.id][x];
           var song = songs[song_ids_map[s_id]];
           filtered_songs.push(song);
       }
       update_filters(false);
    });
    
    $.getJSON("network-artists-lyrics.json", function(json) {
       artistsNetwork = []; 
       var DIR = '/img/';
        for (x in json) {
            node = json[x];
            if (node.hasOwnProperty('image') && node.image != null) {
            node.image = DIR+node.image;
            }else{
            node.image = DIR+"noimage.png";
            }
            artistsNetwork.push(node);
        }
    });
    $.getJSON("network-relations-lyrics.json", function(json2) {
       artistsNetworkRels = json2;
    });
})

function loadGraph(){
    if (filtered_songs != null && relations != null){
        if( filtered_songs.length < 200){
      var nodes = [];
      var edges = [];
      var network = null;
      
      var node_ids = [];
      var artists_ids = [];
      
      for (x in filtered_songs) {
        node = filtered_songs[x];
        node.shape = 'circularImage';
        node.color = {background:'#000', border:'#ccc'}
        node_ids.push(node.id);
        nodes.push(node);
        
        for (a in node.composers){
              artists_ids.push(node.composers[a]);
        }
        for (a in node.lyricists){
              artists_ids.push(node.lyricists[a]);
        }
        
      }
      
      for (x in relations) {
        if (node_ids.includes(relations[x].from) && node_ids.includes(relations[x].to)) {
          edges.push(relations[x]);
        }
      }
      
      // create a network
      var container = document.getElementById('mynetwork');
      var data = {
        nodes: nodes,
        edges: edges
      };
      var options = {
        nodes: {
          borderWidth:4,
          size:30,
	      color: {
            border: '#222222',
            background: '#666666'
          },
          font:{color:'#eeeeee'}
        },
        edges: {
          color: 'lightgray'
        },
        physics: {
        maxVelocity: 20,
        solver: 'barnesHut',
        timestep: 0.35,
        stabilization: {
            enabled: true,
            iterations: 1000,
            updateInterval: 25,
            fit: true
          }
        }
      };
      network = new vis.Network(container, data, options);   
      network.on("selectNode", function(params) {
        var displayNode = songs[song_ids_map[params.nodes[0]]];
        
        if (displayNode != null) {
          $('#selected-btns').show();
          $('#song-name').html('<a target="_blank" href="'+ displayNode.link+'">' + displayNode.label+"</a>");
          var composers = ""
          for (a in displayNode.composers){
              composers += '<a target="_blank" href="' + artists[displayNode.composers[a]].external_id.todotango+'">' + artists[displayNode.composers[a]].name+"</a>, ";
          }
          $('#song-composers').html(composers);
          var lyricists = ""
          for (a in displayNode.lyricists){
              lyricists += '<a target="_blank" href="' + artists[displayNode.lyricists[a]].external_id.todotango+'">' + artists[displayNode.lyricists[a]].name+"</a>, ";
          }
          $('#song-lyricists').html(lyricists);
          $('#song-genre').html(displayNode.genre);
          $('#song-year').html(displayNode.year);
          $('#song-lyric').html(lyrics[displayNode.id].replace(/[\r\n]/g, "<br />"));

          similar = "<table><tr><th>Posición</th><th>Título</th><th>Año</th><th>Género</th></tr>";
          for (s in similar_songs[displayNode.id].slice(0, 10)){
              similar_song_id = similar_songs[displayNode.id][s];
              song = songs[song_ids_map[similar_song_id]];
              console.log(song);
              similar += "<tr><td>" +(parseInt(s)+1) +'</td><td><a target="_blank" href="'+ song.link+'">' + song.label+"</a></td><td>"+ song.year+"</td><td>"+ song.genre +"</td></tr>";
          }
          similar += "</table>";
          $('#similar-songs').html(similar);
          selectedNode = displayNode;
        }
            
        }); 
      

      var network = null;      
      var art_nodes = [];
      
      for (x in artistsNetwork) {
        node = artistsNetwork[x];
        if (artists_ids.indexOf(node.id) >= 0 ){
          node.shape = 'circularImage';
          node.color = {background:'#000', border:'#ccc'}
          art_nodes.push(node);
        }
      }
      
      
      var art_container = document.getElementById('authornetwork');
      var art_data = {
        nodes: art_nodes,
        edges: artistsNetworkRels
      };
      var art_options = {
        nodes: {
          borderWidth:4,
          size:20,
	      color: {
            border: '#222222',
            background: '#666666'
          },
          font:{color:'#eeeeee'}
        },
        edges: {
          color: 'lightgray'
        },
      };
      var artNetwork = new vis.Network(art_container, art_data, art_options);   
    }else{
        alert("No se pueden mostrar más de 200 elementos. Por favor, refinar la búsqueda.")
    }
    }
}

