let treeItems = [];
let inGameItemsData;
let inGameItems;
let craftingStations;

let itemSpacing = 250;
let hoveringOverItem;
let openSansRegular;
let openSansBold;

let cameraPan = new p5.Vector(0, 0);
let dragStart = new p5.Vector();
let dragMouse = new p5.Vector();
let panStart = new p5.Vector();
let dragging = false;

let cameraHeight;
let zoomLevel = 1.5;

let mousePos = new p5.Vector();

function preload() {
    inGameItemsData = loadJSON("in-game-items.json");
    openSansBold = loadFont("open-sans-bold.ttf");
}

function setup() {
    createCanvas(windowWidth - 20, windowHeight - 20, WEBGL);
    frameRate(60);

    cameraHeight = (height/2) / tan(PI/6);
    cam = createCamera();
    cam.setPosition(cameraPan.x, cameraPan.y, cameraHeight);

    inGameItems = inGameItemsData.inGameItems;
    for (let i = 0; i < inGameItems.length; i ++) {
        inGameItems[i].sprite = loadImage("images/" + inGameItems[i].name + ".png");
    }

    craftingStations = inGameItemsData.craftingStations;
    for (let i = 0; i < craftingStations.length; i ++) {
        craftingStations[i].sprite = loadImage("images/" + craftingStations[i].name + ".png");
    }

    reset();
}

