const { Engine, Render, World, Bodies, Body, Events, Runner, Composite } = Matter;

// Define constants for the simulation
const WIDTH = 370;
const HEIGHT = 300;
const PARTICLE_COUNT = 1000;

// Particle speed in m/s, average speed for O2 particles
const PARTICLE_SPEED = 492;

// Constants for simulation (Boltzmann constant and O2 mass)
const BOLTZMANN = 1.38 * Math.pow(10, -23);
const PARTICLE_MASS = 5.31 * Math.pow(10, -26);


// Initial temperature of the system
let temperature = 300;
let oldTemperature = 300;

/**
 * Function to draw walls of the container
 * Returns an array of Matter.js Bodies (rectangle shape)
 */
const drawWalls = () => {
    const margin = 1;
    const wallOptions = {
        isStatic: true,
        render: { fillStyle: 'white', strokeStyle: 'white', lineWidth: 0 },
        collisionFilter: { mask: 1 }
    };

    return [
        Bodies.rectangle(0, HEIGHT, WIDTH * 2, margin, wallOptions),
        Bodies.rectangle(WIDTH, 0, margin, HEIGHT * 2, wallOptions),
        Bodies.rectangle(0, 0, WIDTH * 2, margin, wallOptions),
        Bodies.rectangle(0, 0, margin, HEIGHT * 2, wallOptions)
    ];
};

/**
 * Function to create a particle with random position and direction
 * Returns a Matter.js Body (circle shape)
 */
const makeParticle = () => {
    const particleMargin = 2;
    const p = Bodies.circle(
        (Math.random() * (WIDTH - particleMargin)) + (particleMargin / 2),
        (Math.random() * (HEIGHT - particleMargin)) + (particleMargin / 2),
        1, {
        render: { fillStyle: '#6666A0', lineWidth: 1.5 },
        restitution: 1,
        friction: 0,
        inertia: Infinity,
        frictionAir: 0
    }
    );

    const direction = Math.PI / 3;
    Body.setVelocity(p, {
        x: Math.sin(direction) * (PARTICLE_SPEED / 1000),
        y: Math.cos(direction) * (PARTICLE_SPEED / 1000)
    });

    return p;
};

/**
 * Function to create an array of particles
 * Returns an array of Matter.js Bodies (circle shape)
 */
const makeParticles = () => {
    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(makeParticle());
    }
    return particles;
};

const engine = Engine.create();

// This code sets up the Matter.js physics engine, and tells it to update every frame (60 times per second).
requestAnimationFrame(function update() {
    Matter.Engine.update(engine, 1000 / 60);
    requestAnimationFrame(update);
});
engine.gravity.y = 0;

// This code sets up a Renderer to draw the particles and walls.
const render = Render.create({
    element: document.body,
    engine,
    width: WIDTH,
    height: HEIGHT,
    options: {
        wireframes: false,
        background: 'white',
    }
});
Render.lookAt(render, {
    min: { x: 0, y: 0 },
    max: { x: WIDTH, y: HEIGHT }
});
Matter.Resolver._restingThresh = 0.001;
Render.run(render);

// This block of code is creating the walls and particles and adding them to the world.
const walls = drawWalls();
Composite.add(engine.world, walls);

let particles = makeParticles();
Composite.add(engine.world, particles);

// The runner is created and starts the engine.
const runner = Runner.create();
Runner.run(runner, engine);


// Controls for the simulation: a range input for adjusting the speed of particles, 
// a reset button (though the functionality for the button is commented out), and a pause button. 
// The pause button uses a flag (isPaused) to toggle the state of the simulation when clicked.
const tempControl = document.createElement("input");
tempControl.type = "range";
tempControl.min = "200";
tempControl.max = "1000";
tempControl.value = "300";
tempControl.addEventListener("input", function () {
    oldTemperature = temperature;
    temperature = parseInt(this.value);
    updateSpeeds();
});

