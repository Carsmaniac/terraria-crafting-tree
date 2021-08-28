// I hope you like global variables

let inGameItemsData; // JSON containing inGameItems
let craftingTreeItemsData; // JSON containing craftingStations and selectableItems
let treeItems = []; // An item that appears on the crafting tree, with a corresponding inGameItem
let inGameItems; // An in-game item from the game or one of the supported mods
let craftingStations; // A crafting station (anvil, furnace etc) and its sprite
let selectableItems; // An item selectable at load which will serve as the central/top level item in the crafting tree

let statusSelectingItem = true; // The item selection screen is displayed
let statusClickDisabled = false; // Disables opening a wiki page or panning around, to avoid accidental clicks on loading the tree
let statusLoadingSprites = false; // Sprites are being loaded, and the "Loading sprites" screen is displayed
let statusDisplayControls = false; // Keyboard controls are displayed in the top left corner
let statusHoveringOverItem = false; // A treeItem is being hovered over, and its information displayed
let statusDragging = false; // The mouse is being clicked and dragged, and the view is panning

let selectedItem; // The chosen selectableItem, or the one hovered over while statusSelectingItem

let spritesTotal = 0; // Number of sprites to be loaded during a statusLoadingSprites
let spritesLoaded = 0; // Sprites loaded so far, for tracking progress

let itemSpacing = 150; // Distance between concentric rings of items
let openSansBold; // Font file used for UI text

let cameraPan = new p5.Vector(0, 0); // Current position of the camera, relative to the centre of the crafting tree
let cameraHeight; // Distance from the camera to the canvas, affects visual zoom
let zoomLevel = 1; // Zoom percent relative to 1x, higher zooms out, affects cameraHeight
let dragStart = new p5.Vector(); // Mouse position at the beginning of a drag
let dragMouse = new p5.Vector(); // Mouse position during a drag, relative to dragStart and accounting for zoomLevel
let panStart = new p5.Vector(); // cameraPan at the beginning of a drag
let mousePos = new p5.Vector(); // Mouse position on the canvas, accounting for cameraPan and zoomLevel

let firstLoadTime = 0; // frameCount when first loading a tree, determines when to fade out control toggle message

function preload() {
    inGameItemsData = loadJSON("in-game-items.json");
    craftingTreeItemsData = loadJSON("crafting-tree-items.json");
    openSansBold = loadFont("open-sans-bold.ttf");
}

function setup() {
    createCanvas(windowWidth - 20, windowHeight - 20, WEBGL);
    frameRate(60);

    textFont(openSansBold);
    textAlign(CENTER);

    cameraHeight = (windowHeight/2) / tan(PI/6);
    cam = createCamera();
    cam.setPosition(cameraPan.x, cameraPan.y, cameraHeight);

    inGameItems = inGameItemsData.inGameItems;
    craftingStations = craftingTreeItemsData.craftingStations;
    selectableItems = craftingTreeItemsData.selectableItems;
    statusLoadingSprites = true;
    spritesTotal = selectableItems.length + craftingStations.length;
    for (let i = 0; i < selectableItems.length; i ++) {
        for (inGameItem of inGameItems) {
            if (inGameItem.name == selectableItems[i].name) {
                selectableItems[i].inGameItem = inGameItem;
            }
        }
        selectableItems[i].sprite = loadImage("images/" + selectableItems[i].name + ".png", incrementspritesLoaded);
    }
    for (let i = 0; i < craftingStations.length; i ++) {
        craftingStations[i].sprite = loadImage("images/" + craftingStations[i].name + ".png", incrementspritesLoaded);
    }
}

