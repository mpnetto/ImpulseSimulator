
const { Engine, Render, World, Runner, Bodies, MouseConstraint, Mouse, Constraint } = Matter;

var engine = Engine.create({
    positionIterations: 50,
    velocityIterations: 10,
});
const { world } = engine;
engine.world.gravity.y = 0;


const width = 800;
const height = 600
const render = Render.create({
    element: document.getElementById('poolTable'),
    engine: engine,
    options: {
        width: width,
        height: height,
        wireframes: false,
        background: '#008000'
    },
});


Matter.Resolver._restingThresh = 0.001;
Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);
Matter.Resolver._restingThresh = 0.001;

let ground = Matter.Bodies.rectangle(400, 610, 810, 60, { isStatic: true, restitution: 1, friction: 0, render: { fillStyle: '#AA7744' } });
let roof = Matter.Bodies.rectangle(400, -10, 810, 60, { isStatic: true, restitution: 1, friction: 0, render: { fillStyle: '#AA7744' } });
let leftWall = Matter.Bodies.rectangle(-10, 300, 60, 620, { isStatic: true, restitution: 1, friction: 0, render: { fillStyle: '#AA7744' } });
let rightWall = Matter.Bodies.rectangle(810, 300, 60, 620, { isStatic: true, restitution: 1, friction: 0, render: { fillStyle: '#AA7744' } });


Matter.World.add(engine.world, [ground, roof, leftWall, rightWall,]);

let ballA = Bodies.circle(150, 200, 20, {
    density: 0.04,
    inertia: Infinity,
    restitution: 1,
    frictionAir: 0.01,
    render: {
        fillStyle: 'white'
    }
});

let ballB = Bodies.circle(450, 200, 20, {
    density: 0.04,
    inertia: Infinity,
    restitution: 1,
    frictionAir: 0.01,
    render: {
        fillStyle: 'red'
    }
});

ballA.previousVelocity = { x: ballA.velocity.x, y: ballA.velocity.y };
ballB.previousVelocity = { x: ballB.velocity.x, y: ballB.velocity.y };



World.add(world, [ballA, ballB]);


const mouse = Mouse.create(render.canvas);
let mouseConstraint = Matter.MouseConstraint.create(engine, {

    mouse: Matter.Mouse.create(render.canvas),
    constraint: {
        stiffness: 0.2,
        render: {
            visible: false
        }
    }
});
World.add(world, mouseConstraint);

Matter.Events.on(mouseConstraint, 'startdrag', function (event) {

    if (event.body === ballA || event.body === ballB) {
        event.source.mouse.button = -1;
    }
});

ballA.previousVelocity = { x: ballA.velocity.x, y: ballA.velocity.y };
ballB.previousVelocity = { x: ballB.velocity.x, y: ballB.velocity.y };

let ballAInitialVelocity = { x: 0, y: 0 };
let ballBInitialVelocity = { x: 0, y: 0 };

Matter.Events.on(engine, 'collisionStart', function (event) {
    var pairs = event.pairs;


    pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;

        if ((bodyA === ballA && bodyB === ballB) || (bodyB === ballA && bodyA === ballB)) {
            ballA.previousVelocity = { x: ballA.velocity.x, y: ballA.velocity.y };
            ballB.previousVelocity = { x: ballB.velocity.x, y: ballB.velocity.y };
        }
    })
});

Matter.Events.on(engine, 'collisionEnd', function (event) {
    var pairs = event.pairs;


    pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;


        if ((bodyA === ballA && bodyB === ballB) || (bodyB === ballA && bodyA === ballB)) {

            var bodyA_mass = pair.bodyA.mass;
            var bodyB_mass = pair.bodyB.mass;
            var bodyA_speed_change = Math.hypot(pair.bodyA.velocity.x - pair.bodyA.previousVelocity.x, pair.bodyA.velocity.y - pair.bodyA.previousVelocity.y);
            var bodyB_speed_change = Math.hypot(pair.bodyB.velocity.x - pair.bodyB.previousVelocity.x, pair.bodyB.velocity.y - pair.bodyB.previousVelocity.y);
            var impactForceA = bodyA_mass * bodyA_speed_change;
            var impactForceB = bodyB_mass * bodyB_speed_change;

            impactForceADisplay.textContent = impactForceA.toFixed(2);

            impactForceBDisplay.textContent = impactForceB.toFixed(2);

            pair.bodyA.previousVelocity = { x: pair.bodyA.velocity.x, y: pair.bodyA.velocity.y };
            pair.bodyB.previousVelocity = { x: pair.bodyB.velocity.x, y: pair.bodyB.velocity.y };

        }
    })
});

