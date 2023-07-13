
// Carregar a biblioteca Matter.js
const { Engine, Render, World, Runner, Bodies, MouseConstraint, Mouse, Constraint } = Matter;

// Criação do engine
const engine = Engine.create();
const { world } = engine;
engine.world.gravity.y = 0;



// Criação do renderer
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

// Inicialização do renderer
Matter.Resolver._restingThresh = 0.001;
Render.run(render);
Runner.run(Runner.create(), engine);
Matter.Resolver._restingThresh = 0.001;
// // Criando as bordas da mesa de bilhar
let ground = Matter.Bodies.rectangle(400, 610, 810, 60, { isStatic: true, restitution: 1, friction: 0, render: { fillStyle: '#AA7744' } });
let roof = Matter.Bodies.rectangle(400, -10, 810, 60, { isStatic: true, restitution: 1, friction: 0, render: { fillStyle: '#AA7744' } });
let leftWall = Matter.Bodies.rectangle(-10, 300, 60, 620, { isStatic: true, restitution: 1, friction: 0, render: { fillStyle: '#AA7744' } });
let rightWall = Matter.Bodies.rectangle(810, 300, 60, 620, { isStatic: true, restitution: 1, friction: 0, render: { fillStyle: '#AA7744' } });

// Adicionando as bordas ao mundo
Matter.World.add(engine.world, [ground, roof, leftWall, rightWall,]);

// Criação das bolas
let ballA = Bodies.circle(150, 200, 20, {
    density: 0.04,
    restitution: 1,
    frictionAir: 0.01,
    render: {
        fillStyle: 'white'
    }
});

let ballB = Bodies.circle(450, 200, 20, {
    density: 0.04,
    restitution: 1,
    frictionAir: 0.01,
    render: {
        fillStyle: 'red'
    }
});

ballA.previousVelocity = { x: ballA.velocity.x, y: ballA.velocity.y };
ballB.previousVelocity = { x: ballB.velocity.x, y: ballB.velocity.y };



World.add(world, [ballA, ballB]);

// Criação das restrições do mouse
const mouse = Mouse.create(render.canvas);
let mouseConstraint = Matter.MouseConstraint.create(engine, {
    // Desabilita a interação com os corpos
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
    // Se o corpo é uma bola, pare a ação de arrastar
    if (event.body === ballA || event.body === ballB) {
        event.source.mouse.button = -1;
    }
});

ballA.previousVelocity = { x: ballA.velocity.x, y: ballA.velocity.y };
ballB.previousVelocity = { x: ballB.velocity.x, y: ballB.velocity.y };

let ballAInitialVelocity = { x: 0, y: 0 };
let ballBInitialVelocity = { x: 0, y: 0 };
let cueInitialVelocity = { x: 0, y: 0 };

Matter.Events.on(engine, 'collisionStart', function (event) {
    var pairs = event.pairs;


    pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;
        console.log(bodyA)
        console.log(bodyB)

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
            console.log(bodyA.velocity)
            console.log(bodyB.velocity)
            var bodyA_mass = pair.bodyA.mass;
            var bodyB_mass = pair.bodyB.mass;
            var bodyA_speed_change = Math.hypot(pair.bodyA.velocity.x - pair.bodyA.previousVelocity.x, pair.bodyA.velocity.y - pair.bodyA.previousVelocity.y);
            var bodyB_speed_change = Math.hypot(pair.bodyB.velocity.x - pair.bodyB.previousVelocity.x, pair.bodyB.velocity.y - pair.bodyB.previousVelocity.y);
            var impactForceA = bodyA_mass * bodyA_speed_change;
            var impactForceB = bodyB_mass * bodyB_speed_change;

            impactForceADisplay.textContent =  impactForceA.toFixed(2);

            impactForceBDisplay.textContent = impactForceB.toFixed(2);

            pair.bodyA.previousVelocity = { x: pair.bodyA.velocity.x, y: pair.bodyA.velocity.y };
            pair.bodyB.previousVelocity = { x: pair.bodyB.velocity.x, y: pair.bodyB.velocity.y };
            
        }
    })
});