function draw() {
    background(240);

    cam.setPosition(cameraPan.x, cameraPan.y, cameraHeight * zoomLevel);

    if (statusDragging) {
        dragMouse.x = (mouseX - dragStart.x) * zoomLevel;
        cameraPan.set(panStart.x - ((mouseX - dragStart.x) * zoomLevel), panStart.y - ((mouseY - dragStart.y) * zoomLevel));
    }

    mousePos.x = mouseX - (width / 2) + cameraPan.x + (cameraPan.x * (-(zoomLevel - 1) / zoomLevel));
    mousePos.y = mouseY - (height / 2) + cameraPan.y + (cameraPan.y * (-(zoomLevel - 1) / zoomLevel));
    mousePos.setMag(mousePos.mag() * zoomLevel);

    // Display "Loading sprites" screen
    if (statusLoadingSprites) {
        fill(255);
        circle(0, 0, 30000);
        fill(0);
        textSize(40);
        text("Loading sprites (" + spritesLoaded + "/" + spritesTotal + ")", 0, 0);
    // Display item selection screen
    } else if (statusSelectingItem) {
        zoomLevel = 1.2;
        fill(255);
        noStroke();
        rect(-630, -460, 1260, 920);
        fill(0);
        textSize(40);
        text("Choose a crafting tree to display", 0, -360);

        for (let i = 0; i < 8; i ++) {
            for (let j = 0; j < 5; j ++) {
                if (selectableItems.length > i + j * 8) {
                    selectableItems[i + j * 8].position = new p5.Vector(-525 + i * 150, -240 + j * 150);
                }
            }
        }
        selectedItem = null;
        for (selectableItem of selectableItems) {
            let scaleFactor;
            if (selectableItem.sprite.height > selectableItem.sprite.width) {
                scaleFactor = min(75 / selectableItem.sprite.height, 1.5);
            } else {
                scaleFactor = min(75 / selectableItem.sprite.width, 1.5);
            }
            selectableItem.scaledHeight = selectableItem.sprite.height * scaleFactor;
            selectableItem.scaledWidth = selectableItem.sprite.width * scaleFactor;
            image(selectableItem.sprite, selectableItem.position.x - selectableItem.scaledWidth * 0.5, selectableItem.position.y - selectableItem.scaledHeight * 0.5,
                  selectableItem.scaledWidth, selectableItem.scaledHeight);
            if (dist(mousePos.x, mousePos.y, selectableItem.position.x, selectableItem.position.y) < 45) {
                selectedItem = selectableItem;
            }
        }

        cursor(ARROW);
        if (selectedItem != null) {
            cursor("pointer");
            fill(255);
            circle(selectedItem.position.x, selectedItem.position.y, 120)
            image(selectedItem.sprite, selectedItem.position.x - selectedItem.scaledWidth * 0.75, selectedItem.position.y - selectedItem.scaledHeight * 0.75,
                  selectedItem.scaledWidth * 1.5, selectedItem.scaledHeight * 1.5);

            textSize(30);
            let rectWidth = textWidth(selectedItem.displayName);
            textSize(20);
            rectWidth = max(rectWidth, textWidth(selectedItem.modName));
            rectWidth += 40;
            rect(selectedItem.position.x - rectWidth / 2, selectedItem.position.y + selectedItem.scaledHeight * 0.25 + 60, rectWidth, 85);

            fill(0);
            textSize(30);
            text(selectedItem.displayName, selectedItem.position.x, selectedItem.position.y + selectedItem.scaledHeight * 0.25 + 100);
            textSize(20);
            text(selectedItem.modName, selectedItem.position.x, selectedItem.position.y + selectedItem.scaledHeight * 0.25 + 130);
            if (mouseIsPressed) {
                statusClickDisabled = true;
                statusSelectingItem = false;
                cursor(ARROW);
                loadCraftingTree();
            }
        }
    // Display crafting tree
    } else {
        for (item of treeItems) {
            item.display(mousePos);
            item.update(treeItems);
        }

        statusHoveringOverItem = false;
        cursor(ARROW);
        for (item of treeItems) {
            if (item.hoveredOver) {
                statusHoveringOverItem = true;
                push();
                translate(item.position.x, item.position.y);
                cursor("pointer");

                fill(255, 255, 255, 70);
                circle(0, 0, 30000);
                fill(255);
                textSize(25);
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
                    rectHeight = (item.inGameItem.sprite.height + craftingStation.sprite.height + 240);
                } else if (item.inGameItem.acquisition != "") {
                    rectWidth = max(rectWidth, textWidth(item.inGameItem.acquisition) + 55);
                    rectHeight = (item.inGameItem.sprite.height + 240);
                } else {
                    rectHeight = (item.inGameItem.sprite.height + 132);
                    cursor(ARROW);
                }

                rect(-rectWidth / 2, -(item.inGameItem.sprite.height / 2) - 45, rectWidth, rectHeight);
                image(item.inGameItem.sprite, -(item.inGameItem.sprite.width / 1.1), -(item.inGameItem.sprite.height / 1.1),
                      item.inGameItem.sprite.width * 1.8, item.inGameItem.sprite.height * 1.8)
                fill(0);
                textSize(25);
                text(item.inGameItem.displayName, 0, (item.inGameItem.sprite.height / 2) + 60);
                textSize(15);

                if (craftingStation != null) {
                    text("Crafted at " + craftingStation.displayName, 0, (item.inGameItem.sprite.height / 2) + 110);
                    image(craftingStation.sprite, -(craftingStation.sprite.width / 2), (item.inGameItem.sprite.height / 2) + 125,
                          craftingStation.sprite.width, craftingStation.sprite.height);
                    text("(Click to open wiki page)", 0, (item.inGameItem.sprite.height / 2) + craftingStation.sprite.height + 170)
                } else if (item.inGameItem.acquisition != "") {
                    text(item.inGameItem.acquisition, 0, (item.inGameItem.sprite.height / 2) + 110);
                    text("(Click to open wiki page)", 0, (item.inGameItem.sprite.height / 2) + 170)
                }
                pop();
            }
        }
    }

    // Display control toggle message
    if (firstLoadTime != 0 && frameCount - firstLoadTime < 300 && !statusDisplayControls && !statusLoadingSprites) {
        let textOpacity = map(frameCount - firstLoadTime, 0, 300, 2000, 0);
        textSize(25 * zoomLevel);
        textAlign(LEFT);
        fill(255, 255, 255, textOpacity);
        text("Press enter to toggle controls", (-width / 2 - 5) * zoomLevel + cameraPan.x + 2, (-height / 2 + 25) * zoomLevel + cameraPan.y + 2);
        fill(0, 0, 0, textOpacity);
        text("Press enter to toggle controls", (-width / 2 - 5) * zoomLevel + cameraPan.x, (-height / 2 + 25) * zoomLevel + cameraPan.y);
        textAlign(CENTER);
    }

    // Display keyboard controls
    if (statusDisplayControls) {
        let textPosition = new p5.Vector((-width / 2 - 5) * zoomLevel + cameraPan.x, (-height / 2) * zoomLevel + cameraPan.y);
        textSize(20 * zoomLevel);
        textAlign(LEFT);
        fill(255);
        text("Click and drag to pan around", textPosition.x + 2, textPosition.y + 25 * zoomLevel + 2);
        text("Scroll or use arrow keys to zoom in and out", textPosition.x + 2, textPosition.y + 52 * zoomLevel + 2);
        text("ESC to choose a different item", textPosition.x + 2, textPosition.y + 79 * zoomLevel + 2);
        text("Click on an item to open its wiki page", textPosition.x + 2, textPosition.y + 106 * zoomLevel + 2);
        text("Enter to close controls", textPosition.x + 2, textPosition.y + 133 * zoomLevel + 2);
        fill(0);
        text("Click and drag to pan around", textPosition.x, textPosition.y + 25 * zoomLevel);
        text("Scroll or use arrow keys to zoom in and out", textPosition.x, textPosition.y + 52 * zoomLevel);
        text("ESC to choose a different item", textPosition.x, textPosition.y + 79 * zoomLevel);
        text("Click on an item to open its wiki page", textPosition.x, textPosition.y + 106 * zoomLevel);
        text("Enter to close controls", textPosition.x, textPosition.y + 133 * zoomLevel);
        textAlign(CENTER);
    }
}

