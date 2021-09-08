// I hope you like global variables

let inGameItemsData; // JSON containing inGameItems
let craftingTreeItemsData; // JSON containing craftingStations and selectableItems
let treeItems = []; // An item that appears on the crafting tree, with a corresponding inGameItem
let inGameItems; // An in-game item from the game or one of the supported mods
let craftingStations; // A crafting station (anvil, furnace etc) and its sprite
let selectableItems; // An item selectable at load which will serve as the central/top level item in the crafting tree

let statusSelectingItem = true; // The item selection screen is displayed
let statusSelectingLayout = false; // The layout selection screen is displayed
let statusClickDisabled = false; // Disables opening a wiki page or panning around, to avoid accidental clicks on loading the tree
let statusLoadingSprites = false; // Sprites are being loaded, and the "Loading sprites" screen is displayed
let statusDisplayControls = false; // Keyboard controls are displayed in the top left corner
let statusHoveringOverItem = false; // A treeItem is being hovered over, and its information displayed
let statusDragging = false; // The mouse is being clicked and dragged, and the view is panning

let selectedItem; // The chosen selectableItem, or the one hovered over while statusSelectingItem

let spritesTotal = 0; // Number of sprites to be loaded during a statusLoadingSprites
let spritesLoaded = 0; // Sprites loaded so far, for tracking progress

let openSansBold; // Font file used for UI text

let cameraPan = new p5.Vector(0, 0); // Current position of the camera, relative to the centre of the crafting tree
let cameraHeight; // Distance from the camera to the canvas, affects visual zoom
let zoomLevel = 1; // Zoom percent relative to 1x, higher zooms out, affects cameraHeight
let dragStart = new p5.Vector(); // Mouse position at the beginning of a drag
let dragMouse = new p5.Vector(); // Mouse position during a drag, relative to dragStart and accounting for zoomLevel
let panStart = new p5.Vector(); // cameraPan at the beginning of a drag
let mousePos = new p5.Vector(); // Mouse position on the canvas, accounting for cameraPan and zoomLevel

let firstLoadTime = 0; // frameCount when first loading a tree, determines when to fade out control toggle message

let topCorner = new p5.Vector(); // Top left corner of the screen, accounting for cameraPan and zoomLevel
let bottomCorner = new p5.Vector(); // Bottom right corner of the screen, accounting for cameraPan and zoomLevel

let layoutImages = {}; // Images to serve as buttons on the layout selection screen
let layoutImageList = ["treeTop", "treeLeft", "treeBottom", "treeRight", "radial", "disabled"]; // Each layoutImage that needs to be loaded
let selectedLayout = ""; // The selected crafting tree layout - tree or radial
let treeBranchSpacing = 75; // Distance between branches when using tree layout
let treeBranchLength; // Length of each level of branches when using tree layout
let treeBranchWidth = 5; // Width of the lines connecting items when using tree layout

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

    cameraHeight = (height/2) / tan(PI/6);
    cam = createCamera();
    cam.setPosition(cameraPan.x, cameraPan.y, cameraHeight);

    inGameItems = inGameItemsData.inGameItems;
    craftingStations = craftingTreeItemsData.craftingStations;
    selectableItems = craftingTreeItemsData.selectableItems;
    statusLoadingSprites = true;
    spritesTotal = selectableItems.length + craftingStations.length + layoutImageList.length;
    for (let i = 0; i < selectableItems.length; i ++) {
        for (inGameItem of inGameItems) {
            if (inGameItem.name == selectableItems[i].name) {
                selectableItems[i].inGameItem = inGameItem;
            }
        }
        selectableItems[i].sprite = loadImage("images/" + selectableItems[i].name + ".png", incrementSpritesLoaded);
    }
    for (let i = 0; i < craftingStations.length; i ++) {
        craftingStations[i].sprite = loadImage("images/" + craftingStations[i].name + ".png", incrementSpritesLoaded);
    }
    for (let i = 0; i < layoutImageList.length; i ++) {
        layoutImages[layoutImageList[i]] = loadImage("images/layouts/" + layoutImageList[i] + ".png", incrementSpritesLoaded);
    }
}

