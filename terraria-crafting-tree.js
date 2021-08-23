let treeItems = [];
let inGameItemsData;
let inGameItems;

function preload() {
    inGameItemsData = loadJSON("in-game-items.json");
}

function setup() {
    createCanvas(windowWidth - 20, windowHeight - 20);
    frameRate(60);

    noStroke();
    fill(255, 0, 0, 50);

    inGameItems = inGameItemsData.inGameItems;
    for (let i = 0; i < inGameItems.length; i++) {
        inGameItems[i].sprite = loadImage("images/" + inGameItems[i].name + ".png");
    }

    reset();
}

function draw() {
    background(240);

    for (item of treeItems) {
        item.display();
        item.update(treeItems);
    }
}

function windowResized() {
    resizeCanvas(windowWidth - 20, windowHeight - 20);
}

function keyPressed() {
    if (keyCode == ENTER) {
        reset();
    }
}

function loadItemRecursive(treeItem, parentItem) {
    if (treeItem.ingredients) {
        for (let i = 0; i < treeItem.ingredients.length; i++) {
            let ingredient = treeItem.ingredients[i];
            let ingredientNumber;
            let newItemPosition = new p5.Vector();
            if (parentItem.parent == null) {
                ingredientNumber = (1 / treeItem.ingredients.length) * i;
                console.log(ingredientNumber);
                newItemPosition.set(150, 0);
                newItemPosition.rotate(TWO_PI - TWO_PI * ingredientNumber);
            } else {
                ingredientNumber = 1 / (treeItem.ingredients.length + 1) * (i + 1);
                newItemPosition = p5.Vector.sub(parentItem.parent.position, parentItem.position);
                newItemPosition.setMag(-150);
                newItemPosition.rotate(map(ingredientNumber, 0, 1, -HALF_PI, HALF_PI));
            }
            newItemPosition.add(parentItem.position);
            newItem = new Item(newItemPosition.x, newItemPosition.y, inGameItems[ingredient[0]], ingredient[1], parentItem);
            treeItems.push(newItem);
            loadItemRecursive(inGameItems[ingredient[0]], newItem);
        }
    }
}

function reset() {
    treeItems = [];

    firstItem = new Item(width / 2, height / 2, inGameItems[24], 1, null);
    treeItems.push(firstItem);
    loadItemRecursive(inGameItems[24], firstItem);
}
