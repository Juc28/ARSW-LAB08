var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    var _num = 0;
    var stompClient = null;

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };
    
    
    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };
    var addPolygonToCanvas = function (points) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        var cont = 1;
        ctx.fillStyle = '#721682';
        ctx.beginPath();
        ctx.moveTo(points[0].x,points[0].y);
        points.filter((point,index) => {return index > 0}).map(function (point) {
            if (cont == 4){
                cont = 0;
                ctx.moveTo(point.x,point.y);
                System.out.println("Poligono");
            }else{
                ctx.lineTo(point.x, point.y);
            }
            cont++;
            ctx.stroke();
        });
        ctx.closePath();
        ctx.fill();
    };

    var connectAndSubscribe = function (callback) {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);

        //subscribe to /topic/newpoint+num when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint.'+_num, function (eventbody) {
                var theObject = JSON.parse(eventbody.body);
                //callback("New Point: " + theObject.x + " " + theObject.y);
                callback(new Point(theObject.x,theObject.y));
            });
            stompClient.subscribe("/topic/newpolygon." + _num, function(eventbody) {
                var theObject = JSON.parse(eventbody.body);
                addPolygonToCanvas(theObject);
            });
        });

    };
    
    

    return {

        init: function () {
            var can = document.getElementById("canvas");
            can.addEventListener("pointerdown",function (evt) {
                var clickPosition = getMousePosition(evt);
                app.publishPoint(clickPosition.x,clickPosition.y);
            });
            //websocket connection
            //connectAndSubscribe(alert);
            connectAndSubscribe(addPointToCanvas);
        },

        publishPoint: function(px,py){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            addPointToCanvas(pt);

            //publicar el evento
            //stompClient.send("/topic/newpoint", {}, JSON.stringify(pt));
            //stompClient.send("/topic/newpoint"+_num, {}, JSON.stringify(pt));
            stompClient.send("/app/newpoint."+_num, {}, JSON.stringify(pt));
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");

    },

        setNumDibujo: function() {
        var num = prompt("Ingrese el número de su dibujo: ", "");
        if (num == null){
            num = 0;
            alert("Número incorrecto, se le asignó el 0");
        }
        else{
            _num = num;
            document.getElementById("dibujoNum").innerHTML = _num ;
        }
    }
    };

})();