const elasticityInput = document.getElementById('elasticity');
const densityInput = document.getElementById('density');
const frictionInput = document.getElementById('friction');

const elasticityADisplay = document.getElementById('elasticityADisplay');
const densityADisplay = document.getElementById('densityADisplay');
const elasticityBDisplay = document.getElementById('elasticityBDisplay');
const densityBDisplay = document.getElementById('densityBDisplay');
const frictionDisplay = document.getElementById('frictionDisplay');


elasticityADisplay.addEventListener('change', (e) => {
    const elasticity = parseFloat(e.target.value);
    Matter.Body.set(ballA, 'restitution', elasticity);
});

densityADisplay.addEventListener('change', (e) => {
    const mass = parseFloat(e.target.value);
    const density = (mass / ballA.area);
    Matter.Body.setDensity(ballA, density);
});

elasticityBDisplay.addEventListener('change', (e) => {
    const elasticity = parseFloat(e.target.value);
    Matter.Body.set(ballB, 'restitution', elasticity);
});

densityBDisplay.addEventListener('change', (e) => {
    const mass = parseFloat(e.target.value);
    const density = (mass / ballA.area);
    Matter.Body.setDensity(ballB, density);
});

frictionInput.addEventListener('change', (e) => {
    frictionDisplay.value = e.target.value
    const friction = parseFloat(e.target.value);

    Matter.Body.set(ballA, 'friction', friction);
    Matter.Body.set(ballB, 'friction', friction);
    Matter.Body.set(ground, 'friction', friction);

    Matter.Body.set(ballA, 'frictionAir', friction);
    Matter.Body.set(ballB, 'frictionAir', friction);
    Matter.Body.set(ground, 'frictionAir', friction);

    Matter.Body.set(ballA, 'frictionStatic', friction);
    Matter.Body.set(ballB, 'frictionStatic', friction);
    Matter.Body.set(ground, 'frictionStatic', friction);


});

frictionDisplay.addEventListener('change', (e) => {
    frictionInput.value = e.target.value
    const friction = parseFloat(e.target.value);

    Matter.Body.set(ballA, 'friction', friction);
    Matter.Body.set(ballB, 'friction', friction);
    Matter.Body.set(ground, 'friction', friction);

    Matter.Body.set(ballA, 'frictionAir', friction);
    Matter.Body.set(ballB, 'frictionAir', friction);
    Matter.Body.set(ground, 'frictionAir', friction);

    Matter.Body.set(ballA, 'frictionStatic', friction);
    Matter.Body.set(ballB, 'frictionStatic', friction);
    Matter.Body.set(ground, 'frictionStatic', friction);


});


var proportionConstant = 0.0001;

let mouseStart = null;

render.canvas.addEventListener('mousedown', (e) => {
    if (ballA.velocity.x <= 0.1 && ballA.velocity.y <= 0.1) {
        mouseStart = true;
    }
});

render.canvas.addEventListener('mousemove', (e) => {
    if (mouseStart) {

        const dx = ballA.position.x - mouse.position.x;
        const dy = ballA.position.y - mouse.position.y;

        const forceMagnitude = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)) * 4;

        forceADisplay.textContent = forceMagnitude.toFixed(2);

    }
});


render.canvas.addEventListener('mouseup', (e) => {
    if (mouseStart) {

        const dx = ballA.position.x - mouse.position.x;
        const dy = ballA.position.y - mouse.position.y;

        var forceMagnitude = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)) * proportionConstant;
        const forceDirection = { x: dx * forceMagnitude, y: dy * forceMagnitude };

        Matter.Body.applyForce(ballA, ballA.position, forceDirection);

        mouseStart = null;

    }
});


const speedADisplay = document.getElementById('ballASpeed');
speedADisplay.textContent = '0';

const speedBDisplay = document.getElementById('ballBSpeed');
speedBDisplay.textContent = '0';

const momentumADisplay = document.getElementById('ballAMomentum');
momentumADisplay.textContent = '0';

const momentumBDisplay = document.getElementById('ballBMomentum');
momentumBDisplay.textContent = '0';

const kineticADisplay = document.getElementById('ballAKinetic');
kineticADisplay.textContent = '0';

const kineticBDisplay = document.getElementById('ballBKinetic');
kineticBDisplay.textContent = '0';

const impactForceADisplay = document.getElementById('ballAImpactForce');
impactForceADisplay.textContent = '0';

const impactForceBDisplay = document.getElementById('ballBImpactForce');
impactForceBDisplay.textContent = '0';

const forceADisplay = document.getElementById('ballAForce');
forceADisplay.textContent = '0';

const kineticTotalDisplay = document.getElementById('totalKinetic');
kineticTotalDisplay.textContent = '0';


