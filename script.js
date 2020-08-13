// function resize the canvas
(function () {
    var canvas = document.getElementById('myCanvas'),
        context = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = 1050;
        canvas.height = 550;
    }
    resizeCanvas();
})();

//get coords of mouseclick
var MouseCoords = {
    getX: function (e) {
        if (e.pageX) {
            return e.pageX;
        }
        else if (e.clientX) {
            return e.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft) - document.documentElement.clientLeft;
        }
        return 0;
    },
    getY: function (e) {
        if (e.pageY) {
            return e.pageY;
        }
        else if (e.clientY) {
            return e.clientY + (document.documentElement.scrollTop || document.body.scrollTop) - document.documentElement.clientTop;
        }
        return 0;
    }
}

var canvas = document.getElementById("myCanvas");
canvas.addEventListener("click", handleClick);
canvas.addEventListener("click", showCoords);

document.addEventListener("click", drawPointsCircles);
document.addEventListener("click", figuresMoving);
document.addEventListener("click", showArea);



class Point {
    constructor(x, y) {
        this.X = x;
        this.Y = y;
    }
}

var arrayPoints = [];
const radius = 5.5;

//straight line equations
function GetKCoeficient(p1, p2) {
    return (p2.Y - p1.Y) / (p2.X - p1.X);
}

function GetFreeCoeficient(p1, p2) {
    return p1.Y - p1.X * GetKCoeficient(p1, p2);
}

function GetGravityPoint(p1, p2, p3, p4) {
    var k1 = GetKCoeficient(p1, p2);
    var k2 = GetKCoeficient(p3, p4);
    var c1 = GetFreeCoeficient(p1, p2);
    var c2 = GetFreeCoeficient(p3, p4);

    var x = (c2 - c1) / (k1 - k2);
    var y = k1 * x + c1;
    let gravityPoint = new Point(x, y);
    return gravityPoint;
}

//vector equations to calculate the area
function GetVector(p1, p2) {
    let vector = new Point(p2.X - p1.X, p2.Y - p1.Y);
    return vector;
}

function GetLengthVector(v) {
    return Math.sqrt(v.X * v.X + v.Y * v.Y);
}

function GetDot(v1, v2) {
    return (v1.X * v2.X + v1.Y * v2.Y);
}

function GetCosAngle(v1, v2) {
    return GetDot(v1, v2) / (GetLengthVector(v1) * GetLengthVector(v2));
}

function GetSinAngle(v1, v2) {
    var cos = GetCosAngle(v1, v2);
    return Math.sqrt(1 - cos * cos);
}

//parallelogram area
function getArea() {
    var v1 = GetVector(arrayPoints[0], arrayPoints[1]);
    var v2 = GetVector(arrayPoints[0], arrayPoints[2]);

    var a = GetLengthVector(v1);
    var b = GetLengthVector(v2);

    var sin = GetSinAngle(v1, v2);

    var area = a * b * sin;
    return area;
}

//get X for 4th point
function GetX(p1, p2, p3) {
    var k01 = GetKCoeficient(p1, p2);
    var k02 = GetKCoeficient(p1, p3);
    var x = (k01 * p3.X - k02 * p2.X + p2.Y - p3.Y) / (k01 - k02);
    return x;
}

//get Y for 4th point
function GetY(p1, p2, p3) {
    var x = GetX(p1, p2, p3);
    var k01 = GetKCoeficient(p1, p2);
    var y = k01 * (x - p3.X) + p3.Y;
    return y;
}

//push mousecoords to the array
function handleClick(e) {

    if (arrayPoints.length < 3) {
        let point = new Point(MouseCoords.getX(e), MouseCoords.getY(e));
        arrayPoints.push(point);

        //get 4th point coordinate and push to the array
        if (arrayPoints.length == 3) {
            var x = GetX(arrayPoints[0], arrayPoints[1], arrayPoints[2]);
            var y = GetY(arrayPoints[0], arrayPoints[1], arrayPoints[2]);
            let point4 = new Point(x, y);
            arrayPoints.push(point4);

            //draw figures after getting 4th point coordinate
            drawParallelogram();
            drawCircle();
        }
    }
}

function IsInRange(p1, click) {
    return Math.abs(p1.X - click.X) < radius
        && Math.abs(p1.Y - click.Y) < radius;
}