function draw() {
    background(240);

    cam.setPosition(cameraPan.x, cameraPan.y, cameraHeight * zoomLevel);

    if (statusDragging) {
        dragMouse.x = (mouseX - dragStart.x) * zoomLevel;
        cameraPan.set(panStart.x - ((mouseX - dragStart.x) * zoomLevel), panStart.y - ((mouseY - dragStart.y) * zoomLevel));
    }

    topCorner.x = 0 - (width / 2) + cameraPan.x + (cameraPan.x * (-(zoomLevel - 1) / zoomLevel));
    topCorner.y = 0 - (height / 2) + cameraPan.y + (cameraPan.y * (-(zoomLevel - 1) / zoomLevel));
    topCorner.setMag(topCorner.mag() * zoomLevel);
    bottomCorner.x = width - (width / 2) + cameraPan.x + (cameraPan.x * (-(zoomLevel - 1) / zoomLevel))
    bottomCorner.y = height - (height / 2) + cameraPan.y + (cameraPan.y * (-(zoomLevel - 1) / zoomLevel));
    bottomCorner.setMag(bottomCorner.mag() * zoomLevel);
    mousePos.x = map(mouseX, 0, width, topCorner.x, bottomCorner.x);
    mousePos.y = map(mouseY, 0, height, topCorner.y, bottomCorner.y);

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
        if (!statusSelectingLayout) {
            selectedItem = null;
        }
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
            if (!statusSelectingLayout) {
                if (dist(mousePos.x, mousePos.y, selectableItem.position.x, selectableItem.position.y) < 45) {
                  selectedItem = selectableItem;
                }
            }
        }

        cursor(ARROW);
        // Display layout selection screen
        if (statusSelectingLayout) {
            fill(200, 200, 200, 70);
            circle(0, 0, 30000);
            fill(255);
            rect(-400, -175, 800, 350);
            fill(0);
            text("Choose a crafting tree layout", 0, -100);
            image(layoutImages["treeTop"], -360, -60, 120, 120);
            image(layoutImages["treeLeft"], -210, -60, 120, 120);
            image(layoutImages["treeBottom"], -60, -60, 120, 120);
            image(layoutImages["treeRight"], 90, -60, 120, 120);
            if (selectedItem.radial) {
                image(layoutImages["radial"], 240, -60, 120, 120);
            } else {
                image(layoutImages["disabled"], 240, -60, 120, 120);
            }
            textSize(27);
            fill(0);
            if (mousePos.y < 50 && mousePos.y > -50) {
                cursor("pointer");
                if (mousePos.x < -250 && mousePos.x > -350) {
                    selectedLayout = "treeTop";
                    text("Tree with the final product at the top", 0, 120);
                } else if (mousePos.x < -100 && mousePos.x > -200) {
                    selectedLayout = "treeLeft";
                    text("Tree with the final product on the left", 0, 120);
                } else if (mousePos.x < 50 && mousePos.x > -50) {
                    selectedLayout = "treeBottom";
                    text("Tree with the final product at the bottom", 0, 120);
                } else if (mousePos.x < 200 && mousePos.x > 100) {
                    selectedLayout = "treeRight";
                    text("Tree with the final product on the right", 0, 120);
                } else if (mousePos.x < 350 && mousePos.x > 250) {
                    if (selectedItem.radial) {
                        selectedLayout = "radial";
                        text("Radial tree with the final product in the centre", 0, 120);
                    } else {
                        selectedLayout = "disabled";
                        fill(150);
                        text("This crafting tree is too crowded for the radial layout", 0, 120);
                    }
                } else {
                    cursor(ARROW);
                    selectedLayout = "";
                }
            }
            if (mouseIsPressed && !statusClickDisabled) {
                if (mousePos.x > 400 || mousePos.x < -400 || mousePos.y > 175 || mousePos.y < -175) {
                    statusSelectingLayout = false;
                    statusClickDisabled = true;
                } else if (selectedLayout != "" && selectedLayout != "disabled") {
                    statusClickDisabled = true;
                    statusSelectingItem = false;
                    statusSelectingLayout = false;
                    cursor(ARROW);
                    loadCraftingTree();
                }
            }
        } else if (selectedItem != null) {
            cursor("pointer");
            fill(200, 200, 200, 50);
            circle(0, 0, 30000);
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
            if (mouseIsPressed && !statusClickDisabled) {
                statusSelectingLayout = true;
                statusClickDisabled = true;
                cursor(ARROW);
            }
        }
    // Display crafting tree
    } else {
        if (selectedLayout == "radial") {
            for (item of treeItems) {
                item.update(mousePos, selectedLayout);
                item.displayItemRadial();
                if (item.parent != null) {
                    item.displayArrowRadial(mousePos);
                }
            }
        } else {
            for (item of treeItems) {
                item.update(mousePos, selectedLayout);
                item.displayLinesTree(zoomLevel, treeBranchWidth);
            }
            for (item of treeItems) {
                item.displayItemTree(zoomLevel);
            }
        }

        statusHoveringOverItem = false;
        cursor(ARROW);
        for (item of treeItems) {
            if (item.hoveredOver) {
                statusHoveringOverItem = true;
                item.displayHover(craftingStations);
            }
        }
    }

    // Display control toggle message
    if (firstLoadTime != 0 && frameCount - firstLoadTime < 300 && !statusDisplayControls && !statusLoadingSprites) {
        let textOpacity = map(frameCount - firstLoadTime, 0, 300, 2000, 0);
        textSize(25 * zoomLevel);
        textAlign(LEFT);
        fill(255, 255, 255, textOpacity);
        text("Press enter to toggle controls", (-width / 2 + 12) * zoomLevel + cameraPan.x, (-height / 2 + 67) * zoomLevel + cameraPan.y);
        fill(0, 0, 0, textOpacity);
        text("Press enter to toggle controls", (-width / 2 + 10) * zoomLevel + cameraPan.x, (-height / 2 + 65) * zoomLevel + cameraPan.y);
        textAlign(CENTER);
    }

    // Display keyboard controls
    if (statusDisplayControls) {
        let textPosition = new p5.Vector((-width / 2 + 10) * zoomLevel + cameraPan.x, (-height / 2 + 5) * zoomLevel + cameraPan.y);
        textSize(20 * zoomLevel);
        textAlign(LEFT);
        fill(255);
        text("Click and drag to pan around", textPosition.x + 2 * zoomLevel, textPosition.y + 27 * zoomLevel);
        text("Scroll or use arrow keys to zoom in and out", textPosition.x + 2 * zoomLevel, textPosition.y + 54 * zoomLevel);
        text("ESC to choose a different item", textPosition.x + 2 * zoomLevel, textPosition.y + 81 * zoomLevel);
        text("Click on an item to open its wiki page", textPosition.x + 2 * zoomLevel, textPosition.y + 108 * zoomLevel);
        text("Enter to close controls", textPosition.x + 2 * zoomLevel, textPosition.y + 135 * zoomLevel);
        fill(0);
        text("Click and drag to pan around", textPosition.x, textPosition.y + 25 * zoomLevel);
        text("Scroll or use arrow keys to zoom in and out", textPosition.x, textPosition.y + 52 * zoomLevel);
        text("ESC to choose a different item", textPosition.x, textPosition.y + 79 * zoomLevel);
        text("Click on an item to open its wiki page", textPosition.x, textPosition.y + 106 * zoomLevel);
        text("Enter to close controls", textPosition.x, textPosition.y + 133 * zoomLevel);
        textAlign(CENTER);
    }

    // Display back button
    if (!statusSelectingItem && !statusLoadingSprites && !statusDisplayControls) {
        if (mousePos.x < (-width / 2 + 112) * zoomLevel + cameraPan.x && mousePos.y < (-height / 2 + 42) * zoomLevel + cameraPan.y) {
            fill(255);
            rect((-width / 2) * zoomLevel + cameraPan.x, (-height / 2) * zoomLevel + cameraPan.y, 112 * zoomLevel, 42 * zoomLevel);
            if (mouseIsPressed && !statusDragging) {
                statusDragging = false;
                statusDisplayControls = false;
                statusHoveringOverItem = false;
                cameraPan.set(0, 0);
                statusSelectingItem = true;
            }
        }
        textSize(25 * zoomLevel);
        textAlign(LEFT);
        fill(255, 255, 255);
        text("< Back", (-width / 2 + 12) * zoomLevel + cameraPan.x, (-height / 2 + 32) * zoomLevel + cameraPan.y);
        fill(0, 0, 0);
        text("< Back", (-width / 2 + 10) * zoomLevel + cameraPan.x, (-height / 2 + 30) * zoomLevel + cameraPan.y);
        textAlign(CENTER);
    }
}