/**
 * Function to update the speed of all particles
 * Based on the new temperature of the system
 */
const updateSpeeds = () => {
    const oldAvgSpeed = Math.sqrt((3 * BOLTZMANN * oldTemperature) / PARTICLE_MASS) * 1000;
    const newAvgSpeed = Math.sqrt((3 * BOLTZMANN * temperature) / PARTICLE_MASS) * 1000;
    const speedRatio = newAvgSpeed / oldAvgSpeed;

    for (let i = 0; i < particles.length; i++) {
        const velocity = particles[i].velocity;
        const currentSpeed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
        const newSpeed = currentSpeed * speedRatio;
        const direction = Math.atan2(velocity.y, velocity.x);

        Body.setVelocity(particles[i], {
            x: Math.cos(direction) * newSpeed,
            y: Math.sin(direction) * newSpeed
        });
    }
};

// Append the control to the document body.
document.body.appendChild(tempControl);

const resetButton = document.createElement("button");
resetButton.innerHTML = "Reset";
document.body.appendChild(resetButton);

resetButton.onclick = function () {
    for (let i = 0; i < particles.length; i++) {
        Matter.Composite.remove(engine.world, particles[i]);
    }

    particles = makeParticles();
    Composite.add(engine.world, particles);
}
document.body.appendChild(resetButton);


var pauseButton = document.createElement('button');
pauseButton.innerHTML = 'Pause';
var isPaused = false;
pauseButton.onclick = function () {
    if (!isPaused) {
        runner.enabled = false;
        // Render.stop(engine);
        // Runner.stop(runner);
        this.innerHTML = 'Resume';
    } else {
        runner.enabled = true;
        // Render.run(render);
        // Runner.run(runner, engine);
        this.innerHTML = 'Pause';
    }
    isPaused = !isPaused;
}
document.body.appendChild(pauseButton);


// This function calculates the speeds of all bodies in the world. 
function getSpeeds() {
    var speeds = [];
    for (var i = 0; i < engine.world.bodies.length; i++) {
        var velocity = engine.world.bodies[i].velocity;
        var speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
        speeds.push(speed);
    }
    return speeds;
}

// The next block of code creates a histogram to represent the speeds of the particles.
// This involves creating an SVG element, scaling the x and y axes to fit the data, 
// and setting up the layout of the histogram.
let svgWidth = 400;
let svgHeight = 200;
const svgX = d3.select("body")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight + 40);

const x = d3.scaleLinear()
    .domain([-2000, 2000]) // Set the domain to [0, 20]
    .range([40, svgWidth - 40]);

// Create a new y-axis
const y = d3.scaleLinear()
    .domain([0, PARTICLE_COUNT])
    .range([0, svgHeight - 60]);

// Create a new x-axis
const xAxis = d3.axisBottom(x)
    .ticks(20) // Make the inner ticks extend across the plot
    .tickFormat(x => x % 500 === 0 ? x : ''); // Only show ticks at multiples of 500

// Add the x-axis to the plot
svgX.append("g")
    .attr("transform", "translate(0," + svgHeight + ")")
    .call(xAxis);


// Add the text to the plot
svgX.append("text")
    .attr("x", svgWidth / 2)
    .attr("y", svgHeight + 35) // Position the text below the SVG element
    .attr("text-anchor", "middle")
    .text("Particle speed on x-axis(m/s)");

svgX.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -svgHeight / 2)
    .attr("y", 0)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Number of Particles");

// This function takes an input velocity v, temperature T, and mass m, and returns the expected 
// probability density for that velocity according to the Maxwell-Boltzmann distribution.
function maxwellBoltzmann(v, T, m) {
    let a = Math.sqrt(2 * Math.PI * (BOLTZMANN * T / m));
    return 4 * Math.PI * (v * v) * Math.exp(-m * (v * v) / (2 * BOLTZMANN * T)) / a ** 3;
}