function figuresMoving() {
    var canvas = document.getElementById("myCanvas"),
        context = canvas.getContext("2d"),
        w = canvas.width,
        h = canvas.height;

    var mouse = { x: 0, y: 0 };
    var selectedPoint = -1;

    canvas.addEventListener("mousedown", function (e) {
        mouse.x = e.pageX - this.offsetLeft;
        mouse.y = e.pageY - this.offsetTop;
        context.beginPath();
        context.moveTo(mouse.x, mouse.y);

        let pressedPoint = new Point(mouse.x, mouse.y);

        arrayPoints.forEach(p => {
            if (IsInRange(p, pressedPoint)) {
                selectedPoint = arrayPoints.indexOf(p);
            }
        });
    });

    canvas.addEventListener("mousemove", function (e) {

        if (selectedPoint != -1) {

            mouse.x = e.pageX - this.offsetLeft;
            mouse.y = e.pageY - this.offsetTop;
            context.lineTo(mouse.x, mouse.y);

            context.stroke();

            if (selectedPoint == 0) {
                arrayPoints[0] = new Point(mouse.x, mouse.y);
                var x = GetX(arrayPoints[2], arrayPoints[0], arrayPoints[3]);
                var y = GetY(arrayPoints[2], arrayPoints[0], arrayPoints[3]);
                let point1 = new Point(x, y);
                arrayPoints[1] = point1;
            }
            else if (selectedPoint == 1) {
                arrayPoints[1] = new Point(mouse.x, mouse.y);
                var x = GetX(arrayPoints[3], arrayPoints[1], arrayPoints[2]);
                var y = GetY(arrayPoints[3], arrayPoints[1], arrayPoints[2]);
                let point2 = new Point(x, y);
                arrayPoints[0] = point2;
            }
            else if (selectedPoint == 2) {
                arrayPoints[2] = new Point(mouse.x, mouse.y);
                var x = GetX(arrayPoints[3], arrayPoints[2], arrayPoints[1]);
                var y = GetY(arrayPoints[3], arrayPoints[2], arrayPoints[1]);
                let point3 = new Point(x, y);
                arrayPoints[0] = point3;
            }
            else if (selectedPoint == 3) {
                arrayPoints[3] = new Point(mouse.x, mouse.y);
                var x = GetX(arrayPoints[2], arrayPoints[3], arrayPoints[0]);
                var y = GetY(arrayPoints[2], arrayPoints[3], arrayPoints[0]);
                let point4 = new Point(x, y);
                arrayPoints[1] = point4;
            }

            context.clearRect(0, 0, 1050, 550);

            drawAllContent(e);
        }
    });

    canvas.addEventListener("mouseup", function (e) {
        selectedPoint = -1;
        drawAllContent(e);
    });
}

//function to clear coords display
function clearBox(elementID) {
    document.getElementById(elementID).innerHTML = "Координаты при клике";
}

function showCoords(e) {
    if (arrayPoints.length == 4) {
        clearBox('mouse_coords_on_click');

        if (!e) e = window.event;
        {
            var mouseCoordsLayer = document.getElementById('mouse_coords_on_click');

            for (var i = 0; i < arrayPoints.length + 1; i++) {
                mouseCoordsLayer.innerHTML += '<p>X' + (i + 1) + ': ' + arrayPoints[i].X + '; Y' + (i + 1) + ': ' + arrayPoints[i].Y + '</p>';
            }
        }
    }
}

//info about program
function aboutInfo(e) {
    alert(`
Програма строит  параллелограмм по  выбраннымм пользователем трем точкам, рассчитывает площадь фигуры и строит круг с такой же площадью и центром масс, как у параллелограмма.
Доступна функция изменения отображенных фигур. Чтобы начать заново нажмите кнопку "Refresh Page".
Aвтор - Харченко Елена`);
}
var about = document.getElementById("alert");
about.addEventListener("click", aboutInfo);


function showArea(e) {
    if (!e) e = window.event;

    var area = document.getElementById("area");
    area.innerHTML = 'Площадь фигур: ' + getArea() + 'px';
}

//#region Drawing
function drawAllContent(e) {
    drawPointsCircles(e);
    drawParallelogram(e);
    drawCircle(e);
}

function drawCircle(e) {
    var gp = GetGravityPoint(arrayPoints[0], arrayPoints[3], arrayPoints[1], arrayPoints[2]);
    var r = Math.sqrt(getArea() / Math.PI);

    var canvas = document.getElementById('myCanvas');
    var context = canvas.getContext('2d');
    context.strokeStyle = "yellow";
    context.beginPath();
    context.arc(gp.X, gp.Y, r, 0, Math.PI * 2, false);
    context.closePath();
    context.stroke();
}

function drawPointsCircles(e) {

    var canvas = document.getElementById('myCanvas');

    if (canvas.getContext) {

        var context = canvas.getContext('2d');
        context.strokeStyle = "red";

        arrayPoints.forEach(point => {
            context.beginPath();
            context.arc(point.X, point.Y, radius, 0, Math.PI * 2, false);
            context.closePath();
            context.stroke();
        });
    }
}

function drawParallelogram(e) {
    var canvas = document.getElementById('myCanvas');
    if (canvas.getContext) {
        var context = canvas.getContext('2d');
        context.strokeStyle = "blue";
        context.beginPath();
        context.moveTo(arrayPoints[0].X, arrayPoints[0].Y);
        context.lineTo(arrayPoints[1].X, arrayPoints[1].Y);
        context.lineTo(arrayPoints[3].X, arrayPoints[3].Y);
        context.lineTo(arrayPoints[2].X, arrayPoints[2].Y);
        context.closePath();
        context.stroke();
    };
}
//#endregion