function draw() {
    background(240);

    cam.setPosition(cameraPan.x, cameraPan.y, cameraHeight * zoomLevel);

    if (dragging) {
        dragMouse.x = (mouseX - dragStart.x) * zoomLevel;
        cameraPan.set(panStart.x - ((mouseX - dragStart.x) * zoomLevel), panStart.y - ((mouseY - dragStart.y) * zoomLevel));
    }

    mousePos.x = mouseX - (width / 2) + cameraPan.x + (cameraPan.x * (-(zoomLevel - 1) / zoomLevel));
    mousePos.y = mouseY - (height / 2) + cameraPan.y + (cameraPan.y * (-(zoomLevel - 1) / zoomLevel));
    mousePos.setMag(mousePos.mag() * zoomLevel);

    for (item of treeItems) {
        item.display(mousePos);
        item.update(treeItems);
    }

    hoveringOverItem = false;
    cursor(ARROW);
    for (item of treeItems) {
        if (item.hoveredOver) {
            hoveringOverItem = true;
            push();
            translate(item.position.x, item.position.y);
            cursor("pointer");

            fill(255, 255, 255, 70);
            circle(0, 0, 30000);
            fill(255);
            textSize(25);
            textFont(openSansBold);
            textAlign(CENTER);
            let rectWidth = max(160, textWidth(item.inGameItem.displayName) + 55);
            let rectHeight = 300;
            textSize(15);
            rectWidth = max(rectWidth, textWidth("(Click to open wiki page)") + 55);

            let craftingStation = null;
            for (station of craftingStations) {
                if (station.name == item.inGameItem.craftingStation) {
                    craftingStation = station;
                }
            }

            if (craftingStation != null) {
                rectWidth = max(rectWidth, textWidth("Crafted at " + craftingStation.displayName) + 55);
                rectHeight = (item.inGameItem.sprite.height + craftingStation.sprite.height + 220);
            } else if (item.inGameItem.acquisition != "") {
                rectWidth = max(rectWidth, textWidth(item.inGameItem.acquisition) + 55);
                rectHeight = (item.inGameItem.sprite.height + 220);
            } else {
                rectHeight = (item.inGameItem.sprite.height + 110);
                cursor(ARROW);
            }

            rect(-rectWidth / 2, -(item.inGameItem.sprite.height / 2) - 35, rectWidth, rectHeight);
            image(item.inGameItem.sprite, -(item.inGameItem.sprite.width / 1.4), -(item.inGameItem.sprite.height / 1.4),
                  item.inGameItem.sprite.width * 1.4, item.inGameItem.sprite.height * 1.4)
            fill(0);
            textSize(25);
            text(item.inGameItem.displayName, 0, (item.inGameItem.sprite.height / 2) + 50);
            textSize(15);

            if (craftingStation != null) {
                text("Crafted at " + craftingStation.displayName, 0, (item.inGameItem.sprite.height / 2) + 100);
                image(craftingStation.sprite, -(craftingStation.sprite.width / 2), (item.inGameItem.sprite.height / 2) + 115,
                      craftingStation.sprite.width, craftingStation.sprite.height);
                text("(Click to open wiki page)", 0, (item.inGameItem.sprite.height / 2) + craftingStation.sprite.height + 160)
            } else if (item.inGameItem.acquisition != "") {
                text(item.inGameItem.acquisition, 0, (item.inGameItem.sprite.height / 2) + 100);
                text("(Click to open wiki page)", 0, (item.inGameItem.sprite.height / 2) + 160)
            }
            pop();

            // image(item.inGameItem.sprite, item.position.x-(item.inGameItem.sprite.width / 1.4), item.position.y-(item.inGameItem.sprite.height / 1.4),
                  // item.inGameItem.sprite.width * 1.4, item.inGameItem.sprite.height * 1.4)
        }
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

function mousePressed() {
    if (!dragging && !hoveringOverItem) {
        dragStart.set(mouseX, mouseY);
        panStart.set(cameraPan);
        dragging = true;
    }
}

function mouseReleased() {
    if (dragging) {
        dragging = false;
    }
}

function mouseClicked() {
    if (hoveringOverItem) {
        let hoverItem;
        for (item of treeItems) {
            if (item.hoveredOver) {
                hoverItem = item;
            }
        }
        if (hoverItem.inGameItem.wikiLink != "") {
            window.open(hoverItem.inGameItem.wikiLink);
        }
    }
}

function mouseWheel(mouseEvent) {
    if (mouseEvent.delta > 0) {
        zoomLevel = min(zoomLevel * 1.1, 10);
    } else {
        zoomLevel = max(zoomLevel * 0.9, 0.4);
    }
}

function loadItemRecursive(treeItem, parentItem) {
    if (treeItem.ingredients) {
        for (let i = 0; i < treeItem.ingredients.length; i ++) {
            let ingredient = treeItem.ingredients[i];
            let ingredientNumber;
            let newItemPosition = new p5.Vector();
            if (parentItem.parent == null) {
                ingredientNumber = (1 / treeItem.ingredients.length) * i;
                newItemPosition.set(150, 0);
                newItemPosition.rotate(TWO_PI - TWO_PI * ingredientNumber);
            } else {
                ingredientNumber = 1 / (treeItem.ingredients.length + 1) * (i + 1);
                newItemPosition = p5.Vector.sub(parentItem.parent.position, parentItem.position);
                newItemPosition.setMag(-150);
                newItemPosition.rotate(map(ingredientNumber, 0, 1, -HALF_PI, HALF_PI));
            }
            newItemPosition.add(parentItem.position);
            newItem = new Item(newItemPosition.x, newItemPosition.y, inGameItems[ingredient[0]], ingredient[1], parentItem, itemSpacing);
            treeItems.push(newItem);
            loadItemRecursive(inGameItems[ingredient[0]], newItem);
        }
    }
}

function reset() {
    treeItems = [];

    firstItem = new Item(0, 0, inGameItems[38], 1, null);
    treeItems.push(firstItem);
    loadItemRecursive(inGameItems[38], firstItem);

    for (treeItem of treeItems) {
        countChildrenRecursive(treeItem, treeItem.inGameItem, inGameItems);
    }

    for (treeItem of treeItems) {
        placeChildrenRadially(treeItem, treeItems[0], treeItems);
    }

    zoomLevel = 1.5;
    cameraPan.set(0, 0);
}

function countChildrenRecursive(treeItem, inGameItem, inGameItems) {
    if (treeItem.inGameItem.ingredients.length == 0) {
        treeItem.children = 1;
    } else {
        for (let i = 0; i < inGameItem.ingredients.length; i ++) {
            if (inGameItems[inGameItem.ingredients[i][0]].ingredients.length == 0) {
                treeItem.children ++;
            }
            countChildrenRecursive(treeItem, inGameItems[inGameItem.ingredients[i][0]], inGameItems);
        }
    }
}

function placeChildrenRadially(parentItem, originItem, treeItems) {
    let childList = [];
    for (item of treeItems) {
        if (item.parent == parentItem) {
            append(childList, item);
        }
    }
    if (parentItem.parent == null) {
        let eachChildAngle = TWO_PI / parentItem.children;
        let runningTotal = 0;
        for (child of childList) {
            let childAngle = eachChildAngle * child.children;
            let newItemPosition = new p5.Vector(0, itemSpacing);
            newItemPosition.rotate(childAngle / 2 + runningTotal);
            newItemPosition.add(originItem.position);
            runningTotal += childAngle;
            child.position.set(newItemPosition);
        }
    } else {
        let parentAngle = (TWO_PI * parentItem.children / originItem.children);
        let runningTotal = 0;
        for (let i = 0; i < childList.length; i ++) {
            let prevTotal = runningTotal;
            runningTotal += parentAngle * childList[i].children / parentItem.children;
            let childAngle = (prevTotal + runningTotal) / 2;

            newItemPosition = p5.Vector.sub(parentItem.position, originItem.position);
            newItemPosition.setMag(childList[i].itemSpacing);
            newItemPosition.rotate(childAngle - parentAngle / 2);
            newItemPosition.add(originItem.position);
            childList[i].position.set(newItemPosition);
        }
    }
}