function maxwellBoltzmann2(v, T, m) {
    let a = Math.sqrt(m / (2 * Math.PI * BOLTZMANN * T));
    let b = Math.exp(-m * (v * v) / (2 * BOLTZMANN * T))
    return a * b;
}

// The histogram is initially drawn
updateHistogramX();

// The histogram is redrawn every second, with the latest speeds
setInterval(function () {
    updateHistogramX();
}, 1000);


// The updateHistogram function updates the histogram with current speed data.
function updateHistogramX(speeds) {
    // // The speeds of particles are updated
    // speeds = particles.map(function (p) {
    //     return 1000 * Math.sqrt(p.velocity.x * p.velocity.x + p.velocity.y * p.velocity.y);
    // });

    speeds = particles.map(function (p) {
        return 1000 * p.velocity.x;
    });

    // The old histogram is removed from the SVG
    svgX.selectAll("rect").remove();
    svgX.selectAll("path").remove();
    // A new histogram is defined
    const histogram = d3.histogram()
        .domain([-2000, 2000])
        .thresholds(100)
        (speeds);

    // Bars for the histogram are added to the SVG
    const barWidth = svgWidth / histogram.length;
    svgX.selectAll("rect")
        .data(histogram)
        .enter()
        .append("rect")
        .attr("x", function (_d, i) { return i * barWidth; })
        .attr('y', function (d) { return svgHeight - d.length * 2; })
        .attr("width", barWidth)
        .attr('height', function (d) { return d.length * 2; }) // Calculate the height from the top of the SVG element
        .attr("fill", "steelblue");
    // Data for the Maxwell-Boltzmann distribution is generated


    let maxSpeed = 2000;
    let speedRange = d3.range(- 2000, maxSpeed, maxSpeed / 100);

    let maxwellBoltzmannData = speedRange.map(v => ({
        speed: v,
        density: maxwellBoltzmann2(v, temperature, PARTICLE_MASS)
    }));

    // Scaling for line
    const xLine = d3.scaleLinear()
        .domain([-2000, 2000]) // Set the domain to [0, 20]
        .range([40, svgWidth - 40]);

    const yLine = d3.scaleLinear()
        .domain([0, d3.max(maxwellBoltzmannData, d => d.density)])
        .range([svgHeight, 80]); // note the flip in height and 0

    // Define the line generator function
    const line = d3.line()
        .x(d => xLine(d.speed))
        .y(d => yLine(d.density));

    // Add the line to the svg
    svgX.append("path")
        .datum(maxwellBoltzmannData)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 1.5)
        .attr("d", line);

}

const svgY = d3.select("body")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight + 40);

// Add the text to the plot
svgY.append("text")
    .attr("x", svgWidth / 2)
    .attr("y", svgHeight + 35) // Position the text below the SVG element
    .attr("text-anchor", "middle")
    .text("Particle speed on y-axis (m/s)");

svgY.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -svgHeight / 2)
    .attr("y", 0)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Number of Particles");

// Add the x-axis to the plot
svgY.append("g")
    .attr("transform", "translate(0," + svgHeight + ")")
    .call(xAxis);

updateHistogramY();

// The histogram is redrawn every second, with the latest speeds
setInterval(function () {
    updateHistogramY();
}, 1000);