function windowResized() {
    resizeCanvas(windowWidth - 20, windowHeight - 20);
    cameraHeight = (height/2) / tan(PI/6);
    cam.setPosition(cameraPan.x, cameraPan.y, cameraHeight);
}

function keyPressed() {
    if (keyCode == ESCAPE) {
        if (statusSelectingLayout) {
            statusSelectingLayout = false;
        } else {
            statusDragging = false;
            statusDisplayControls = false;
            statusHoveringOverItem = false;
            cameraPan.set(0, 0);
            statusSelectingItem = true;
        }
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
    if (!statusDragging && !statusHoveringOverItem && !statusLoadingSprites && !statusSelectingItem && !statusClickDisabled) {
        // Make sure the mouse isn't over the back button
        if (!((mousePos.x < (-width / 2 + 112) * zoomLevel + cameraPan.x && mousePos.y < (-height / 2 + 42) * zoomLevel + cameraPan.y))) {
            dragStart.set(mouseX, mouseY);
            panStart.set(cameraPan);
            statusDragging = true;
        }
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
            // let tempSpacing = [300, 600, 800, 950, 1100, 1250, 1400, 1550];
            newItem = new Item(newItemPosition.x, newItemPosition.y, inGameItems[ingredient[0]], ingredient[1], parentItem, selectedItem.itemSpacing);
            // TEMP: ig
            // newItem = new Item(newItemPosition.x, newItemPosition.y, inGameItems[ingredient[0]], ingredient[1], parentItem, tempSpacing);
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
                let newImage;
                if (treeItems[i].inGameItem.name.substring(0, 4) == "any-") {
                    newImage = loadImage("images/any.png", incrementSpritesLoaded);
                } else {
                    newImage = loadImage("images/" + treeItems[i].inGameItem.name + ".png", incrementSpritesLoaded);
                }
                treeItems[i].inGameItem.sprite = newImage;
                inGameItems[treeItems[i].inGameItem.id].sprite = newImage;
            }
        }
    } else {
        statusLoadingSprites = false;
    }
}

