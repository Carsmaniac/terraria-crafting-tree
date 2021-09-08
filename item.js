class Item {
    constructor(x, y, inGameItem, quantity, parent, itemSpacing) {
        // this.position = new p5.Vector(x, y);
        this.position = new p5.Vector();
        this.inGameItem = inGameItem;
        this.quantityNeeded = quantity;
        this.parent = parent;
        this.socialDistance = 100;
        this.children = 0;
        this.hoveredOver = false;

        if (this.parent != null) {
            this.itemSpacingIndex = parent.itemSpacingIndex + 1;
            if (itemSpacing != null) {
                this.itemSpacing = itemSpacing[this.itemSpacingIndex];
            }
            if (this.parent.inGameItem.name.substring(0, 4) == "any-") {
                this.quantityNeeded = parent.quantityNeeded;
                this.quantityTotal = parent.quantityTotal;
            } else {
                this.quantityTotal = ceil(this.quantityNeeded * this.parent.quantityTotal / this.parent.inGameItem.quantityMade);
            }
        } else {
            this.itemSpacingIndex = -1;
            this.quantityTotal = 1;
            this.socialDistance = 0;
        }
    }

    displayItemRadial() {
        if (this.parent == null) {
            if (!this.hoveredOver) {
                noStroke();
                fill(255);
                ellipse(this.position.x, this.position.y, this.socialDistance + 40);
            }
        }
        if (this.position.x + (this.socialDistance / 2) > topCorner.x && this.position.x - (this.socialDistance / 2) < bottomCorner.x && this.position.y + (this.socialDistance / 2) > topCorner.y && this.position.y - (this.socialDistance / 2) < bottomCorner.y) {
            image(this.inGameItem.sprite, this.position.x-(this.inGameItem.sprite.width / 2) - 3, this.position.y-(this.inGameItem.sprite.height / 2) - 3, this.inGameItem.sprite.width * 1.1, this.inGameItem.sprite.height * 1.1);
        }
    }

    displayArrowRadial() {
        fill(0);
        push();
        translate(this.arrowStart.x, this.arrowStart.y);
        rotate(p5.Vector.sub(this.arrowEnd, this.arrowStart).heading() - HALF_PI);
        // Lines are drawn on top of all other shapes, including the fade-out white overlay when hovering, so a rect is used instead
        rect(-0.75, 5, 1.5, dist(this.arrowStart.x, this.arrowStart.y, this.arrowEnd.x, this.arrowEnd.y) - 5);
        pop();
        push();
        translate(this.arrowEnd.x, this.arrowEnd.y);
        rotate(p5.Vector.sub(this.arrowEnd, this.arrowStart).heading() + HALF_PI);
        rotate(PI);
        triangle(-4, -5, 4, -5, 0, 10);
        pop();
    }

    displayHover(craftingStations) {
        push();
        translate(this.position.x, this.position.y);
        cursor("pointer");

        let displayedHeight, displayedWidth;
        if (selectedLayout == "radial") {
            displayedHeight = this.inGameItem.sprite.height;
            displayedWidth = this.inGameItem.sprite.width;
        } else {
            displayedHeight = this.scaledHeight;
            displayedWidth = this.scaledWidth;
        }

        fill(200, 200, 200, 70);
        circle(0, 0, 30000);
        fill(255);
        textSize(25);
        let nameAndQuantity = this.inGameItem.displayName;
        if (this.quantityNeeded > 1) {
            nameAndQuantity = concat(nameAndQuantity, " x" + this.quantityNeeded);
        }
        if (this.quantityTotal > 1) {
            nameAndQuantity = concat(nameAndQuantity, " (x" + this.quantityTotal + " total)");
        }
        let rectWidth = max(160, textWidth(this.inGameItem.displayName) + 65);
        let rectHeight = 300;
        textSize(15);
        rectWidth = max(rectWidth, textWidth("(Click to open wiki page)") + 65);

        let craftingStation = null;
        for (let i = 0; i < craftingStations.length; i ++) {
            if (craftingStations[i].name == this.inGameItem.craftingStation) {
                craftingStation = craftingStations[i];
            }
        }

        if (craftingStation != null && this.inGameItem.acquisition != "") {
            if (craftingStation.name == "by-hand") {
                rectWidth = max(rectWidth, textWidth(this.inGameItem.acquisition) + 65);
                rectWidth = max(rectWidth, textWidth("Or crafted by hand") + 65);
                rectHeight = (displayedHeight * 1.8 + 265);
            } else {
                rectWidth = max(rectWidth, textWidth(this.inGameItem.acquisition) + 65);
                rectWidth = max(rectWidth, textWidth("Or crafted at " + craftingStation.displayName) + 65);
                rectHeight = (displayedHeight * 1.8 + craftingStation.sprite.height + 265);
            }
        } else if (craftingStation != null) {
            if (craftingStation.name == "by-hand") {
                rectWidth = max(rectWidth, textWidth("Crafted by hand") + 65);
                rectHeight = (displayedHeight * 1.8 + 240);
            } else {
                rectWidth = max(rectWidth, textWidth("Crafted at " + craftingStation.displayName) + 65);
                rectHeight = (displayedHeight * 1.8 + craftingStation.sprite.height + 240);
            }
        } else if (this.inGameItem.acquisition != "") {
            rectWidth = max(rectWidth, textWidth(this.inGameItem.acquisition) + 65);
            rectHeight = (displayedHeight * 1.8 + 240);
        } else {
            rectHeight = (displayedHeight * 1.8 + 132);
            cursor(ARROW);
        }

        let quantityText;
        let quantityOffset = 0;
        if (this.quantityNeeded > 1 && this.quantityTotal > this.quantityNeeded) {
            quantityText = "(x" + this.quantityNeeded + ", x" + this.quantityTotal + " total)";
            quantityOffset = 25;
        } else if (this.quantityNeeded > 1) {
            quantityText = "(x" + this.quantityNeeded + ")";
            quantityOffset = 25;
        } else if (this.quantityTotal > this.quantityNeeded) {
            quantityText = "(x" + this.quantityTotal + " total)";
            quantityOffset = 25;
        }
        rectHeight += quantityOffset;

        rect(-rectWidth / 2, -(displayedHeight / 1.2) - 45, rectWidth, rectHeight);
        image(this.inGameItem.sprite, -(displayedWidth / 1.1), -(displayedHeight / 1.1),
              displayedWidth * 1.8, displayedHeight * 1.8)
        fill(0);
        textSize(25);
        text(this.inGameItem.displayName, 0, (displayedHeight / 1.2) + 60);
        textSize(15);
        if (quantityOffset > 0) {
            text(quantityText, 0, (displayedHeight / 1.2) + 90);
        }

        if (craftingStation != null && this.inGameItem.acquisition != "") {
            text(this.inGameItem.acquisition, 0, (displayedHeight / 1.2) + quantityOffset + 105);
            if (craftingStation.name == "by-hand") {
                text("Or crafted by hand", 0, (displayedHeight / 1.2) + quantityOffset + 135);
                text("(Click to open wiki page)", 0, (displayedHeight / 1.2) + quantityOffset + 195)
            } else {
                text("Or crafted at " + craftingStation.displayName, 0, (displayedHeight / 1.2) + quantityOffset + 135);
                image(craftingStation.sprite, -(craftingStation.sprite.width / 2), (displayedHeight / 1.2) + quantityOffset + 150,
                      craftingStation.sprite.width, craftingStation.sprite.height);
                text("(Click to open wiki page)", 0, (displayedHeight / 1.2) + craftingStation.sprite.height + quantityOffset + 195)
            }
        } else if (craftingStation != null) {
            if (craftingStation.name == "by-hand") {
                text("Crafted by hand", 0, (displayedHeight / 1.2) + quantityOffset + 110);
                text("(Click to open wiki page)", 0, (displayedHeight / 1.2) + quantityOffset + 170)
            } else {
                text("Crafted at " + craftingStation.displayName, 0, (displayedHeight / 1.2) + quantityOffset + 110);
                image(craftingStation.sprite, -(craftingStation.sprite.width / 2), (displayedHeight / 1.2) + quantityOffset + 125,
                      craftingStation.sprite.width, craftingStation.sprite.height);
                text("(Click to open wiki page)", 0, (displayedHeight / 1.2) + craftingStation.sprite.height + quantityOffset + 170)
            }
        } else if (this.inGameItem.acquisition != "") {
            text(this.inGameItem.acquisition, 0, (displayedHeight / 1.2) + quantityOffset + 110);
            text("(Click to open wiki page)", 0, (displayedHeight / 1.2) + quantityOffset + 170)
        }
        pop();
    }

    displayLinesTree(zoomLevel, treeBranchWidth) {
        fill(0);
        if (this.parent != null) {
            if (selectedLayout == "treeTop") {
                if (this.position.x > topCorner.x && this.position.x < bottomCorner.x && this.position.y - this.branchLength < bottomCorner.y && this.position.y > topCorner.y) {
                    rect(this.position.x - (treeBranchWidth / 2), this.position.y - this.branchLength, treeBranchWidth, this.branchLength);
                }
            } else if (selectedLayout == "treeLeft") {
                if (this.position.y > topCorner.y && this.position.y < bottomCorner.y && this.position.x - this.branchLength < bottomCorner.x && this.position.x > topCorner.x) {
                    rect(this.position.x - this.branchLength, this.position.y - (treeBranchWidth / 2), this.branchLength, treeBranchWidth);
                }
            } else if (selectedLayout == "treeBottom") {
                if (this.position.x > topCorner.x && this.position.x < bottomCorner.x && this.position.y < bottomCorner.y && this.position.y + this.branchLength > topCorner.y) {
                    rect(this.position.x - (treeBranchWidth / 2), this.position.y, treeBranchWidth, this.branchLength);
                }
            } else if (selectedLayout == "treeRight") {
                if (this.position.y > topCorner.y && this.position.y < bottomCorner.y && this.position.x < bottomCorner.x && this.position.x + this.branchLength > topCorner.x) {
                    rect(this.position.x, this.position.y - (treeBranchWidth / 2), this.branchLength, treeBranchWidth);
                }
            }
        }
        if (this.children > 1) {
            if (selectedLayout == "treeTop" || selectedLayout == "treeBottom") {
                if (this.position.y > topCorner.y && this.position.y < bottomCorner.y && this.position.x + this.trunkLength > topCorner.x && this.position.x - this.trunkLength < bottomCorner.x) {
                    rect(this.position.x - (this.children * treeBranchSpacing / 2) - (treeBranchWidth / 2) + this.trunkTopOffset, this.position.y - (treeBranchWidth / 2),
                    this.trunkLength, treeBranchWidth);
                }
            } else if (selectedLayout == "treeLeft" || selectedLayout == "treeRight") {
                if (this.position.x > topCorner.x && this.position.x < bottomCorner.x && this.position.y + this.trunkLength > topCorner.y && this.position.y - this.trunkLength < bottomCorner.y) {
                    rect(this.position.x - (treeBranchWidth / 2), this.position.y - (this.children * treeBranchSpacing / 2) - (treeBranchWidth / 2) + this.trunkTopOffset,
                    treeBranchWidth, this.trunkLength);
                }
            }
        }
    }

    displayItemTree(zoomLevel) {
        if (this.position.x + (this.scaledWidth / 2) + 7.5 > topCorner.x && this.position.x - (this.scaledWidth / 2) - 7.5 < bottomCorner.x && this.position.y + (this.scaledHeight / 2) + 7.5 > topCorner.y && this.position.y - (this.scaledHeight / 2) - 7.5 < bottomCorner.y) {
            fill(240);
            rect(this.position.x - (this.scaledWidth / 2) - 7.5, this.position.y - (this.scaledHeight / 2) - 7.5, this.scaledWidth + 15, this.scaledHeight + 15);
            if (zoomLevel > 4.5) {
                fill(200);
                ellipse(this.position.x, this.position.y, 30);
            } else {
                image(this.inGameItem.sprite, this.position.x - this.scaledWidth * 0.5, this.position.y - this.scaledHeight * 0.5,
                      this.scaledWidth, this.scaledHeight);
            }
        }
    }

    update(mousePos, selectedLayout) {
        if (selectedLayout == "radial") {
            this.socialDistance = max(this.inGameItem.sprite.width, this.inGameItem.sprite.height) * 1.6 + 10;
            if (this.parent != null) {
                this.arrowStart = p5.Vector.sub(this.position, this.parent.position);
                this.arrowStart.setMag(-this.socialDistance / 2);
                this.arrowStart.add(this.position);
                this.arrowEnd = p5.Vector.sub(this.parent.position, this.position);
                this.arrowEnd.setMag(-this.parent.socialDistance / 2 - 20);
                this.arrowEnd.add(this.parent.position);
            }
        } else {
            if (this.inGameItem.sprite.height > this.inGameItem.sprite.width) {
                this.scaleFactor = min(75 / this.inGameItem.sprite.height, 1);
            } else {
                this.scaleFactor = min(75 / this.inGameItem.sprite.width, 1);
            }
            this.scaledHeight = this.inGameItem.sprite.height * this.scaleFactor;
            this.scaledWidth = this.inGameItem.sprite.width * this.scaleFactor;

            this.trunkLength = this.children * treeBranchSpacing - this.trunkTopOffset - this.trunkBottomOffset + treeBranchWidth;
            treeBranchWidth = map(zoomLevel, 2.6, 10, 5, 13);

            this.socialDistance = max(this.scaledHeight, this.scaledWidth);
        }

        if (dist(mousePos.x, mousePos.y, this.position.x, this.position.y) < max(this.socialDistance / 2, 25)) {
            this.hoveredOver = true;
        } else {
            this.hoveredOver = false;
        } // TODO: Replace this with a quadtree
    }
}