// The updateHistogram function updates the histogram with current speed data.
function updateHistogramY(speeds) {
    // // The speeds of particles are updated
    // speeds = particles.map(function (p) {
    //     return 1000 * Math.sqrt(p.velocity.x * p.velocity.x + p.velocity.y * p.velocity.y);
    // });

    speeds = particles.map(function (p) {
        return 1000 * p.velocity.y;
    });

    // The old histogram is removed from the SVG
    svgY.selectAll("rect").remove();
    svgY.selectAll("path").remove();
    // A new histogram is defined
    const histogram = d3.histogram()
        .domain([-2000, 2000])
        .thresholds(100)
        (speeds);

    // Bars for the histogram are added to the SVG
    const barWidth = svgWidth / histogram.length;
    svgY.selectAll("rect")
        .data(histogram)
        .enter()
        .append("rect")
        .attr("x", function (_d, i) { return i * barWidth; })
        .attr('y', function (d) { return svgHeight - d.length * 2; })
        .attr("width", barWidth)
        .attr('height', function (d) { return d.length * 2; }) // Calculate the height from the top of the SVG element
        .attr("fill", "steelblue");
    // Data for the Maxwell-Boltzmann distribution is generated


    let maxSpeed = 2000;
    let speedRange = d3.range(- 2000, maxSpeed, maxSpeed / 100);

    let maxwellBoltzmannData = speedRange.map(v => ({
        speed: v,
        density: maxwellBoltzmann2(v, temperature, PARTICLE_MASS)
    }));

    // Scaling for line
    const xLine = d3.scaleLinear()
        .domain([-2000, 2000]) // Set the domain to [0, 20]
        .range([40, svgWidth - 40]);

    const yLine = d3.scaleLinear()
        .domain([0, d3.max(maxwellBoltzmannData, d => d.density)])
        .range([svgHeight, 80]); // note the flip in height and 0

    // Define the line generator function
    const line = d3.line()
        .x(d => xLine(d.speed))
        .y(d => yLine(d.density));

    // Add the line to the svg
    svgY.append("path")
        .datum(maxwellBoltzmannData)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 1.5)
        .attr("d", line);

}

const svgTotal = d3.select("body")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight + 40);

const xTotal = d3.scaleLinear()
    .domain([0, 2000]) // Set the domain to [0, 20]
    .range([40, svgWidth - 40]);

// Create a new y-axis
const yTotal = d3.scaleLinear()
    .domain([0, PARTICLE_COUNT])
    .range([0, svgHeight - 60]);

// Create a new x-axis
const xAxisTotal = d3.axisBottom(xTotal)
    .ticks(20) // Make the inner ticks extend across the plot
    .tickFormat(x => x % 500 === 0 ? x : ''); // Only show ticks at multiples of 500


// Add the text to the plot
svgTotal.append("text")
    .attr("x", svgWidth / 2)
    .attr("y", svgHeight + 35) // Position the text below the SVG element
    .attr("text-anchor", "middle")
    .text("Modular Particle speed (m/s)");

svgTotal.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -svgHeight / 2)
    .attr("y", 0)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Number of Particles");

// Add the x-axis to the plot
svgTotal.append("g")
    .attr("transform", "translate(0," + svgHeight + ")")
    .call(xAxisTotal);

updateHistogramTotal();

// The histogram is redrawn every second, with the latest speeds
setInterval(function () {
    updateHistogramTotal();
}, 1000);