function incrementSpritesLoaded(image) {
    spritesLoaded ++;
    if (spritesLoaded >= spritesTotal) {
        statusLoadingSprites = false;
        if (!statusSelectingItem && firstLoadTime == 0) {
            firstLoadTime = frameCount;
        }
    }
}

function loadCraftingTree() {
    treeItems = [];

    if (selectedLayout == "radial") {
        itemSpacing = selectedItem.itemSpacing;
        firstItem = new Item(0, 0, selectedItem.inGameItem, 1, null, itemSpacing);
    } else {
        firstItem = new Item(0, 0, selectedItem.inGameItem, 1); // TODO: Does this need a null at the end?
    }
    treeItems.push(firstItem);
    loadItemRecursive(selectedItem.inGameItem, firstItem);

    loadSprites();

    for (treeItem of treeItems) {
        countChildrenRecursive(treeItem, treeItem.inGameItem, inGameItems);
    }

    if (selectedLayout.substring(0, 4) == "tree") {
        for (treeItem of treeItems) {
            placeChildrenTree(treeItem, treeItems);
        }
    } else {
        for (treeItem of treeItems) {
            placeChildrenRadially(treeItem, treeItems[0], treeItems);
        }
    }

    zoomLevel = 1.2;
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
            let newItemPosition = new p5.Vector(0, child.itemSpacing);
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

function placeChildrenTree(parentItem, treeItems) {
    if (parentItem.parent == null) {
        parentItem.branchLength = min(250 + parentItem.children * 2, 600);
    }
    let childList = [];
    for (item of treeItems) {
        if (item.parent == parentItem) {
            append(childList, item);
        }
    }
    let runningTotal = 0;
    for (let i = 0; i < childList.length; i ++) {
        let prevTotal = runningTotal;
        runningTotal += childList[i].children * treeBranchSpacing;
        childList[i].branchLength = max(parentItem.branchLength - 100, 120);
        if (selectedLayout == "treeTop") {
            childList[i].position.y = parentItem.position.y + childList[i].branchLength;
            childList[i].position.x = (runningTotal + prevTotal) / 2 + parentItem.position.x - (treeBranchSpacing * parentItem.children) / 2;
        } else if (selectedLayout == "treeLeft") {
            childList[i].position.x = parentItem.position.x + childList[i].branchLength;
            childList[i].position.y = (runningTotal + prevTotal) / 2 + parentItem.position.y - (treeBranchSpacing * parentItem.children) / 2;
        } else if (selectedLayout == "treeBottom") {
            childList[i].position.y = parentItem.position.y - childList[i].branchLength;
            childList[i].position.x = (runningTotal + prevTotal) / 2 + parentItem.position.x - (treeBranchSpacing * parentItem.children) / 2;
        } else if (selectedLayout == "treeRight") {
            childList[i].position.x = parentItem.position.x - childList[i].branchLength;
            childList[i].position.y = (runningTotal + prevTotal) / 2 + parentItem.position.y - (treeBranchSpacing * parentItem.children) / 2;
        }
    }
    if (childList.length > 1) {
        parentItem.trunkTopOffset = childList[0].children * treeBranchSpacing / 2;
        parentItem.trunkBottomOffset = childList[childList.length - 1].children * treeBranchSpacing / 2;
    }
}