function windowResized() {
    resizeCanvas(windowWidth - 20, windowHeight - 20);
    cameraHeight = (windowHeight/2) / tan(PI/6);
    cam.setPosition(cameraPan.x, cameraPan.y, cameraHeight);
}

function keyPressed() {
    if (keyCode == ESCAPE) {
        statusDragging = false;
        statusDisplayControls = false;
        cameraPan.set(0, 0);
        statusSelectingItem = true;
    } else if (keyCode == UP_ARROW) {
        if (!statusLoadingSprites && !statusSelectingItem) {
            zoomLevel = max(zoomLevel * 0.9 * 0.9, 0.4);
        }
    } else if (keyCode == DOWN_ARROW) {
        if (!statusLoadingSprites && !statusSelectingItem) {
            zoomLevel = min(zoomLevel * 1.1 * 1.1, 9.5);
        }
    } else if (keyCode == ENTER) {
        if (!statusLoadingSprites && !statusSelectingItem) {
            statusDisplayControls = !statusDisplayControls;
            firstLoadTime = -400; // Prevents the toggle controls message from displaying again
        }
    }
}

function mousePressed() {
    if (!statusDragging && !statusHoveringOverItem && !statusLoadingSprites && !statusSelectingItem) {
        dragStart.set(mouseX, mouseY);
        panStart.set(cameraPan);
        statusDragging = true;
    }
}

