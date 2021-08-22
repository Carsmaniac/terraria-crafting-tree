let someItems = [];

function setup() {
    createCanvas(windowWidth - 20, windowHeight - 20);
    frameRate(60);

    noStroke();
    fill(255, 0, 0, 50);

    reset();
}

function draw() {
    background(240);

    for (item of someItems) {
        item.display();
        item.update(someItems);
    }
    // someItems[0].update(someItems);

    if (mouseIsPressed) {
        someItems[0].position.x = mouseX;
        someItems[0].position.y = mouseY;
    }
}

function keyPressed() {
    if (keyCode == ENTER) {
        reset();
    }
}

function mouseIsPressed() {

}

function windowResized() {
    resizeCanvas(windowWidth - 20, windowHeight - 20);
}

function reset() {
    someItems = [];
    for (let i = 0; i < 40; i++) {
        someItems.push(new Item(random(width), random(height)));
    }
}
