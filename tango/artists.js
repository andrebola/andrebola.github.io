
    var nodes = null;
    var edges = null;
    var network = null;

    // Called when the Visualization API is loaded.
    function draw() {
        $.getJSON("network-artists.json", function(json) {
            nodes = json; 
        $.getJSON("network-relations.json", function(json2) {
        edges = json2;
        
      // create people.
      // value corresponds with the age of the person
      // var DIR = '../data/clean/artist_img/';
      var DIR = '/img/';
      for (x in nodes) {
            if (nodes[x].hasOwnProperty('image')) {
            nodes[x].image = DIR+nodes[x].image;
            }else{
                nodes[x].image = DIR+"noimage.png"
            }
        }

      // create a network
      var container = document.getElementById('mynetwork');
      var data = {
        nodes: nodes,
        edges: edges
      };
      var options = {
        improvedLayout:true,
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
        }
      };
      network = new vis.Network(container, data, options);
      });
      });
    }