// The updateHistogram function updates the histogram with current speed data.
function updateHistogramTotal(speeds) {
    // // The speeds of particles are updated
    // speeds = particles.map(function (p) {
    //     return 1000 * Math.sqrt(p.velo city.x * p.velocity.x + p.velocity.y * p.velocity.y);
    // });

    speeds = particles.map(function (p) {
        return 1000 * Math.sqrt(p.velocity.y ** 2 + p.velocity.x ** 2);
    });

    // The old histogram is removed from the SVG
    svgTotal.selectAll("rect").remove();
    svgTotal.selectAll("path").remove();
    // A new histogram is defined
    const histogram = d3.histogram()
        .domain([0, 2000])
        .thresholds(100)
        (speeds);

    // Bars for the histogram are added to the SVG
    const barWidth = svgWidth / histogram.length;
    svgTotal.selectAll("rect")
        .data(histogram)
        .enter()
        .append("rect")
        .attr("x", function (_d, i) { return i * barWidth + 40; })
        .attr('y', function (d) { return svgHeight - d.length * 3; })
        .attr("width", barWidth)
        .attr('height', function (d) { return d.length * 3; }) // Calculate the height from the top of the SVG element
        .attr("fill", "steelblue");
    // Data for the Maxwell-Boltzmann distribution is generated


    let maxSpeed = 2000;
    let speedRange = d3.range(0, maxSpeed, maxSpeed / 100);

    let maxwellBoltzmannData = speedRange.map(v => ({
        speed: v,
        density: maxwellBoltzmann(v, temperature, PARTICLE_MASS)
    }));

    // Scaling for line
    const xLine = d3.scaleLinear()
        .domain([0, 2000]) // Set the domain to [0, 20]
        .range([40, svgWidth - 40]);

    const yLine = d3.scaleLinear()
        .domain([0, d3.max(maxwellBoltzmannData, d => d.density)])
        .range([svgHeight, 80]); // note the flip in height and 0

    // Define the line generator function
    const line = d3.line()
        .x(d => xLine(d.speed))
        .y(d => yLine(d.density));

    // Add the line to the svg
    svgTotal.append("path")
        .datum(maxwellBoltzmannData)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 1.5)
        .attr("d", line);

}

const svgCinectic = d3.select("body")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight + 40);

const xSvgCinectic = d3.scaleLinear()
    .domain([0, 2000]) // Set the domain to [0, 20]
    .range([40, svgWidth - 40]);

// Create a new y-axis
const ySvgCinectic = d3.scaleLinear()
    .domain([0, PARTICLE_COUNT])
    .range([0, svgHeight - 60]);

// Create a new x-axis
const xAxisCinectic = d3.axisBottom(xSvgCinectic)
    .ticks(20) // Make the inner ticks extend across the plot
    .tickFormat(x => x % 500 === 0 ? x : ''); // Only show ticks at multiples of 500


// Add the text to the plot
svgCinectic.append("text")
    .attr("x", svgWidth / 2)
    .attr("y", svgHeight + 35) // Position the text below the SVG element
    .attr("text-anchor", "middle")
    .text("Kinetic Energy (J) x 10^23");

svgCinectic.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -svgHeight / 2)
    .attr("y", 0)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Number of Particles");

// Add the x-axis to the plot
svgCinectic.append("g")
    .attr("transform", "translate(0," + svgHeight + ")")
    .call(xAxisCinectic);

updateHistogramCinectic();

// The histogram is redrawn every second, with the latest speeds
setInterval(function () {
    updateHistogramCinectic();
}, 1000);


// The updateHistogram function updates the histogram with current speed data.
function updateHistogramCinectic(speeds) {
    // // The speeds of particles are updated
    // speeds = particles.map(function (p) {
    //     return 1000 * Math.sqrt(p.velo city.x * p.velocity.x + p.velocity.y * p.velocity.y);
    // });

    speeds = particles.map(function (p) {
        let speed = Math.sqrt(p.velocity.y ** 2 + p.velocity.x ** 2)
        return 0.5 * PARTICLE_MASS * Math.pow(speed * 1000, 2) * 10 ** 23;
    });

    console.log(speeds);

    // The old histogram is removed from the SVG
    svgCinectic.selectAll("rect").remove();
    // A new histogram is defined
    const histogram = d3.histogram()
        .domain([0, 2000])
        .thresholds(100)
        (speeds);

    console.log(histogram);

    // Bars for the histogram are added to the SVG
    const barWidth = svgWidth / histogram.length;
    svgCinectic.selectAll("rect")
        .data(histogram)
        .enter()
        .append("rect")
        .attr("x", function (_d, i) { return i * barWidth + 40; })
        .attr('y', function (d) { return svgHeight - d.length * 3; })
        .attr("width", barWidth)
        .attr('height', function (d) { return d.length * 3; }) // Calculate the height from the top of the SVG element
        .attr("fill", "steelblue");
   

}