function mouseReleased() {
    if (statusDragging) {
        statusDragging = false;
    }
}

function mouseClicked() {
    if (statusClickDisabled) {
        statusClickDisabled = false;
    } else if (statusHoveringOverItem) {
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
    if (!statusLoadingSprites && !statusSelectingItem) {
        if (mouseEvent.delta > 0) {
            zoomLevel = min(zoomLevel * map(mouseEvent.delta, 0, 80, 1, 1.1), 9.5);
        } else {
            zoomLevel = max(zoomLevel * map(mouseEvent.delta, 0, -80, 1, 0.9), 0.4);
        }
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

function loadSprites() {
    let spritesToLoad = [];
    for (let i = 0; i < treeItems.length; i ++) {
        if (treeItems[i].inGameItem.sprite == null) {
            if (!spritesToLoad.includes(treeItems[i].inGameItem.name)) {
                append(spritesToLoad, treeItems[i].inGameItem.name);
            }
        }
    }

    if (spritesToLoad.length > 0) {
        statusLoadingSprites = true;
        spritesLoaded = 0;
        spritesTotal = spritesToLoad.length;
        for (let i = 0; i < treeItems.length; i ++) {
            if (treeItems[i].inGameItem.sprite == null) {
                let newImage = loadImage("images/" + treeItems[i].inGameItem.name + ".png", incrementspritesLoaded);
                treeItems[i].inGameItem.sprite = newImage;
                inGameItems[treeItems[i].inGameItem.id].sprite = newImage;
            }
        }
    } else {
        statusLoadingSprites = false;
    }
}

function incrementspritesLoaded(image) {
    spritesLoaded ++;
    if (spritesLoaded >= spritesTotal) {
        statusLoadingSprites = false;
    }
}

function loadCraftingTree() {
    treeItems = [];

    itemSpacing = selectedItem.itemSpacing;
    firstItem = new Item(0, 0, selectedItem.inGameItem, 1, null);
    treeItems.push(firstItem);
    loadItemRecursive(selectedItem.inGameItem, firstItem);

    loadSprites();

    for (treeItem of treeItems) {
        countChildrenRecursive(treeItem, treeItem.inGameItem, inGameItems);
    }

    for (treeItem of treeItems) {
        placeChildrenRadially(treeItem, treeItems[0], treeItems);
    }

    zoomLevel = 1.2;
    cameraPan.set(0, 0);

    if (firstLoadTime == 0) {
        firstLoadTime = frameCount;
    }
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