function drawForceArrow() {

    let arrowEnd = {
        x: ((ballA.position.x - mouse.position.x) * 4) + ballA.position.x,
        y: ((ballA.position.y - mouse.position.y) * 4) + ballA.position.y
    };

    render.context.beginPath();
    render.context.moveTo(arrowEnd.x, arrowEnd.y);
    render.context.lineTo(ballA.position.x, ballA.position.y);
    render.context.strokeStyle = 'white';
    render.context.lineWidth = 3;
    render.context.stroke();
}

function calculateMomentum(body) {
    console.log( Math.sqrt(Math.pow(calculateMom(body.mass, body.velocity.x), 2) + Math.pow(calculateMom(body.mass, body.velocity.x), 2)))

    return Math.sqrt(Math.pow(calculateMom(body.mass, body.velocity.x), 2) + Math.pow(calculateMom(body.mass, body.velocity.x), 2));
}

function calculateMom(mass, speed) {

    return mass * speed;
}

function calculateKineticEnergy(body) {
    var kineticEnergy = 0.5 * body.mass * body.speed ** 2;
    return kineticEnergy;
}

let startTime = Date.now();

let svgWidth = 400, svgHeight = 200, margin = { top: 20, right: 20, bottom: 30, left: 50 };
let wid = svgWidth - margin.left - margin.right;
let hei = svgHeight - margin.top - margin.bottom;


let svg = d3.select("#kineticEnergyChart").append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

let g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let x = d3.scaleLinear().rangeRound([0, wid]);
let y = d3.scaleLinear().rangeRound([hei, 0]);

let line = d3.line()
    .x(function (d) { return x(d.time); })
    .y(function (d) { return y(d.kineticEnergy); });

let xAxis = g.append("g")
    .attr("transform", "translate(0," + hei + ")");
let yAxis = g.append("g");

svg.append("text")
    .attr("x", svgWidth / 2)
    .attr("y", svgHeight)
    .attr("text-anchor", "middle")
    .text("Tempo");

svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -svgHeight / 2)
    .attr("y", 0)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Energia Cinética Total")


let kineticEnergyDataBallA = [];
let kineticEnergyDataBallB = [];
let kineticEnergyDataTotal = [];


function renderKinectGraph() {
    let kineticEnergyBallA = calculateKineticEnergy(ballA);
    let kineticEnergyBallB = calculateKineticEnergy(ballB);

    let kineticEnergyBallTotal = kineticEnergyBallA + kineticEnergyBallB

    let currentTime = (Date.now() - startTime) / 1000;

    let maxTotalKineticEnergy = d3.max(kineticEnergyDataTotal, d => d.kineticEnergy);

    if (currentTime > 5) {
        kineticEnergyDataBallA.shift();
        kineticEnergyDataBallB.shift();
        kineticEnergyDataTotal.shift();
    }

    kineticEnergyDataBallA.push({ time: currentTime, kineticEnergy: kineticEnergyBallA });
    kineticEnergyDataBallB.push({ time: currentTime, kineticEnergy: kineticEnergyBallB });
    kineticEnergyDataTotal.push({ time: currentTime, kineticEnergy: kineticEnergyBallTotal });

    x.domain(d3.extent(kineticEnergyDataTotal, function (d) { return d.time; }));

    if (maxTotalKineticEnergy > 50000) {
        y.domain([0, 100000]);
    } else if (maxTotalKineticEnergy > 40000) {
        y.domain([0, 50000]);
    } else if (maxTotalKineticEnergy > 30000) {
        y.domain([0, 40000]);
    } else if (maxTotalKineticEnergy > 20000) {
        y.domain([0, 30000]);
    } else if (maxTotalKineticEnergy > 15000) {
        y.domain([0, 20000]);
    } else if (maxTotalKineticEnergy > 10000) {
        y.domain([0, 15000]);
    } else if (maxTotalKineticEnergy > 5000) {
        y.domain([0, 10000]);
    } else if (maxTotalKineticEnergy > 1000) {
        y.domain([0, 5000]);
    } else if (maxTotalKineticEnergy > 500) {
        y.domain([0, 1000]);
    } else if (maxTotalKineticEnergy > 200) {
        y.domain([0, 500]);
    } else {
        y.domain([0, 200]);
    }

    xAxis.call(d3.axisBottom(x));
    yAxis.call(d3.axisLeft(y));

    svg.selectAll("path").remove();


    g.append("path")
        .datum(kineticEnergyDataBallA)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", line);

    g.append("path")
        .datum(kineticEnergyDataBallB)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", line);

    g.append("path")
        .datum(kineticEnergyDataTotal)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", line);
}

let svgM = d3.select("#momentumEnergyChart").append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