// Funções de cálculo de força (esboço)
function calculateImpactForce(pair) {
    // Esta é uma simplificação. Na realidade, você precisa levar em conta a direção e a duração do impacto.
    return Math.abs(pair.separation) * Math.abs(pair.bodyA.velocity.x - pair.bodyB.velocity.x);
}

function calculateImpulseForce(pair) {
    // Esta é uma simplificação. Na realidade, você precisa levar em conta a direção e a duração do impulso.
    return Math.abs(pair.bodyA.mass * (pair.bodyA.velocity.x - pair.bodyA.velocityPrev.x));
}

// Função para exibir as forças
function displayForces(impactForce) {
    // Código para atualizar a interface do usuário com as novas forças

    document.getElementById('impact-force-a').innerText = 'Força de Impacto: ' + impactForce.toFixed(2);

}

// Captura dos elementos de interface do usuário
const elasticityInput = document.getElementById('elasticity');
const densityInput = document.getElementById('density');
const frictionInput = document.getElementById('friction');

const elasticityADisplay = document.getElementById('elasticityADisplay');
const densityADisplay = document.getElementById('densityADisplay');
const elasticityBDisplay = document.getElementById('elasticityBDisplay');
const densityBDisplay = document.getElementById('densityBDisplay');
const frictionDisplay = document.getElementById('frictionDisplay');


// Eventos de alteração de controle
elasticityADisplay.addEventListener('change', (e) => {
    const elasticity = parseFloat(e.target.value);
    // Atualização da elasticidade das bolas
    Matter.Body.set(ballA, 'restitution', elasticity);
});

densityADisplay.addEventListener('change', (e) => {
    const mass = parseFloat(e.target.value);
    const density = (mass / ballA.area);
    // Atualização da densidade das bolas
    Matter.Body.setDensity(ballA, density);
});

// Eventos de alteração de controle
elasticityBDisplay.addEventListener('change', (e) => {
    const elasticity = parseFloat(e.target.value);
    // Atualização da elasticidade das bolas
    Matter.Body.set(ballB, 'restitution', elasticity);
});

densityBDisplay.addEventListener('change', (e) => {
    const mass = parseFloat(e.target.value);
    const density = (mass / ballA.area);
    // Atualização da densidade das bolas
    Matter.Body.setDensity(ballB, density);
});

frictionInput.addEventListener('change', (e) => {
    frictionDisplay.value = e.target.value
    const friction = parseFloat(e.target.value);
    // Atualização da fricção entre as bolas e a mesa
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

frictionInput.addEventListener('change', (e) => {
    frictionDisplay.value = e.target.value
    const friction = parseFloat(e.target.value);
    // Atualização da fricção entre as bolas e a mesa
    // Matter.Body.set(ballA, 'frictionStatic', friction);
    // Matter.Body.set(ballB, 'frictionStatic', friction);
    // Matter.Body.set(ground, 'frictionStatic', friction);

    Matter.Body.set(ballA, 'frictionAir', friction);
    Matter.Body.set(ballB, 'frictionAir', friction);
    Matter.Body.set(ground, 'frictionAir', friction);


});

// Criação do taco
let cue = Bodies.rectangle(ballA.position.x - 100, ballA.position.y, 100, 10, {
    isStatic: true,
    density: 0.04,
    restitution: 1,
    frictionAir: 0.0000000001,
    render: {
        visible: true,  // torna o taco inicialmente invisível,
        fillStyle: 'red',
    }
});



var proportionConstant = 0.0001;

// Vamos manter um registro da posição inicial do mouse ao clicar
let mouseStart = null;

// Registra a posição inicial do mouse quando clicado
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

        forceADisplay.textContent =  forceMagnitude.toFixed(2);

        // forceDisplay.textContent = `${forceMagnitude.toFixed(2)}`;

    }
});

