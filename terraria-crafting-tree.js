let treeItems = [];
let inGameItemsData;

function preload() {
    inGameItemsData = loadJSON("in-game-items.json");
}

function setup() {
    createCanvas(windowWidth - 20, windowHeight - 20);
    frameRate(60);

    noStroke();
    fill(255, 0, 0, 50);

    let inGameItems = inGameItemsData.inGameItems;
    for (let i = 0; i < inGameItems.length; i++) {
        inGameItems[i].sprite = loadImage("images/" + inGameItems[i].name + ".png");
    }
    treeItems.push(new Item(width/2, height/2, inGameItems[1]))
}

function draw() {
    background(240);

    for (item of treeItems) {
        item.display();
        item.update(treeItems);
    }

    // if (mouseIsPressed) {
    //     someItems[0].position.x = mouseX;
    //     someItems[0].position.y = mouseY;
    // }
}

function keyPressed() {
    // if (keyCode == ENTER) {
    //     reset();
    // }
}

function mouseIsPressed() {

}

function windowResized() {
    resizeCanvas(windowWidth - 20, windowHeight - 20);
}

function reset() {
    // treeItems = [];
    // for (let i = 0; i < 40; i++) {
    //     treeItems.push(new Item(random(width), random(height), "bloop"));
    // }
}