let gM = svgM.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let xM = d3.scaleLinear().rangeRound([0, wid]);
let yM = d3.scaleLinear().rangeRound([hei, 0]);

let lineM = d3.line()
    .x(function (d) { return xM(d.time); })
    .y(function (d) { return yM(d.momentum); });

// Configurando os eixos
let xAxisM = gM.append("g")
    .attr("transform", "translate(0," + hei + ")");

let yAxisM = gM.append("g");

svgM.append("text")
    .attr("x", svgWidth / 2)
    .attr("y", svgHeight)
    .attr("text-anchor", "middle")
    .text("Tempo");

svgM.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -svgHeight / 2)
    .attr("y", 0)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Momentum Total")

let momentumDataBallA = [];
let momentumDataBallB = [];
let momentumDataTotal = [];


function renderMomentumGraph() {
    let momentumBallA = calculateMomentum(ballA);
    let momentumBallB = calculateMomentum(ballB);
    let totalMomentum = momentumBallA + momentumBallB;


    let currentTime = (Date.now() - startTime) / 1000;

    if (currentTime > 5) {
        momentumDataBallA.shift();
        momentumDataBallB.shift();
        momentumDataTotal.shift();
    }

    momentumDataBallA.push({ time: currentTime, momentum: momentumBallA });
    momentumDataBallB.push({ time: currentTime, momentum: momentumBallB });
    momentumDataTotal.push({ time: currentTime, momentum: totalMomentum });

    let maxTotalMomentum = d3.max(momentumDataTotal, d => d.momentum);


    xM.domain(d3.extent(momentumDataBallA, function (d) { return d.time; }));

    if (maxTotalMomentum > 50000) {
        yM.domain([0, 100000]);
    } else if (maxTotalMomentum > 40000) {
        yM.domain([0, 50000]);
    } else if (maxTotalMomentum > 30000) {
        yM.domain([0, 40000]);
    } else if (maxTotalMomentum > 20000) {
        yM.domain([0, 30000]);
    } else if (maxTotalMomentum > 15000) {
        yM.domain([0, 20000]);
    } else if (maxTotalMomentum > 10000) {
        yM.domain([0, 15000]);
    } else if (maxTotalMomentum > 5000) {
        yM.domain([0, 10000]);
    } else if (maxTotalMomentum > 1000) {
        yM.domain([0, 5000]);
    } else if (maxTotalMomentum > 500) {
        yM.domain([0, 1000]);
    } else if (maxTotalMomentum > 200) {
        yM.domain([0, 500]);
    }

    else {
        yM.domain([0, 200]);
    }

    xAxisM.call(d3.axisBottom(xM));
    yAxisM.call(d3.axisLeft(yM));

    svgM.selectAll("path").remove();

    gM.append("path")
        .datum(momentumDataBallA)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", lineM);

    gM.append("path")
        .datum(momentumDataBallB)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", lineM);

    gM.append("path")
        .datum(momentumDataTotal)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", lineM);
}

let pauseTime = Date.now();
setInterval(function () {

    if (!isPaused) {
        pauseTime = Date.now();
        renderKinectGraph()
        renderMomentumGraph()
    } else {
        startTime += Date.now() - pauseTime
        pauseTime = Date.now();
    }


}, 1);

Matter.Events.on(render, 'afterRender', function () {
    if (mouseStart) {
        drawForceArrow()
    }

    var momentumA = calculateMomentum(ballA);
    var momentumB = calculateMomentum(ballB);

    var kineticA = calculateKineticEnergy(ballA);
    var kineticB = calculateKineticEnergy(ballB);

    speedADisplay.textContent = `${ballA.speed.toFixed(2)}`;
    speedBDisplay.textContent = `${ballB.speed.toFixed(2)}`;

    momentumADisplay.textContent = `${momentumA.toFixed(2)}`;
    momentumBDisplay.textContent = `${momentumB.toFixed(2)}`;

    kineticADisplay.textContent = `${kineticA.toFixed(2)}`;
    kineticBDisplay.textContent = `${kineticB.toFixed(2)}`;

    let totalKineticEnergy = (kineticA + kineticB).toFixed(2);
    kineticTotalDisplay.textContent = totalKineticEnergy;

});

var pauseButton = document.getElementById('pauseButton');
var isPaused = false;
pauseButton.onclick = function () {
    pauseSimulation();
}

document.addEventListener('keydown', function (event) {
    if (event.keyCode === 32) {
        event.preventDefault();
        pauseSimulation();

    }
});

function pauseSimulation() {
    if (!isPaused) {
        runner.enabled = false;
        this.innerHTML = 'Resume';
    } else {
        runner.enabled = true;
        this.innerHTML = 'Pause';
    }
    isPaused = !isPaused;
}