// Atualiza a força do impacto baseado na distância que o mouse foi arrastado
render.canvas.addEventListener('mouseup', (e) => {
    if (mouseStart) {

        const dx = ballA.position.x - mouse.position.x;
        const dy = ballA.position.y - mouse.position.y;

        // Aplica uma força ao taco na direção do arrasto do mouse
        var forceMagnitude = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)) * proportionConstant;
        const forceDirection = { x: dx * forceMagnitude, y: dy * forceMagnitude };

        Matter.Body.applyForce(ballA, ballA.position, forceDirection);


        World.remove(world, [cue]);

        // // Resetar a posição inicial do mouse
        mouseStart = null;

       
    }
});

// // Captura do elemento de interface do usuário
// const forceDisplay = document.getElementById('forceDisplay');
// forceDisplay.textContent = '0';

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
    return body.mass * body.speed;
}

function calculateKineticEnergy(body) {
    var kineticEnergy = 0.5 * body.mass * body.speed ** 2;
    return kineticEnergy;
}

// // Agora vamos atualizar a posição do taco para seguir a bola 1
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

    kineticTotalDisplay.textContent = `${(kineticA + kineticB).toFixed(2)}`;

    // drawForceArrow();
    // forceDisplay.textContent = `Força: ${cue.position.x}`;
    // console.log(ballA.velocity);
    //     if (mouseStart) {
    //         const angle = cue.angle;

    //         // Atualiza a posição do taco para seguir a bola 1
    //         // Matter.Body.setPosition(cue, { x: ballA.position.x + 80, y: ballA.position.y });

    //         // Manter o ângulo do taco após mover para a nova posição
    //         // Matter.Body.setAngle(cue, angle);

    //         // Torna o taco visível apenas quando o mouse está pressionado
    //         // cue.render.visible = mouseStart !== null;
    //     }
});
// const { Engine, Render, World, Bodies, Body, Events, Runner, Composite, Constraint, Composites } = Matter;

// let engine = Matter.Engine.create();
// engine.world.gravity.y = 0;

// // Criando um renderizador
// let render = Matter.Render.create({
//     element: document.body,
//     engine: engine,
//     options: {
//         width: 800,
//         height: 600,
//         wireframes: false
//     }
// });

// // Criando as bolas
// let ball1 = Matter.Bodies.circle(200, 300, 20, {
//     density: 0.04,
//     restitution: 1,
//     frictionAir: 0.0000000001,
//     render: {
//         fillStyle: 'blue'
//     }
// });


// let anchor = { x: 200, y: 300 };
// let elastic = Constraint.create({
//     pointA: anchor,
//     bodyB: ball1,
//     stiffness: 0.05,
//     render: { strokeStyle: 'gray', lineWidth: 2 }
// });

// // Adicionando as bolas ao mundo
// let pyramid = Composites.pyramid(500, 300, 5, 10, 0, 0, function (x, y) {
//     return Bodies.circle(x, y, 20, {
//         density: 0.04,
//         restitution: 1,
//         frictionAir: 0.0000000001
//     });
// });
// // let ball2 = Matter.Bodies.circle(600, 300, 20, {
// //     density: 0.04,
// //     restitution: 1,
// //     frictionAir: 0.0000000001,
// //     render: {
// //         fillStyle: 'red'
// //     }
// // });

// // Adicionando as bolas ao mundo
// Matter.World.add(engine.world, [ball1,  elastic, pyramid]);

// // Criando as bordas da mesa de bilhar
// let ground = Matter.Bodies.rectangle(400, 610, 810, 60, { isStatic: true });
// let roof = Matter.Bodies.rectangle(400, -10, 810, 60, { isStatic: true });
// let leftWall = Matter.Bodies.rectangle(-10, 300, 60, 620, { isStatic: true });
// let rightWall = Matter.Bodies.rectangle(810, 300, 60, 620, { isStatic: true });

// // Adicionando as bordas ao mundo
// Matter.World.add(engine.world, [ground, roof, leftWall, rightWall,]);

// // Variáveis para controlar a interação do mouse
// let isDragging = false;

// // Configurando o controle do mouse
// let mouse = Matter.Mouse.create(render.canvas);
// let mouseConstraint = Matter.MouseConstraint.create(engine, {
//     mouse: mouse,

//     constraint: {
//         stiffness: 0.2,
//         render: {
//             visible: false
//         }
//     }
// });

// Events.on(engine, 'afterUpdate', function () {
//     if (mouseConstraint.mouse.button === -1 && (ball1.position.x > 220 || ball1.position.y < 280)) {
//         ball1 = Matter.Bodies.circle(200, 300, 20, {
//             density: 0.04,
//             restitution: 0.9,
//             frictionAir: 0.01,
//             render: {
//                 fillStyle: 'blue'
//             }
//         });
//         Composite.add(engine.world, ball1);
//         elastic.bodyB = ball1;
//     }
// });

// // Elemento HTML para exibir a força
// let forceDisplay = document.createElement('div');
// forceDisplay.style.position = 'absolute';
// forceDisplay.style.top = '10px';
// forceDisplay.style.left = '10px';
// forceDisplay.style.padding = '10px';
// forceDisplay.style.background = 'rgba(0, 0, 0, 0.5)';
// forceDisplay.style.color = '#ffffff';
// document.body.appendChild(forceDisplay);


// // Vetor de direção da força
// let forceDirection = { x: 0, y: 0 };



// // Manipuladores de eventos do mouse
// Matter.Events.on(mouseConstraint, 'mousedown', function (event) {
//     let selectedBody = mouseConstraint.body;
//     console.log(selectedBody);
//     if (selectedBody === ball1) {
//         isDragging = true;
//     }
// });

// Matter.Events.on(mouseConstraint, 'mousemove', function (event) {
//     if (isDragging) {
//         let selectedBody = mouseConstraint.body;
//         if (selectedBody === ball1) {
//             // Calcula a direção do arrasto
//             let dragDirection = Matter.Vector.sub(mouse.position, ball1.position);

//             // Calcula a magnitude da força
//             let forceMagnitude = Matter.Vector.magnitude(dragDirection);

//             // Atualiza o vetor de direção da força
//             forceDirection = Matter.Vector.normalise(dragDirection);

//             // Exibe a magnitude da força no display
//             forceDisplay.textContent = `Força: ${forceMagnitude.toFixed(2)} N`;

//             // Aplica uma força oposta à direção do arrasto na bola
//             Matter.Body.applyForce(ball1, ball1.position, Matter.Vector.mult(dragDirection, 0.01));
//         } else {
//             // Caso o mouse não esteja arrastando, exibe a mensagem de pausa no display
//             forceDisplay.textContent = '';
//         }
//     }
// });

// // Função para desenhar a seta de direção da força
// function drawForceArrow() {

//     let arrowSize = 40; // Tamanho da seta
//     let arrowEnd = {
//         x: ((anchor.x - ball1.position.x  ) * 3) + anchor.x,
//         y: ((anchor.y - ball1.position.y ) * 3) + anchor.y
//     };

//     render.context.beginPath();
//     render.context.moveTo(ball1.position.x, ball1.position.y);
//     render.context.lineTo(arrowEnd.x, arrowEnd.y);
//     render.context.strokeStyle = 'white';
//     render.context.lineWidth = 3;
//     render.context.stroke();
// }

// // // Manipuladores de eventos do mouse
// // Matter.Events.on(mouseConstraint, 'mousedown', function(event) {
// //     isDragging = true;
// // });

// // Matter.Events.on(mouseConstraint, 'mouseup', function(event) {
// //     if (isDragging) {
// //         // Calcula a direção do arrasto
// //         let dragDirection = Matter.Vector.sub(mouse.position, ball1.position);

// //         // Aplica uma força oposta à direção do arrasto na bola
// //         Matter.Body.applyForce(ball1, ball1.position, Matter.Vector.mult(dragDirection, 0.01));
// //     }

// //     isDragging = false;
// // });

// // Adicionando o controle do mouse ao mundo
// Matter.World.add(engine.world, mouseConstraint);

// // Adicionando a função de desenho da seta ao evento afterRender
// Matter.Events.on(render, 'afterRender', function() {
//     drawForceArrow();
// });

// render.mouse = mouse;

// // Rodando o engine e o renderizador
// Runner.run(engine);
// Matter.Render.run(render);